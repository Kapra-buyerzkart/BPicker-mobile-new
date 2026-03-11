import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { FONTS } from '../styles/typography';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import SummaryCard from '../components/SummaryCard';
import OrderCard from '../components/OrderCard';
import { getOrders, updateOrderStatus } from '../services/ordersService';
import { getStoredUser } from '../services/authService';

const HomeScreen = ({ navigation, route }) => {
  const [selectedStatus, setSelectedStatus] = useState('Pending');
  const [ordersData, setOrdersData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [storeName, setStoreName] = useState(route?.params?.storeName || '');
  const [isStartConfirmVisible, setIsStartConfirmVisible] = useState(false);
  const [isStartingOrder, setIsStartingOrder] = useState(false);
  const [startOrderError, setStartOrderError] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(0);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState('');
  const [statusCounts, setStatusCounts] = useState({
    Pending: 0,
    Picking: 0,
    Packed: 0,
  });
  const hasFocusedOnce = useRef(false);

  const statusToApiValue = {
    Pending: 'pending',
    Picking: 'picking',
    Packed: 'packed',
  };

  const loadOrders = async (statusLabel = selectedStatus, refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      setErrorMessage('');
      const orders = await getOrders(statusToApiValue[statusLabel]);
      setOrdersData(orders);
      setStatusCounts(prev => ({
        ...prev,
        [statusLabel]: orders.length,
      }));
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
        error?.message ||
        'Unable to fetch orders.'
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders(selectedStatus);
  }, [selectedStatus]);

  useFocusEffect(
    useCallback(() => {
      if (!hasFocusedOnce.current) {
        hasFocusedOnce.current = true;
        return;
      }
      loadOrders(selectedStatus, true);
    }, [selectedStatus])
  );

  useEffect(() => {
    const routeStoreName = route?.params?.storeName;
    if (routeStoreName) {
      setStoreName(routeStoreName);
      return;
    }

    const loadStoreName = async () => {
      const storedUser = await getStoredUser();
      setStoreName(storedUser?.storeName || '');
    };

    loadStoreName();
  }, [route?.params?.storeName]);

  const renderOrderItem = ({ item }) => {
    const slotText =
      item.orderType === 'slot' ? item.slotTime : 'Express';
    const formattedDateTime = formatOrderDateTime(item.orderDateTime);
    const openOrderDetails = (mode) => {
      navigation.navigate('OrderDetails', {
        orderId: item.orderId,
        orderNumber: item.orderNumber,
        mode,
      });
    };
    const handleStartPress = () => {
      if (selectedStatus === 'Pending') {
        setSelectedOrderId(item.orderId);
        setSelectedOrderNumber(item.orderNumber);
        setStartOrderError('');
        setIsStartConfirmVisible(true);
        return;
      }
      if (selectedStatus === 'Picking') {
        openOrderDetails('edit');
        return;
      }
      openOrderDetails('view');
    };

    return (
      <OrderCard
        orderId={item.orderNumber}
        date={formattedDateTime}
        slot={slotText}
        amount={item.amount}
        onStartPress={handleStartPress}
        selectedStatus={selectedStatus}
      />
    );
  };

  const formatOrderDateTime = (dateValue) => {
    if (!dateValue) {
      return '-';
    }

    const parsedDate = new Date(dateValue);
    if (Number.isNaN(parsedDate.getTime())) {
      return dateValue;
    }

    const day = String(parsedDate.getDate()).padStart(2, '0');
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const year = parsedDate.getFullYear();
    const rawHours = parsedDate.getHours();
    const period = rawHours >= 12 ? 'PM' : 'AM';
    const hours12 = rawHours % 12 || 12;
    const hours = String(hours12).padStart(2, '0');
    const minutes = String(parsedDate.getMinutes()).padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes} ${period}`;
  };

  const getOrderCountByStatus = (status) => {
    return statusCounts[status] ?? 0;
  };

  const handleConfirmStartPicking = async () => {
    if (!selectedOrderId) {
      setStartOrderError('Invalid order selected.');
      return;
    }

    try {
      setStartOrderError('');
      setIsStartingOrder(true);
      await updateOrderStatus({
        orderId: selectedOrderId,
        eventKey: 'PICKING_STARTED',
      });
      setIsStartConfirmVisible(false);
      navigation.navigate('OrderDetails', {
        orderId: selectedOrderId,
        orderNumber: selectedOrderNumber,
        mode: 'edit',
      });
    } catch (error) {
      setStartOrderError(
        error?.response?.data?.message ||
        error?.message ||
        'Unable to start picking for this order.'
      );
    } finally {
      setIsStartingOrder(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View
        style={styles.container}
      // showsVerticalScrollIndicator={false}
      >
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: hp('1.5%'),
          paddingHorizontal: wp('2%')
        }}>
          <Text style={styles.storeText}>Store : {storeName || '-'}</Text>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center'
          }}>
            <TouchableOpacity onPress={() => loadOrders(selectedStatus, true)}>
              <FontAwesome name={'refresh'} size={wp('6%')} color="black" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={{
              borderWidth: 1,
              borderColor: 'black',
              padding: wp('1.3%'),
              borderRadius: 20,
              marginLeft: wp('5%')
            }}>
              <Ionicons name={'person'} size={wp('6%')} color="black" />
            </TouchableOpacity>
          </View>
        </View>
        {/* Summary Cards */}
        <View style={styles.cardGrid}>
          <SummaryCard
            color="#E75B54"
            icon="clock-outline"
            title="Pending"
            count={getOrderCountByStatus('Pending')}
            isActive={selectedStatus === 'Pending'}
            onPress={() => setSelectedStatus('Pending')}
          />
          <SummaryCard
            color="#f4ab35"
            icon="run"
            title="Picking"
            count={getOrderCountByStatus('Picking')}
            isActive={selectedStatus === 'Picking'}
            onPress={() => setSelectedStatus('Picking')}
          />
          <SummaryCard
            color="#4A90E2"
            icon="human-dolly"
            title="Packed"
            count={getOrderCountByStatus('Packed')}
            isActive={selectedStatus === 'Packed'}
            onPress={() => setSelectedStatus('Packed')}
          />
          {/* <SummaryCard
            color="#4CAF50"
            icon="truck"
            title="Dispatched"
            count="0"
          />
          <SummaryCard
            color="#6EC6B8"
            icon="check-circle-outline"
            title="Delivered"
            count="0"
          />
          <SummaryCard
            color="#f3db05"
            icon="cancel"
            title="Cancel/refund"
            count="0"
          /> */}
        </View>

        {/* Total */}
        <View style={styles.totalCard}>
          <Text style={styles.totalText}>
            Total {selectedStatus} Orders : {ordersData.length}
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#C93D14" />
            <Text style={styles.loadingText}>Loading orders...</Text>
          </View>
        ) : (
          <>
            {!!errorMessage && (
              <View style={styles.errorCard}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            <FlatList
              data={ordersData}
              keyExtractor={(item) => item.id}
              renderItem={renderOrderItem}
              showsVerticalScrollIndicator={false}
              refreshing={isRefreshing}
              onRefresh={() => loadOrders(selectedStatus, true)}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No orders found</Text>
              }
              style={styles.list}
              contentContainerStyle={{ paddingBottom: 0 }}
            />
          </>
        )}
      </View>
      <Modal
        visible={isStartConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsStartConfirmVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirm Start Picking</Text>
            <Text style={styles.modalText}>
              Start picking for order {selectedOrderNumber}?
            </Text>
            {!!startOrderError && (
              <Text style={styles.modalErrorText}>{startOrderError}</Text>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  if (!isStartingOrder) {
                    setIsStartConfirmVisible(false);
                  }
                }}
                disabled={isStartingOrder}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalOkButton}
                onPress={handleConfirmStartPicking}
                disabled={isStartingOrder}
              >
                {isStartingOrder ? (
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

export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  container: {
    flex: 1,
    paddingHorizontal: wp('4%'),
    paddingTop: wp('4%'),
    paddingBottom: 0,
  },

  list: {
    flex: 1,
  },

  storeText: {
    fontSize: wp('4%'),
    // marginBottom: hp('1.5%'),
    fontFamily: FONTS.openSans.semiBold
  },

  cardGrid: {
    flexDirection: 'row',
    // flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: hp('0.5%')
  },

  summaryCard: {
    width: '48%',
    borderRadius: 10,
    // padding: 14,
    marginBottom: hp('1.5%'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingVertical: wp('1.5%')
  },

  cardCount: {
    fontSize: wp('4%'),
    color: '#fff',
    // marginTop: 6,
    fontFamily: FONTS.openSans.semiBold
  },

  cardTitle: {
    color: '#fff',
    // marginTop: 4,
    fontSize: wp('3.3%'),
    fontFamily: FONTS.openSans.semiBold
  },

  totalCard: {
    backgroundColor: '#8E44AD',
    padding: wp('3.5%'),
    borderRadius: 10,
    marginVertical: hp('2%'),
  },

  totalText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: wp('4%'),
    fontWeight: '600',
  },

  orderCard: {
    flexDirection: 'row',
    backgroundColor: '#E75B54',
    borderRadius: 10,
    padding: wp('4%'),
    alignItems: 'center',
  },

  orderId: {
    color: '#fff',
    fontSize: wp('3.5%'),
    fontFamily: FONTS.openSans.semiBold
  },

  orderMeta: {
    color: '#fff',
    fontSize: wp('3%'),
    fontFamily: FONTS.openSans.regular,
    marginTop: hp('0.1%'),
  },

  orderRight: {
    alignItems: 'flex-end',
  },

  amount: {
    color: '#fff',
    // fontWeight: '600',
    marginBottom: hp('0.3%'),
    fontFamily: FONTS.openSans.semiBold,
    marginRight: wp('1%'),
    fontSize: wp('3.5%')
  },

  startBtn: {
    backgroundColor: '#7ED957',
    paddingHorizontal: wp('5%'),
    paddingVertical: wp('1%'),
    borderRadius: 6,
  },

  startText: {
    color: '#000',
    fontFamily: FONTS.openSans.semiBold,
    fontSize: wp('3.5%')
    // fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: hp('5%'),
    fontSize: wp('4%'),
    color: '#888',
    fontFamily: FONTS.openSans.semiBold,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: hp('6%'),
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
