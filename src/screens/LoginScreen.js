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
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { FONTS } from '../styles/typography';
import { loginPickerAgent } from '../services/authService';
import { oneSignalLogin, requestPushPermissionIfNeeded } from '../services/oneSignalService';

const LoginScreen = ({ navigation }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleLogin = async () => {
        const trimmedPhone = phone.trim();
        const trimmedPassword = password.trim();

        if (!trimmedPhone || trimmedPhone.length !== 10) {
            setErrorMessage('Enter a valid 10 digit mobile number.');
            return;
        }

        if (!trimmedPassword) {
            setErrorMessage('Password is required.');
            return;
        }

        try {
            setErrorMessage('');
            setIsLoading(true);

            const loginResponse = await loginPickerAgent({
                phone: trimmedPhone,
                password: trimmedPassword,
            });

            const loginData = loginResponse?.data || {};
            const tags = {
                custId: loginData?.custId != null ? String(loginData.custId) : '',
                storeId: loginData?.storeId != null ? String(loginData.storeId) : '',
                storeName: String(loginData?.storeName || ''),
                phone: String(loginData?.phone || trimmedPhone),
                pickerAgentName: String(loginData?.pickerAgentName || ''),
                agentStatus: String(loginData?.agentStatus || ''),
            };
            const nonEmptyTags = Object.fromEntries(
                Object.entries(tags).filter(([, value]) => String(value).trim().length > 0)
            );
            const pickerAgentId = loginData?.pickerAgentId;
            const custId = loginData?.custId;
            const phoneValue = String(loginData?.phone || trimmedPhone).trim();
            const externalId =
                pickerAgentId != null && String(pickerAgentId).trim().length > 0
                    ? `cust-${custId != null ? String(custId).trim() : 'na'}-pickerAgent-${String(pickerAgentId).trim()}`
                    : `phone-${phoneValue}`;

            oneSignalLogin({
                externalId,
                tags: Object.keys(nonEmptyTags).length > 0 ? nonEmptyTags : undefined,
            });
            requestPushPermissionIfNeeded();

            navigation.replace('Home', {
                storeName: loginData?.storeName || '',
            });
        } catch (error) {
            setErrorMessage(
                error?.response?.data?.message ||
                error?.message ||
                'Login failed. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scroll}>
                <View style={styles.card}>
                    <Text style={styles.title}>BPicker</Text>

                    {/* Mobile Number Input */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            placeholder="Mobile Number"
                            placeholderTextColor="#999"
                            keyboardType="phone-pad"
                            maxLength={10}
                            value={phone}
                            onChangeText={(text) => setPhone(text.replace(/\D/g, ''))}
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
                            value={password}
                            onChangeText={setPassword}
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

                    {/* Login Button */}
                    {!!errorMessage && (
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    )}
                    <TouchableOpacity
                        onPress={handleLogin}
                        style={styles.button}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>LOGIN</Text>
                        )}
                    </TouchableOpacity>

                    <Text style={styles.forgotPasswordText}>
                        If you forgot your password, contact your system administrator.
                    </Text>

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
        fontSize: wp('6%'),
        // fontWeight: 'bold',
        color: '#C93D14',
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
    errorText: {
        color: '#D32F2F',
        fontFamily: FONTS.openSans.semiBold,
        fontSize: wp('3.2%'),
        marginBottom: hp('1%'),
    },

    footerText: {
        marginTop: hp('3%'),
        fontSize: wp('3%'),
        color: '#aaa',
        textAlign: 'center',
    },

    forgotPasswordText: {
        marginTop: hp('1.5%'),
        fontSize: wp('3.1%'),
        color: '#F57C00',
        textAlign: 'center',
        fontFamily: FONTS.openSans.regular,
    },

});
