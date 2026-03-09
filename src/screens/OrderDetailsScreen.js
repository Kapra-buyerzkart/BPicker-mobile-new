import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { FONTS } from '../styles/typography';
import { getOrderDetails, updateOrderStatus } from '../services/ordersService';

const CHECKBOX_STORAGE_KEY_PREFIX = '@picker/order_checked_items';

const groupItemsByCategory = (items) => {
  const grouped = items.reduce((acc, item) => {
    const key = item.category || 'Items';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});

  return Object.keys(grouped).map((title) => ({
    title,
    products: grouped[title],
  }));
};

const OrderDetailsScreen = ({ navigation, route }) => {
  const orderId = route?.params?.orderId;
  const orderNumberFromRoute = route?.params?.orderNumber;
  const isReadOnly = route?.params?.mode === 'view';

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [orderDetails, setOrderDetails] = useState({
    orderId: 0,
    orderNumber: orderNumberFromRoute || '#ORD-NA',
    customer: '-',
    amount: 0,
    payment: '-',
    phone: '-',
    items: [],
  });
  const [checkedItems, setCheckedItems] = useState({});
  const [isCompleteConfirmVisible, setIsCompleteConfirmVisible] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completeError, setCompleteError] = useState('');

  const categories = useMemo(
    () => groupItemsByCategory(orderDetails.items),
    [orderDetails.items]
  );
  const allProducts = useMemo(
    () => categories.flatMap((category) => category.products),
    [categories]
  );
  const isAllChecked = allProducts.length > 0 && allProducts.every((p) => checkedItems[p.id]);

  const getCheckboxStorageKey = (id) => `${CHECKBOX_STORAGE_KEY_PREFIX}_${id}`;

  const loadSavedCheckedItems = async (id) => {
    if (!id) {
      return {};
    }

    try {
      const value = await AsyncStorage.getItem(getCheckboxStorageKey(id));
      return value ? JSON.parse(value) : {};
    } catch {
      return {};
    }
  };

  const saveCheckedItems = async (id, map) => {
    if (!id) {
      return;
    }
    await AsyncStorage.setItem(getCheckboxStorageKey(id), JSON.stringify(map));
  };

  useEffect(() => {
    let isMounted = true;

    const loadOrderDetails = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const details = await getOrderDetails({
          orderId,
          orderNumber: orderNumberFromRoute,
        });
        const savedChecked = await loadSavedCheckedItems(details.orderId || orderId);

        const initialCheckedMap = details.items.reduce((acc, item) => {
          if (Object.prototype.hasOwnProperty.call(savedChecked, item.id)) {
            acc[item.id] = Boolean(savedChecked[item.id]);
          } else {
            acc[item.id] = Boolean(item.checked);
          }
          return acc;
        }, {});

        if (isMounted) {
          setOrderDetails(details);
          setCheckedItems(initialCheckedMap);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error?.response?.data?.message ||
            error?.message ||
            'Unable to fetch order details.'
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadOrderDetails();

    return () => {
      isMounted = false;
    };
  }, [orderId, orderNumberFromRoute]);

  const toggleCheck = async (id) => {
    if (isReadOnly) {
      return;
    }

    setCheckedItems((prev) => {
      const next = {
        ...prev,
        [id]: !prev[id],
      };
      const storageOrderId = orderDetails.orderId || orderId;
      saveCheckedItems(storageOrderId, next);
      return next;
    });
  };

  const InfoRow = ({ label, value }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  const handleConfirmCompletePicking = async () => {
    const currentOrderId = orderDetails.orderId || orderId;
    if (!currentOrderId) {
      setCompleteError('Invalid order selected.');
      return;
    }

    try {
      setCompleteError('');
      setIsCompleting(true);
      await updateOrderStatus({
        orderId: currentOrderId,
        eventKey: 'PACKED',
      });
      setIsCompleteConfirmVisible(false);
      navigation.goBack();
    } catch (error) {
      setCompleteError(
        error?.response?.data?.message ||
        error?.message ||
        'Unable to complete picking.'
      );
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={26} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 26 }} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C93D14" />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          {!!errorMessage && (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          <View style={styles.orderInfoCard}>
            <InfoRow label="Order No" value={orderDetails.orderNumber} />
            <InfoRow label="Items" value={String(orderDetails.items.length)} />
            <InfoRow label="Customer" value={orderDetails.customer} />
            <InfoRow label="Amount" value={`₹ ${Number(orderDetails.amount || 0).toFixed(2)}`} />
            <InfoRow label="Payment" value={orderDetails.payment} />
            <InfoRow label="Phone" value={orderDetails.phone} />
          </View>

          {categories.map((category) => (
            <View key={category.title}>
              <Text style={styles.categoryTitle}>{category.title}</Text>

              {category.products.map((product) => (
                <View key={product.id} style={styles.productCard}>
                  <Image
                    source={{ uri: product.image }}
                    style={styles.productImage}
                  />

                  <View style={{ flex: 1 }}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productMeta}>
                      Qty: {product.qty} | ₹ {Number(product.price || 0).toFixed(2)}
                    </Text>
                  </View>

                  {!isReadOnly && (
                    <TouchableOpacity onPress={() => toggleCheck(product.id)}>
                      <Icon
                        name={checkedItems[product.id]
                          ? 'checkbox-marked'
                          : 'checkbox-blank-outline'}
                        size={26}
                        color={checkedItems[product.id] ? '#4CAF50' : '#999'}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          ))}

          {!isReadOnly && (
            <TouchableOpacity
              disabled={!isAllChecked}
              style={[
                styles.completeBtn,
                { backgroundColor: isAllChecked ? '#4CAF50' : '#ccc' },
              ]}
              onPress={() => {
                setCompleteError('');
                setIsCompleteConfirmVisible(true);
              }}
            >
              <Text style={styles.completeText}>COMPLETE PICKING</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      <Modal
        visible={isCompleteConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCompleteConfirmVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirm Packing</Text>
            <Text style={styles.modalText}>
              Mark order {orderDetails.orderNumber} as packed?
            </Text>
            {!!completeError && (
              <Text style={styles.modalErrorText}>{completeError}</Text>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  if (!isCompleting) {
                    setIsCompleteConfirmVisible(false);
                  }
                }}
                disabled={isCompleting}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalOkButton}
                onPress={handleConfirmCompletePicking}
                disabled={isCompleting}
              >
                {isCompleting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalOkText}>OK</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default OrderDetailsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: wp('3.5%'),
    paddingHorizontal: wp('4%'),
    backgroundColor: '#C93D14',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: wp('4.5%'),
    fontFamily: FONTS.openSans.semiBold,
    color: '#FFFFFF',
  },
  container: {
    padding: wp('4%'),
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: hp('1%'),
    color: '#666',
    fontFamily: FONTS.openSans.semiBold,
  },
  errorCard: {
    backgroundColor: '#FDECEC',
    borderColor: '#F5C2C0',
    borderWidth: 1,
    borderRadius: 8,
    padding: wp('3%'),
    marginBottom: hp('1.2%'),
  },
  errorText: {
    color: '#A94442',
    fontFamily: FONTS.openSans.semiBold,
    fontSize: wp('3.2%'),
  },
  orderInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: hp('2%'),
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  infoLabel: {
    color: '#777',
    fontSize: wp('3.5%'),
    fontFamily: FONTS.openSans.regular,
  },
  infoValue: {
    fontSize: wp('3.7%'),
    fontFamily: FONTS.openSans.regular,
    color: 'black',
    marginLeft: wp('2%'),
    textAlign: 'right',
    flex: 1,
  },
  categoryTitle: {
    fontSize: wp('4%'),
    marginVertical: hp('1.5%'),
    color: 'black',
    fontFamily: FONTS.openSans.semiBold,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: wp('1%'),
    borderRadius: 8,
    marginBottom: hp('1%'),
  },
  productImage: {
    width: wp('14%'),
    height: wp('14%'),
    marginRight: wp('3%'),
  },
  productName: {
    fontSize: wp('3.6%'),
    fontFamily: FONTS.openSans.regular,
    color: 'black',
  },
  productMeta: {
    color: '#777',
    fontSize: wp('3%'),
    fontFamily: FONTS.openSans.regular,
  },
  completeBtn: {
    marginTop: hp('3%'),
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeText: {
    color: '#ffffff',
    fontSize: wp('4%'),
    fontFamily: FONTS.openSans.semiBold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp('8%'),
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: wp('5%'),
  },
  modalTitle: {
    textAlign: 'center',
    color: '#1A1A1A',
    fontFamily: FONTS.openSans.semiBold,
    fontSize: wp('4.2%'),
    marginBottom: hp('1%'),
  },
  modalText: {
    textAlign: 'center',
    color: '#333',
    fontFamily: FONTS.openSans.regular,
    fontSize: wp('3.6%'),
    marginBottom: hp('2%'),
  },
  modalErrorText: {
    color: '#D32F2F',
    textAlign: 'center',
    fontFamily: FONTS.openSans.semiBold,
    marginBottom: hp('1%'),
    fontSize: wp('3.2%'),
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#C93D14',
    borderRadius: 8,
    paddingVertical: hp('1.2%'),
    marginRight: wp('2%'),
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#C93D14',
    fontFamily: FONTS.openSans.semiBold,
  },
  modalOkButton: {
    flex: 1,
    backgroundColor: '#C93D14',
    borderRadius: 8,
    paddingVertical: hp('1.2%'),
    marginLeft: wp('2%'),
    alignItems: 'center',
  },
  modalOkText: {
    color: '#fff',
    fontFamily: FONTS.openSans.semiBold,
  },
});
