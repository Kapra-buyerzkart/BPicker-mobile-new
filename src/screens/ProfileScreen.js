import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { wp, hp, COLORS, RADIUS, CARD_BORDER, FONT_SIZES } from '../styles/theme';
import { FONTS } from '../styles/typography';
import { getPickerProfile, logoutPickerAgent } from '../services/authService';
import { oneSignalLogout } from '../services/oneSignalService';
import AppHeader from '../components/AppHeader';
import AppButton from '../components/AppButton';
import ConfirmModal from '../components/ConfirmModal';

const PROFILE_FIELDS = [
    { key: 'fullName', label: 'Full Name', icon: 'account-outline' },
    { key: 'emailId', label: 'Email', icon: 'email-outline' },
    { key: 'phoneNo', label: 'Mobile Number', icon: 'phone-outline' },
    { key: 'storeName', label: 'Store', icon: 'storefront-outline' },
];

const ProfileScreen = ({ navigation }) => {
    const [isProfileLoading, setIsProfileLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
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
            oneSignalLogout();

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

    const handleLogoutPress = () => {
        if (isLoggingOut) {
            return;
        }

        setIsLogoutModalVisible(true);
    };

    const handleChangePassword = () => {
        navigation.navigate('ChangePassword');
    };

    const initial = (profile.fullName || '?').trim().charAt(0).toUpperCase() || '?';

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <AppHeader title="My Profile" onBackPress={() => navigation.goBack()} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scroll}
            >
                <View style={styles.avatarCircle}>
                    <Text style={styles.avatarInitial}>{initial}</Text>
                </View>

                {isProfileLoading ? (
                    <View style={styles.loaderBox}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loadingText}>Loading profile...</Text>
                    </View>
                ) : (
                    <View style={styles.card}>
                        {PROFILE_FIELDS.map((field, index) => (
                            <View
                                key={field.key}
                                style={[
                                    styles.infoRow,
                                    index === PROFILE_FIELDS.length - 1 && styles.infoRowLast,
                                ]}
                            >
                                <View style={styles.infoIconCircle}>
                                    <Icon name={field.icon} size={wp('4.6%')} color={COLORS.primary} />
                                </View>
                                <View style={styles.infoTextWrap}>
                                    <Text style={styles.infoLabel}>{field.label}</Text>
                                    <Text style={styles.infoValue} numberOfLines={1}>
                                        {profile[field.key] || '-'}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {!!errorMessage && (
                    <View style={styles.errorBox}>
                        <Icon name="alert-circle-outline" size={wp('4.4%')} color={COLORS.danger} />
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    </View>
                )}

                <AppButton
                    label="CHANGE PASSWORD"
                    variant="secondary"
                    onPress={handleChangePassword}
                    style={styles.actionButton}
                />
                <AppButton
                    label="LOGOUT"
                    variant="danger"
                    onPress={handleLogoutPress}
                    loading={isLoggingOut}
                    disabled={isLoggingOut}
                    style={styles.actionButton}
                />
            </ScrollView>

            <ConfirmModal
                visible={isLogoutModalVisible}
                title="Confirm Logout"
                message="Are you sure you want to logout?"
                confirmLabel="Logout"
                cancelLabel="Cancel"
                variant="danger"
                loading={isLoggingOut}
                onCancel={() => setIsLogoutModalVisible(false)}
                onConfirm={() => {
                    setIsLogoutModalVisible(false);
                    handleLogout();
                }}
            />
        </SafeAreaView>
    );
};

export default ProfileScreen;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.card,
    },

    scroll: {
        flexGrow: 1,
        backgroundColor: COLORS.background,
        padding: wp('5%'),
        alignItems: 'center',
    },

    avatarCircle: {
        width: wp('20%'),
        height: wp('20%'),
        borderRadius: wp('10%'),
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: hp('2.4%'),
    },

    avatarInitial: {
        color: COLORS.white,
        fontSize: FONT_SIZES.xxl,
        fontFamily: FONTS.openSans.bold,
    },

    card: {
        width: '100%',
        backgroundColor: COLORS.card,
        borderRadius: RADIUS.lg,
        paddingHorizontal: wp('4%'),
        marginBottom: hp('2%'),
        ...CARD_BORDER,
    },

    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: hp('1.6%'),
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },

    infoRowLast: {
        borderBottomWidth: 0,
    },

    infoIconCircle: {
        width: wp('9%'),
        height: wp('9%'),
        borderRadius: wp('4.5%'),
        backgroundColor: '#FFEDE3',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: wp('3%'),
    },

    infoTextWrap: {
        flex: 1,
    },

    infoLabel: {
        color: COLORS.textSecondary,
        fontSize: FONT_SIZES.xs,
        fontFamily: FONTS.openSans.regular,
    },

    infoValue: {
        color: COLORS.textPrimary,
        fontSize: FONT_SIZES.md,
        fontFamily: FONTS.openSans.semiBold,
        marginTop: 2,
    },

    loaderBox: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: hp('4%'),
        marginBottom: hp('2%'),
    },

    loadingText: {
        marginTop: hp('1%'),
        color: COLORS.textSecondary,
        fontFamily: FONTS.openSans.semiBold,
        fontSize: FONT_SIZES.sm,
    },

    errorBox: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp('1.6%'),
        marginBottom: hp('1.4%'),
    },

    errorText: {
        flex: 1,
        color: COLORS.danger,
        fontFamily: FONTS.openSans.semiBold,
        fontSize: FONT_SIZES.sm,
    },

    actionButton: {
        width: '100%',
        marginBottom: hp('1.4%'),
    },
});
