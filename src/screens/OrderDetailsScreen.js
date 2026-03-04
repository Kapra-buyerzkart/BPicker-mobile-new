import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { FONTS } from '../styles/typography';

const OrderDetailsScreen = ({ navigation }) => {

    const [checkedItems, setCheckedItems] = useState({});

    const categories = [
        {
            title: 'Vegetables',
            products: [
                { id: '1', name: 'Tomato', qty: '1', price: 40, image: 'https://media.istockphoto.com/id/466175630/photo/tomato-isolated-on-white-background.jpg?s=612x612&w=0&k=20&c=ELzCVzaiRMgiO7A5zQLkuws0N_lvPxrgJWPn7C7BXz0=' },
                { id: '2', name: 'Onion', qty: '2', price: 60, image: 'https://5.imimg.com/data5/SELLER/Default/2024/5/419610158/MO/LQ/OO/160347834/white-onion-1000x1000.jpg' },
            ],
        },
        {
            title: 'Groceries',
            products: [
                { id: '3', name: 'Rice', qty: '5', price: 320, image: 'https://png.pngtree.com/png-clipart/20241104/original/pngtree-rice-png-image_16681364.png' },
            ],
        },
    ];

    const toggleCheck = (id) => {
        setCheckedItems(prev => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const allProducts = categories.flatMap(cat => cat.products);
    const isAllChecked = allProducts.every(p => checkedItems[p.id]);

    const InfoRow = ({ label, value }) => (
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={26} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order Details</Text>
                <View style={{ width: 26 }} />
            </View>

            <ScrollView contentContainerStyle={styles.container}>

                {/* Order Info */}
                <View style={styles.orderInfoCard}>
                    <InfoRow label="Order No" value="#ORD5092848775" />
                    <InfoRow label="Items" value="3" />
                    <InfoRow label="Customer" value="Jithin KM" />
                    <InfoRow label="Amount" value="₹ 420.00" />
                    <InfoRow label="Payment" value="Cash on Delivery" />
                    <InfoRow label="Phone" value="+91 9605913522" />
                </View>

                {/* Products */}
                {categories.map(category => (
                    <View key={category.title}>
                        <Text style={styles.categoryTitle}>{category.title}</Text>

                        {category.products.map(product => (
                            <View key={product.id} style={styles.productCard}>
                                <Image
                                    source={{ uri: product.image }}
                                    style={styles.productImage}
                                />

                                <View style={{ flex: 1 }}>
                                    <Text style={styles.productName}>{product.name}</Text>
                                    <Text style={styles.productMeta}>
                                        Qty: {product.qty} • ₹ {product.price}
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    onPress={() => toggleCheck(product.id)}
                                >
                                    <Icon
                                        name={checkedItems[product.id]
                                            ? 'checkbox-marked'
                                            : 'checkbox-blank-outline'}
                                        size={26}
                                        color={checkedItems[product.id] ? '#4CAF50' : '#999'}
                                    />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                ))}

                {/* Complete Pickup */}
                <TouchableOpacity
                    disabled={!isAllChecked}
                    style={[
                        styles.completeBtn,
                        { backgroundColor: isAllChecked ? '#4CAF50' : '#ccc' },
                    ]}
                >
                    <Text style={styles.completeText}>COMPLETE PICKING</Text>
                </TouchableOpacity>

            </ScrollView>
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
        // elevation: 2,
    },

    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: wp('4.5%'),
        fontFamily: FONTS.openSans.semiBold,
        color: "#FFFFFF"
    },

    container: {
        padding: wp('4%'),
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
        fontFamily: FONTS.openSans.regular
    },

    infoValue: {
        fontSize: wp('3.7%'),
        fontFamily: FONTS.openSans.regular,
        color: 'black'
    },

    categoryTitle: {
        fontSize: wp('4%'),
        marginVertical: hp('1.5%'),
        color: 'black',
        fontFamily: FONTS.openSans.semiBold
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
        // borderRadius: 6,
        marginRight: wp('3%'),
    },

    productName: {
        fontSize: wp('3.6%'),
        fontFamily: FONTS.openSans.regular,
        color: 'black'
    },

    productMeta: {
        color: '#777',
        fontSize: wp('3%'),
        fontFamily: FONTS.openSans.regular
        // marginTop: hp('0.1%'),
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
        fontFamily: FONTS.openSans.semiBold
    },
});