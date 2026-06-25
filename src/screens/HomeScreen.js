import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { FONTS } from '../styles/typography';
import { RADIUS, FONT_SIZES, wp, hp } from '../styles/theme';
import { useTheme } from '../theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AnimatedDashboardHeader from '../components/AnimatedDashboardHeader';
import AnimatedStatsBar from '../components/AnimatedStatsBar';
import OrderCard from '../components/OrderCard';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import { OrderListSkeleton } from '../components/SkeletonLoader';
import { getOrders, updateOrderStatus } from '../services/ordersService';
import { getStoredUser } from '../services/authService';
import {
  clearNotificationBadgeCount,
  subscribeNotificationBadgeCount,
} from '../services/oneSignalService';

const TOTAL_COLLAPSE_START = 120;
const TOTAL_COLLAPSE_END = 180;
const TOTAL_CARD_H = hp('9.5%');
const TOTAL_MARGIN_BOTTOM = hp('1.8%');
const TOTAL_TRANSLATE_Y = hp('2%');

const CHROME_TOP_GAP = hp('1.8%');
const CHROME_EXPANDED_H =
  CHROME_TOP_GAP +
  hp('17%') + // AnimatedStatsBar EXPANDED_H
  hp('1.4%') + // stats grid marginBottom
  TOTAL_CARD_H +
  TOTAL_MARGIN_BOTTOM;

const HomeScreen = ({ navigation, route }) => {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler(event => {
    scrollY.value = event.contentOffset.y;
  });
  const totalAnim = useAnimatedStyle(() => ({
    height: interpolate(
      scrollY.value,
      [TOTAL_COLLAPSE_START, TOTAL_COLLAPSE_END],
      [TOTAL_CARD_H, 0],
      Extrapolation.CLAMP,
    ),
    opacity: interpolate(
      scrollY.value,
      [TOTAL_COLLAPSE_START, TOTAL_COLLAPSE_START + 45],
      [1, 0],
      Extrapolation.CLAMP,
    ),
    marginBottom: interpolate(
      scrollY.value,
      [TOTAL_COLLAPSE_START, TOTAL_COLLAPSE_END],
      [TOTAL_MARGIN_BOTTOM, 0],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [TOTAL_COLLAPSE_START, TOTAL_COLLAPSE_END],
          [0, -TOTAL_TRANSLATE_Y],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

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

  console.log(ordersData, 'ordersData===>');
  const statusToApiValue = {
    Pending: 'pending',
    Picking: 'picking',
    Packed: 'packed',
  };

  const loadOrders = async (statusLabel = selectedStatus, refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      scrollY.value = 0;
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
          'Unable to fetch orders.',
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
          status => ordersByStatus[status].length > 0,
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
          'Unable to fetch orders.',
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
    const unsubscribe = subscribeNotificationBadgeCount(
      setNotificationBadgeCount,
    );
    return unsubscribe;
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!hasFocusedOnce.current) {
        hasFocusedOnce.current = true;
        return;
      }
      loadOrders(selectedStatus, true);
    }, [selectedStatus]),
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
    const slotText = item.orderType === 'slot' ? item.slotTime : 'Express';
    const formattedDateTime = formatOrderDateTime(item.orderDateTime);
    const openOrderDetails = mode => {
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

  const formatOrderDateTime = dateValue => {
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

  const pipelineTotal =
    statusCounts.Pending + statusCounts.Picking + statusCounts.Packed;

  const statItems = useMemo(
    () => [
      {
        color: colors.warning,
        icon: 'clock-outline',
        title: 'Pending',
        count: statusCounts.Pending ?? 0,
        total: pipelineTotal,
        isActive: selectedStatus === 'Pending',
        onPress: () => setSelectedStatus('Pending'),
      },
      {
        color: colors.secondary,
        icon: 'run',
        title: 'Picking',
        count: statusCounts.Picking ?? 0,
        total: pipelineTotal,
        isActive: selectedStatus === 'Picking',
        onPress: () => setSelectedStatus('Picking'),
      },
      {
        color: colors.info,
        icon: 'human-dolly',
        title: 'Packed',
        count: statusCounts.Packed ?? 0,
        total: pipelineTotal,
        isActive: selectedStatus === 'Packed',
        onPress: () => setSelectedStatus('Packed'),
      },
    ],
    [colors, statusCounts, pipelineTotal, selectedStatus],
  );

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
          'Unable to start picking for this order.',
      );
    } finally {
      setIsStartingOrder(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.card}
      />
      <View style={styles.container}>
        <AnimatedDashboardHeader
          scrollY={scrollY}
          storeName={storeName}
          notificationBadgeCount={notificationBadgeCount}
          onRefresh={() => loadOrders(selectedStatus, true)}
          onNotifications={() => clearNotificationBadgeCount()}
          onProfile={() => navigation.navigate('Profile')}
        />

        <View style={styles.body}>
          {/* Scrolling content fills the whole body at a constant height. It
              reserves CHROME_EXPANDED_H of top padding for the overlay below,
              so morphing the chrome never resizes this list. */}
          {isLoading ? (
            <View style={styles.loadingWrap}>
              <OrderListSkeleton count={3} />
            </View>
          ) : (
            <Animated.FlatList
              data={ordersData}
              keyExtractor={item => item.id}
              renderItem={renderOrderItem}
              showsVerticalScrollIndicator={false}
              refreshing={isRefreshing}
              onRefresh={() => loadOrders(selectedStatus, true)}
              onScroll={onScroll}
              scrollEventThrottle={16}
              ListHeaderComponent={
                errorMessage ? (
                  <View style={styles.errorCard}>
                    <Icon
                      name="alert-circle-outline"
                      size={wp('5%')}
                      color={colors.danger}
                    />
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  </View>
                ) : null
              }
              ListEmptyComponent={
                <EmptyState
                  icon="clipboard-list-outline"
                  title="No orders found"
                  subtitle={`You have no ${selectedStatus.toLowerCase()} orders right now.`}
                />
              }
              style={styles.list}
              contentContainerStyle={styles.listContent}
            />
          )}

          {/* Collapsing chrome overlay. Absolute + opaque background, so its
              height animations (stats morph, total collapse) cost a tiny
              subtree layout instead of relaying out the whole list. box-none
              lets the list scroll/refresh through the empty areas while the
              stat chips still receive taps. */}
          <View style={styles.chrome} pointerEvents="box-none">
            {/* Summary cards → morphing sticky toolbar */}
            <AnimatedStatsBar scrollY={scrollY} items={statItems} />

            {/* Total — collapses away on deep scroll */}
            <Animated.View style={[styles.totalWrap, totalAnim]}>
              <View style={styles.totalCard}>
                <View style={styles.totalIconCircle}>
                  <Icon
                    name="clipboard-text-outline"
                    size={wp('5.5%')}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.totalText}>
                  Total {selectedStatus} Orders
                </Text>
                <Text style={styles.totalCount}>{ordersData.length}</Text>
              </View>
            </Animated.View>
          </View>
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

const makeStyles = colors =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.card,
    },

    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    body: {
      flex: 1,
    },

    list: {
      flex: 1,
    },

    listContent: {
      paddingTop: CHROME_EXPANDED_H,
      paddingHorizontal: wp('4%'),
      paddingBottom: 0,
    },

    loadingWrap: {
      flex: 1,
      paddingTop: CHROME_EXPANDED_H,
      paddingHorizontal: wp('4%'),
    },

    chrome: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      paddingTop: CHROME_TOP_GAP,
      paddingHorizontal: wp('4%'),
      backgroundColor: colors.background,
    },

    totalWrap: {
      overflow: 'hidden',
    },

    totalCard: {
      backgroundColor: colors.card,
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: RADIUS.lg,
      paddingVertical: hp('1.6%'),
      paddingHorizontal: wp('4%'),
      borderWidth: 1,
      borderColor: colors.border,
    },

    totalIconCircle: {
      width: wp('10%'),
      height: wp('10%'),
      borderRadius: wp('5%'),
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: wp('3%'),
    },

    totalText: {
      flex: 1,
      color: colors.textSecondary,
      fontSize: FONT_SIZES.sm,
      fontFamily: FONTS.openSans.semiBold,
    },

    totalCount: {
      color: colors.textPrimary,
      fontSize: FONT_SIZES.xl,
      fontFamily: FONTS.openSans.bold,
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
  });
