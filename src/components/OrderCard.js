import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { FONTS } from '../styles/typography';

const OrderCard = ({
    orderId,
    date,
    slot,
    amount,
    onStartPress,
    selectedStatus
}) => {
    const formattedAmount = Number.isFinite(Number(amount))
        ? Number(amount).toFixed(2)
        : '0.00';

    const cardStyle = [
        styles.orderCard,
        selectedStatus === 'Picking' && styles.orderCardPicking,
        selectedStatus !== 'Pending' && selectedStatus !== 'Picking' && styles.orderCardView,
    ];

    return (
        <View style={cardStyle}>
            <View style={styles.orderLeft}>
                <Text style={styles.orderId}>{orderId}</Text>
                <Text style={styles.orderMeta}>Placed on : {date}</Text>
                <Text style={styles.orderMeta}>Slot : {slot}</Text>
            </View>

            <View style={styles.orderRight}>
                <Text style={styles.amount}>₹ {formattedAmount}</Text>
                <TouchableOpacity
                    onPress={onStartPress}
                    style={styles.startBtn}
                    activeOpacity={0.8}
                >
                    <Text style={styles.startText}>{selectedStatus === "Pending" ? "START" : selectedStatus === "Picking" ? "CONTINUE" : "VIEW"}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default OrderCard;

const styles = StyleSheet.create({
    orderCard: {
        flexDirection: 'row',
        backgroundColor: '#E75B54',
        borderRadius: 10,
        padding: wp('4%'),
        alignItems: 'center',
        marginBottom: hp('1.2%'),
    },
    orderCardPicking: {
        backgroundColor: "#f4ab35"
    },
    orderCardView: {
        backgroundColor: '#4A90E2'
    },
    orderLeft: {
        flex: 1
    },

    orderId: {
        color: '#fff',
        fontSize: wp('3.5%'),
        fontFamily: FONTS.openSans.semiBold,
    },

    orderMeta: {
        color: '#fff',
        fontSize: wp('3%'),
        fontFamily: FONTS.openSans.regular,
        marginTop: hp('0.2%'),
    },

    orderRight: {
        alignItems: 'flex-end',
    },

    amount: {
        color: '#fff',
        fontFamily: FONTS.openSans.semiBold,
        marginBottom: hp('0.4%'),
        fontSize: wp('3.5%'),
        marginRight: wp('1%')
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
        fontSize: wp('3.5%'),
    },
});
