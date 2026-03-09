import React, { useEffect, useState } from 'react';
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
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getPickerProfile, logoutPickerAgent } from '../services/authService';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProfileScreen = ({ navigation }) => {
    const [isProfileLoading, setIsProfileLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [profile, setProfile] = useState({
        fullName: '',
        emailId: '',
        phoneNo: '',
        storeName: '',
    });

    useEffect(() => {
        let isMounted = true;

        const loadProfile = async () => {
            try {
                setErrorMessage('');
                setIsProfileLoading(true);
                const profileData = await getPickerProfile();

                if (isMounted) {
                    setProfile(profileData);
                }
            } catch (error) {
                if (isMounted) {
                    setErrorMessage(
                        error?.response?.data?.message ||
                        error?.message ||
                        'Unable to fetch profile.'
                    );
                }
            } finally {
                if (isMounted) {
                    setIsProfileLoading(false);
                }
            }
        };

        loadProfile();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleLogout = async () => {
        try {
            setErrorMessage('');
            setIsLoggingOut(true);
            await logoutPickerAgent();

            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        } catch (error) {
            setErrorMessage(
                error?.response?.data?.message ||
                error?.message ||
                'Unable to logout. Please try again.'
            );
        } finally {
            setIsLoggingOut(false);
        }
    };

    const handleChangePassword = () => {
        navigation.navigate('ChangePassword');
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
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
                    <Text style={styles.title}>My Profile</Text>

                    {isProfileLoading ? (
                        <View style={styles.profileLoader}>
                            <ActivityIndicator size="large" color="#C93D14" />
                            <Text style={styles.loadingText}>Loading profile...</Text>
                        </View>
                    ) : (
                        <>

                    {/* Mobile Number Input */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            placeholder="-"
                            placeholderTextColor="black"
                            keyboardType="phone-pad"
                            value={profile.fullName}
                            style={styles.input}
                            editable={false}
                        />
                        <Ionicons name="person" size={wp('5%')} color="black" />
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            placeholder="-"
                            placeholderTextColor="black"
                            keyboardType="phone-pad"
                            value={profile.emailId}
                            style={styles.input}
                            editable={false}
                        />
                        <Ionicons name="mail" size={wp('5%')} color="black" />
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            placeholder="-"
                            placeholderTextColor="black"
                            keyboardType="phone-pad"
                            maxLength={10}
                            value={profile.phoneNo}
                            style={styles.input}
                            editable={false}
                        />
                        <Icon name="cellphone" size={wp('5%')} color="black" />
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            placeholder="-"
                            placeholderTextColor="black"
                            keyboardType="phone-pad"
                            value={profile.storeName}
                            style={styles.input}
                            editable={false}
                        />
                        <Ionicons name="storefront" size={wp('5%')} color="black" />
                    </View>
                        </>
                    )}

                    {/* Password Input */}

                    {/* Login Button */}
                    {!!errorMessage && (
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    )}
                    <TouchableOpacity
                        onPress={handleChangePassword}
                        style={styles.secondaryButton}
                    >
                        <Text style={styles.secondaryButtonText}>CHANGE PASSWORD</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleLogout}
                        style={styles.button}
                        disabled={isLoggingOut}
                    >
                        {isLoggingOut ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>LOGOUT</Text>
                        )}
                    </TouchableOpacity>

                    {/* <Text style={styles.footerText}>Powered by Kapra</Text> */}
                </View>
            </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ProfileScreen;

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
    secondaryButton: {
        backgroundColor: '#fff',
        height: hp('6.5%'),
        borderRadius: wp('2%'),
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: hp('1%'),
        borderWidth: 1,
        borderColor: '#C93D14',
    },
    secondaryButtonText: {
        color: '#C93D14',
        fontSize: wp('4%'),
        fontFamily: FONTS.openSans.semiBold
    },
    errorText: {
        color: '#D32F2F',
        fontFamily: FONTS.openSans.semiBold,
        fontSize: wp('3.2%'),
        marginBottom: hp('1%'),
    },
    profileLoader: {
        alignItems: 'center',
        marginBottom: hp('2%'),
    },
    loadingText: {
        marginTop: hp('1%'),
        color: '#666',
        fontFamily: FONTS.openSans.semiBold,
        fontSize: wp('3.4%'),
    },

    footerText: {
        marginTop: hp('3%'),
        fontSize: wp('3%'),
        color: '#aaa',
        textAlign: 'center',
    },

    backButton: {
        position: 'absolute',
        top: hp('1%'),
        left: wp('5%'),
        zIndex: 10,
    },
});
