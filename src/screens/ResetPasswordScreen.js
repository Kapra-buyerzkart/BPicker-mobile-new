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
import { SafeAreaView } from 'react-native-safe-area-context';

const ResetPasswordScreen = ({ navigation }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
                        <Text style={styles.title}>Reset Password</Text>

                        {/* Mobile Number Input */}
                        <View style={styles.inputContainer}>
                            <TextInput
                                placeholder="New Password"
                                placeholderTextColor="#999"
                                secureTextEntry={!showPassword}
                                style={styles.input}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Icon
                                    name={'eye-outline'}
                                    size={wp('5%')}
                                    color={!showPassword ? "#777" : "#C93D14"}
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputContainer}>
                            <TextInput
                                placeholder="Confirm New Password"
                                placeholderTextColor="#999"
                                secureTextEntry={!showConfirmPassword}
                                style={styles.input}
                            />
                            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                <Icon
                                    name={'eye-outline'}
                                    size={wp('5%')}
                                    color={!showConfirmPassword ? "#777" : "#C93D14"}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Password Input */}
                        {/* <View style={styles.inputContainer}>
                        <TextInput
                            placeholder="Password"
                            placeholderTextColor="#999"
                            secureTextEntry={!showPassword}
                            style={styles.input}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Icon
                                name={'eye-outline'}
                                size={wp('5%')}
                                color={!showPassword ? "#777" : "#C93D14"}
                            />
                        </TouchableOpacity>
                    </View> */}

                        {/* Login Button */}
                        <TouchableOpacity onPress={() =>
                            navigation.replace('Login')
                        } style={styles.button}>
                            <Text style={styles.buttonText}>Reset</Text>
                        </TouchableOpacity>
                        {/* <TouchableOpacity onPress={() =>
                        navigation.navigate("ForgotPassword")
                    } style={styles.forgotPasswordButton}>
                        <Text style={styles.forgotPasswordText}>Forgot Password</Text>
                    </TouchableOpacity> */}

                        {/* <Text style={styles.footerText}>Powered by Kapra</Text> */}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ResetPasswordScreen;

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
        // fontWeight: 'bold',
        color: '#C93D14',
        textAlign: 'center',
        marginBottom: hp('2.5%'),
        fontFamily: FONTS.openSans.semiBold
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
        fontFamily: FONTS.openSans.semiBold
    },

    footerText: {
        marginTop: hp('3%'),
        fontSize: wp('3%'),
        color: '#aaa',
        textAlign: 'center',
    },

    forgotPasswordButton: {
        alignSelf: 'flex-end',
        marginTop: 8
    },

    forgotPasswordText: {
        fontFamily: FONTS.openSans.semiBold,
        color: 'black',
        fontSize: wp('3.2%')
    },

    backButton: {
        position: 'absolute',
        // top: hp('4%'),
        left: wp('5%'),
        zIndex: 10,
    },
});