import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { wp, hp, RADIUS, FONT_SIZES } from '../styles/theme';
import { useTheme } from '../theme';
import { FONTS } from '../styles/typography';
import { getOrderDetails, updateOrderStatus } from '../services/ordersService';
import AppHeader from '../components/AppHeader';
import AppButton from '../components/AppButton';
import ConfirmModal from '../components/ConfirmModal';

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
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
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
  const checkedCount = allProducts.filter((p) => checkedItems[p.id]).length;
  const progressPct = allProducts.length > 0 ? (checkedCount / allProducts.length) * 100 : 0;

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

  const InfoRow = ({ label, value, isLast }) => (
    <View style={[styles.infoRow, isLast && styles.infoRowLast]}>
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
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <AppHeader title="Order Details" subtitle={orderDetails.orderNumber} onBackPress={() => navigation.goBack()} />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {!!errorMessage && (
            <View style={styles.errorCard}>
              <Icon name="alert-circle-outline" size={wp('4.4%')} color={colors.danger} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          <View style={styles.orderInfoCard}>
            <InfoRow label="Order No" value={orderDetails.orderNumber} />
            <InfoRow label="Items" value={String(orderDetails.items.length)} />
            <InfoRow label="Customer" value={orderDetails.customer} />
            <InfoRow label="Amount" value={`₹ ${Number(orderDetails.amount || 0).toFixed(2)}`} />
            <InfoRow label="Payment" value={orderDetails.payment} />
            <InfoRow label="Phone" value={orderDetails.phone} isLast />
          </View>

          {!isReadOnly && allProducts.length > 0 && (
            <View style={styles.progressCard}>
              <View style={styles.progressHeaderRow}>
                <Text style={styles.progressLabel}>Picking Progress</Text>
                <Text style={styles.progressCount}>{checkedCount}/{allProducts.length}</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
              </View>
            </View>
          )}

          {categories.map((category) => (
            <View key={category.title}>
              <Text style={styles.categoryTitle}>{category.title}</Text>

              {category.products.map((product) => (
                <View key={product.id} style={styles.productCard}>
                  <FastImage
                    source={{
                      uri: product.image,
                      priority: FastImage.priority.normal,
                    }}
                    style={styles.productImage}
                    resizeMode={FastImage.resizeMode.cover}
                  />

                  <View style={{ flex: 1 }}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productMeta}>
                      Qty: {product.qty} | ₹ {Number(product.price || 0).toFixed(2)}
                    </Text>
                  </View>

                  {!isReadOnly && (
                    <TouchableOpacity onPress={() => toggleCheck(product.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                      <Icon
                        name={checkedItems[product.id]
                          ? 'checkbox-marked'
                          : 'checkbox-blank-outline'}
                        size={26}
                        color={checkedItems[product.id] ? colors.success : colors.textMuted}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          ))}

          {!isReadOnly && (
            <AppButton
              label="COMPLETE PICKING"
              variant="success"
              disabled={!isAllChecked}
              onPress={() => {
                setCompleteError('');
                setIsCompleteConfirmVisible(true);
              }}
              style={styles.completeBtn}
            />
          )}
        </ScrollView>
      )}

      <ConfirmModal
        visible={isCompleteConfirmVisible}
        title="Confirm Packing"
        message={`Mark order ${orderDetails.orderNumber} as packed?`}
        error={completeError}
        confirmLabel="OK"
        cancelLabel="Cancel"
        loading={isCompleting}
        onCancel={() => {
          if (!isCompleting) {
            setIsCompleteConfirmVisible(false);
          }
        }}
        onConfirm={handleConfirmCompletePicking}
      />
    </SafeAreaView>
  );
};

export default OrderDetailsScreen;

const makeStyles = (colors) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.card,
  },
  container: {
    padding: wp('4%'),
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: hp('1%'),
    color: colors.textSecondary,
    fontFamily: FONTS.openSans.semiBold,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('2%'),
    backgroundColor: colors.dangerLight,
    borderRadius: RADIUS.md,
    padding: wp('3%'),
    marginBottom: hp('1.2%'),
  },
  errorText: {
    flex: 1,
    color: colors.danger,
    fontFamily: FONTS.openSans.semiBold,
    fontSize: FONT_SIZES.sm,
  },
  orderInfoCard: {
    backgroundColor: colors.card,
    borderRadius: RADIUS.lg,
    paddingHorizontal: wp('4%'),
    marginBottom: hp('1.6%'),
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp('1.2%'),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.openSans.regular,
  },
  infoValue: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.openSans.semiBold,
    color: colors.textPrimary,
    marginLeft: wp('2%'),
    textAlign: 'right',
    flex: 1,
  },
  progressCard: {
    backgroundColor: colors.card,
    borderRadius: RADIUS.lg,
    padding: wp('4%'),
    marginBottom: hp('1.8%'),
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp('1%'),
  },
  progressLabel: {
    color: colors.textPrimary,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.openSans.semiBold,
  },
  progressCount: {
    color: colors.primary,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.openSans.bold,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  categoryTitle: {
    fontSize: FONT_SIZES.lg,
    marginVertical: hp('1.4%'),
    color: colors.textPrimary,
    fontFamily: FONTS.openSans.semiBold,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: wp('2.4%'),
    borderRadius: RADIUS.md,
    marginBottom: hp('1%'),
    borderWidth: 1,
    borderColor: colors.border,
  },
  productImage: {
    width: wp('14%'),
    height: wp('14%'),
    borderRadius: RADIUS.sm,
    marginRight: wp('3%'),
  },
  productName: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.openSans.semiBold,
    color: colors.textPrimary,
  },
  productMeta: {
    color: colors.textSecondary,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.openSans.regular,
    marginTop: 2,
  },
  completeBtn: {
    marginTop: hp('2%'),
    marginBottom: hp('2%'),
  },
});
