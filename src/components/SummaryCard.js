import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { FONTS } from '../styles/typography';

const SummaryCard = ({ color, icon, title, onPress, isActive, }) => (
    <TouchableOpacity
        style={[
            styles.summaryCard,
            { backgroundColor: color },
            isActive && styles.activeCard,
        ]}
        onPress={onPress}
        activeOpacity={0.8}
    >
        <Icon name={icon} size={wp('6.2%')} color="#fff" />
        <View style={{
            alignItems: 'center'
        }}>
            <Text style={styles.cardTitle}>{title}</Text>
        </View>
    </TouchableOpacity>
);

export default SummaryCard

const styles = StyleSheet.create({
    summaryCard: {
        width: '31%',
        borderRadius: 10,
        // padding: 14,
        // marginBottom: hp('1.5%'),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        paddingVertical: wp('1.5%')
    },
    activeCard: {
        borderWidth: 2,
        borderColor: '#000',
    },
    cardTitle: {
        color: '#fff',
        // marginTop: 4,
        fontSize: wp('3.8%'),
        fontFamily: FONTS.openSans.semiBold
    },
})
