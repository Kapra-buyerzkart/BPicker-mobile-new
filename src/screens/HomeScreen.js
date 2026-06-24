import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { FONTS } from '../styles/typography';
import { COLORS, RADIUS, CARD_BORDER, FONT_SIZES, wp, hp } from '../styles/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SummaryCard from '../components/SummaryCard';
import OrderCard from '../components/OrderCard';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import { OrderListSkeleton } from '../components/SkeletonLoader';
import { getOrders, updateOrderStatus } from '../services/ordersService';
import { getStoredUser } from '../services/authService';
import BadgeIcon from '../components/BadgeIcon';
import {
  clearNotificationBadgeCount,
  subscribeNotificationBadgeCount,
} from '../services/oneSignalService';

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
  const [notificationBadgeCount, setNotificationBadgeCount] = useState(0);
  const [selectedOrderId, setSelectedOrderId] = useState(0);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState('');
  const [statusCounts, setStatusCounts] = useState({
    Pending: 0,
    Picking: 0,
    Packed: 0,
  });
  const hasFocusedOnce = useRef(false);
  const hasInitializedRef = useRef(false);
  const skipNextStatusFetchRef = useRef(false);

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

  const loadInitialOrders = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const [pendingOrders, pickingOrders, packedOrders] = await Promise.all([
        getOrders(statusToApiValue.Pending),
        getOrders(statusToApiValue.Picking),
        getOrders(statusToApiValue.Packed),
      ]);

      const ordersByStatus = {
        Pending: pendingOrders,
        Picking: pickingOrders,
        Packed: packedOrders,
      };

      setStatusCounts({
        Pending: pendingOrders.length,
        Picking: pickingOrders.length,
        Packed: packedOrders.length,
      });

      const initialStatus =
        ['Pending', 'Picking', 'Packed'].find(
          (status) => ordersByStatus[status].length > 0
        ) || 'Pending';

      setOrdersData(ordersByStatus[initialStatus]);
      if (initialStatus !== selectedStatus) {
        skipNextStatusFetchRef.current = true;
        setSelectedStatus(initialStatus);
      }
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
        error?.message ||
        'Unable to fetch orders.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialOrders();
  }, []);

  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      return;
    }
    if (skipNextStatusFetchRef.current) {
      skipNextStatusFetchRef.current = false;
      return;
    }
    loadOrders(selectedStatus);
  }, [selectedStatus]);

  useEffect(() => {
    const unsubscribe = subscribeNotificationBadgeCount(setNotificationBadgeCount);
    return unsubscribe;
  }, []);

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

  const pipelineTotal = statusCounts.Pending + statusCounts.Picking + statusCounts.Packed;

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
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.card} />
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back</Text>
            <Text style={styles.storeText} numberOfLines={1}>{storeName || '-'}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => loadOrders(selectedStatus, true)}
              style={styles.iconButton}
              activeOpacity={0.7}
            >
              <Icon name="refresh" size={wp('5.4%')} color={COLORS.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => clearNotificationBadgeCount()}
              style={styles.iconButton}
              activeOpacity={0.7}
            >
              <BadgeIcon count={notificationBadgeCount}>
                <Ionicons name={'notifications-outline'} size={wp('5.4%')} color={COLORS.textPrimary} />
              </BadgeIcon>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
              style={[styles.iconButton, styles.profileButton]}
              activeOpacity={0.7}
            >
              <Ionicons name={'person'} size={wp('5%')} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.body}>
          {/* Summary Cards */}
          <View style={styles.cardGrid}>
            <SummaryCard
              color={COLORS.warning}
              icon="clock-outline"
              title="Pending"
              count={getOrderCountByStatus('Pending')}
              total={pipelineTotal}
              isActive={selectedStatus === 'Pending'}
              onPress={() => setSelectedStatus('Pending')}
            />
            <SummaryCard
              color={COLORS.secondary}
              icon="run"
              title="Picking"
              count={getOrderCountByStatus('Picking')}
              total={pipelineTotal}
              isActive={selectedStatus === 'Picking'}
              onPress={() => setSelectedStatus('Picking')}
            />
            <SummaryCard
              color={COLORS.info}
              icon="human-dolly"
              title="Packed"
              count={getOrderCountByStatus('Packed')}
              total={pipelineTotal}
              isActive={selectedStatus === 'Packed'}
              onPress={() => setSelectedStatus('Packed')}
            />
          </View>

          {/* Total */}
          <View style={styles.totalCard}>
            <View style={styles.totalIconCircle}>
              <Icon name="clipboard-text-outline" size={wp('5.5%')} color={COLORS.primary} />
            </View>
            <Text style={styles.totalText}>
              Total {selectedStatus} Orders
            </Text>
            <Text style={styles.totalCount}>{ordersData.length}</Text>
          </View>

          {isLoading ? (
            <OrderListSkeleton count={3} />
          ) : (
            <>
              {!!errorMessage && (
                <View style={styles.errorCard}>
                  <Icon name="alert-circle-outline" size={wp('5%')} color={COLORS.danger} />
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
                  <EmptyState
                    icon="clipboard-list-outline"
                    title="No orders found"
                    subtitle={`You have no ${selectedStatus.toLowerCase()} orders right now.`}
                  />
                }
                style={styles.list}
                contentContainerStyle={{ paddingBottom: 0 }}
              />
            </>
          )}
        </View>
      </View>

      <ConfirmModal
        visible={isStartConfirmVisible}
        title="Confirm Start Picking"
        message={`Start picking for order ${selectedOrderNumber}?`}
        error={startOrderError}
        confirmLabel="OK"
        cancelLabel="Cancel"
        loading={isStartingOrder}
        onCancel={() => {
          if (!isStartingOrder) {
            setIsStartConfirmVisible(false);
          }
        }}
        onConfirm={handleConfirmStartPicking}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.card,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.6%'),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  greeting: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontFamily: FONTS.openSans.regular,
  },

  storeText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textPrimary,
    fontFamily: FONTS.openSans.semiBold,
    marginTop: 2,
    maxWidth: wp('45%'),
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('2.5%'),
  },

  iconButton: {
    width: wp('10.5%'),
    height: wp('10.5%'),
    borderRadius: wp('5.25%'),
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileButton: {
    backgroundColor: COLORS.primary,
  },

  body: {
    flex: 1,
    paddingHorizontal: wp('4%'),
    paddingTop: hp('1.8%'),
  },

  list: {
    flex: 1,
  },

  cardGrid: {
    flexDirection: 'row',
    marginHorizontal: -wp('1%'),
    marginBottom: hp('1.6%'),
  },

  totalCard: {
    backgroundColor: COLORS.card,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    paddingVertical: hp('1.6%'),
    paddingHorizontal: wp('4%'),
    marginBottom: hp('1.8%'),
    ...CARD_BORDER,
  },

  totalIconCircle: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'),
    backgroundColor: '#FFEDE3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp('3%'),
  },

  totalText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.openSans.semiBold,
  },

  totalCount: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.openSans.bold,
  },

  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('2%'),
    backgroundColor: COLORS.dangerLight,
    borderRadius: RADIUS.md,
    padding: wp('3%'),
    marginBottom: hp('1.2%'),
  },

  errorText: {
    flex: 1,
    color: '#B91C1C',
    fontFamily: FONTS.openSans.semiBold,
    fontSize: FONT_SIZES.sm,
  },
});
