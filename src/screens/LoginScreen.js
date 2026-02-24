import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { FONTS } from '../styles/typography';

const LoginScreen = () => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.card}>
                    <Text style={styles.title}>BPicker</Text>

                    {/* Mobile Number Input */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            placeholder="Mobile Number"
                            placeholderTextColor="#999"
                            keyboardType="phone-pad"
                            maxLength={10}
                            style={styles.input}
                        />
                        <Icon name="cellphone" size={wp('5%')} color="#777" />
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            placeholder="Password"
                            placeholderTextColor="#999"
                            secureTextEntry={!showPassword}
                            style={styles.input}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Icon
                                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                size={wp('5%')}
                                color="#777"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Login Button */}
                    <TouchableOpacity style={styles.button}>
                        <Text style={styles.buttonText}>LOGIN</Text>
                    </TouchableOpacity>

                    {/* <Text style={styles.footerText}>Powered by Kapra</Text> */}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A74DA',
    },

    scroll: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: wp('4%'),
    },

    card: {
        width: wp('90%'),
        backgroundColor: '#fff',
        borderRadius: wp('3%'),
        padding: wp('6%'),
        elevation: 5,
    },

    title: {
        fontSize: wp('6%'),
        // fontWeight: 'bold',
        color: '#0A74DA',
        textAlign: 'center',
        marginBottom: hp('2.5%'),
        fontFamily: FONTS.openSans.bold
    },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: wp('2%'),
        paddingHorizontal: wp('3%'),
        marginBottom: hp('2%'),
        height: hp('6.5%'),
    },

    input: {
        flex: 1,
        fontSize: wp('3.7%'),
        color: '#000',
        fontFamily: FONTS.openSans.regular
    },

    button: {
        backgroundColor: '#0A74DA',
        height: hp('6.5%'),
        borderRadius: wp('2%'),
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: hp('1%'),
    },

    buttonText: {
        color: '#fff',
        fontSize: wp('4%'),
        fontFamily: FONTS.openSans.semiBold
    },

    footerText: {
        marginTop: hp('3%'),
        fontSize: wp('3%'),
        color: '#aaa',
        textAlign: 'center',
    },
});