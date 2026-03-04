import React, { useRef, useState } from 'react';
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
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { FONTS } from '../styles/typography';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const OtpScreen = ({ navigation }) => {
    const [otp, setOtp] = useState(['', '', '', '', '']);
    const inputs = useRef([]);

    const handleChange = (text, index) => {
        if (text.length > 1) return;

        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        if (text && index < 4) {
            inputs.current[index + 1].focus();
        }
    };

    const handleBackspace = (value, index) => {
        if (!value && index > 0) {
            inputs.current[index - 1].focus();
        }
    };

    const handleVerify = () => {
        const enteredOtp = otp.join('');
        console.log('Entered OTP:', enteredOtp);

        if (enteredOtp.length === 5) {
            navigation.navigate('ResetPassword');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-left" size={wp('7%')} color="#fff" />
                </TouchableOpacity>
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scroll}>
                    <View style={styles.card}>
                        <Text style={styles.title}>Verify OTP</Text>

                        <Text style={styles.subtitle}>
                            Enter the 5 digit OTP sent to your mobile number
                        </Text>

                        {/* OTP Inputs */}
                        <View style={styles.otpContainer}>
                            {otp.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={(ref) => (inputs.current[index] = ref)}
                                    value={digit}
                                    onChangeText={(text) => handleChange(text, index)}
                                    onKeyPress={({ nativeEvent }) => {
                                        if (nativeEvent.key === 'Backspace') {
                                            handleBackspace(digit, index);
                                        }
                                    }}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    style={styles.otpInput}
                                />
                            ))}
                        </View>

                        <TouchableOpacity onPress={handleVerify} style={styles.button}>
                            <Text style={styles.buttonText}>Verify OTP</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.resendButton}>
                            <Text style={styles.resendText}>Resend OTP</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default OtpScreen;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FF7148',
    },

    container: {
        flex: 1,
        backgroundColor: '#FF7148',
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
        fontSize: wp('5%'),
        color: '#C93D14',
        textAlign: 'center',
        marginBottom: hp('1%'),
        fontFamily: FONTS.openSans.semiBold,
    },

    subtitle: {
        textAlign: 'center',
        color: '#777',
        fontSize: wp('3.5%'),
        marginBottom: hp('3%'),
        fontFamily: FONTS.openSans.regular,
    },

    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: hp('3%'),
    },

    otpInput: {
        width: wp('13%'),
        height: hp('7%'),
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: wp('2%'),
        textAlign: 'center',
        fontSize: wp('5%'),
        color: '#000',
        fontFamily: FONTS.openSans.semiBold,
    },

    button: {
        backgroundColor: '#C93D14',
        height: hp('6.5%'),
        borderRadius: wp('2%'),
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: hp('1%'),
    },

    buttonText: {
        color: '#fff',
        fontSize: wp('4%'),
        fontFamily: FONTS.openSans.semiBold,
    },

    resendButton: {
        marginTop: hp('2%'),
        alignItems: 'center',
    },

    resendText: {
        color: '#C93D14',
        fontSize: wp('3.5%'),
        fontFamily: FONTS.openSans.semiBold,
    },
    backButton: {
        position: 'absolute',
        top: hp('2%'),
        left: wp('5%'),
        zIndex: 10,
    },
});