import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FONTS } from '../styles/typography';
import Ionicons from 'react-native-vector-icons/Ionicons'
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import SummaryCard from '../components/SummaryCard';
import OrderCard from '../components/OrderCard';

const HomeScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Today');
  const [selectedStatus, setSelectedStatus] = useState('Pending');

  // const SummaryCard = ({ color, icon, title, count }) => (
  //   <View style={[styles.summaryCard, { backgroundColor: color }]}>
  //     <Icon name={icon} size={wp('7%')} color="#fff" />
  //     <View style={{
  //       alignItems: 'center'
  //     }}>
  //       <Text style={styles.cardCount}>{count} {'order(s)'}</Text>
  //       <Text style={styles.cardTitle}>{title}</Text>
  //     </View>
  //   </View>
  // );

  const ordersData = [
    {
      id: '1',
      orderNumber: '#ORD5092848779',
      orderDateTime: '23 Feb 2026, 12:46 pm',
      orderType: 'slot',
      slotTime: '7:00 pm',
      amount: '405.98',
      status: 'Pending',
    },
    {
      id: '2',
      orderNumber: '#ORD5092848776',
      orderDateTime: '23 Feb 2026, 1:15 pm',
      orderType: 'express',
      amount: '520.00',
      status: 'Picking',
    },
    {
      id: '3',
      orderNumber: '#ORD5092848777',
      orderDateTime: '23 Feb 2026, 2:30 pm',
      orderType: 'slot',
      slotTime: '8:00 pm',
      amount: '610.00',
      status: 'Packed',
    },
    {
      id: '4',
      orderNumber: '#ORD5092848778',
      orderDateTime: '23 Feb 2026, 2:30 pm',
      orderType: 'slot',
      slotTime: '8:00 pm',
      amount: '610.00',
      status: 'Packed',
    },
  ];

  const filteredOrders = ordersData.filter(
    order => order.status === selectedStatus
  );

  const renderOrderItem = ({ item }) => {
    const slotText =
      item.orderType === 'slot' ? item.slotTime : 'Express';

    return (
      <OrderCard
        orderId={item.orderNumber}
        date={item.orderDateTime}
        slot={slotText}
        amount={item.amount}
        onPress={() => navigation.navigate('OrderDetails')}
        onStartPress={() => navigation.navigate('OrderDetails')}
        selectedStatus={selectedStatus}
      />
    );
  };

  const getOrderCountByStatus = (status) => {
    return ordersData.filter(order => order.status === status).length;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
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
          <Text style={styles.storeText}>Store : Vennala Store</Text>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center'
          }}>
            <TouchableOpacity>
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
        {/* Tabs */}
        {/* <View style={styles.tabRow}>
          {['Today', 'Yesterday', 'Last 7 Days'].map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tab,
                activeTab === tab && styles.activeTab,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View> */}

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
          <Text style={styles.totalText}>TOTAL : 1 order(s)</Text>
        </View>

        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderItem}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No orders found</Text>
          }
          contentContainerStyle={{ paddingBottom: hp('3%') }}
        />
      </View>
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
    padding: wp('4%'),
  },

  storeText: {
    fontSize: wp('4%'),
    // marginBottom: hp('1.5%'),
    fontFamily: FONTS.openSans.semiBold
  },

  tabRow: {
    flexDirection: 'row',
    marginBottom: hp('2%'),
    justifyContent: "space-around"
  },

  tab: {
    // marginRight: wp('5%'),
    paddingBottom: hp('0.1%'),
  },

  activeTab: {
    borderBottomWidth: 2,
    borderColor: '#C93D14',
  },

  tabText: {
    fontSize: wp('3.5%'),
    color: '#999',
    fontFamily: FONTS.openSans.semiBold
  },

  activeTabText: {
    color: '#000',
    fontWeight: '600',
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
});