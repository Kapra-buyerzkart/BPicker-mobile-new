import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Switch,
    Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { wp, hp, RADIUS, FONT_SIZES } from '../styles/theme';
import { FONTS } from '../styles/typography';
import { useTheme } from '../theme';
import { getPickerProfile, logoutPickerAgent } from '../services/authService';
import { oneSignalLogout } from '../services/oneSignalService';
import AppHeader from '../components/AppHeader';
import ConfirmModal from '../components/ConfirmModal';

const PROFILE_FIELDS = [
    { key: 'fullName', label: 'Full Name', icon: 'account-outline' },
    { key: 'emailId', label: 'Email', icon: 'email-outline' },
    { key: 'phoneNo', label: 'Mobile Number', icon: 'phone-outline' },
    { key: 'storeName', label: 'Store', icon: 'storefront-outline' },
];

const ProfileScreen = ({ navigation }) => {
    const { colors, isDark, toggleTheme } = useTheme();
    const styles = useMemo(() => makeStyles(colors), [colors]);

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
                        <ActivityIndicator size="large" color={colors.primary} />
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
                                    <Icon name={field.icon} size={wp('4.6%')} color={colors.primary} />
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

                {/* Settings */}
                <View style={styles.card}>
                    <View style={[styles.infoRow, styles.infoRowLast]}>
                        <View style={styles.infoIconCircle}>
                            <Icon name="moon-waning-crescent" size={wp('4.6%')} color={colors.primary} />
                        </View>
                        <View style={styles.infoTextWrap}>
                            <Text style={styles.infoValue}>Dark Mode</Text>
                        </View>
                        <Switch
                            value={isDark}
                            onValueChange={toggleTheme}
                            trackColor={{ false: colors.border, true: colors.primary }}
                            thumbColor={colors.white}
                            ios_backgroundColor={colors.border}
                        />
                    </View>
                </View>

                {!!errorMessage && (
                    <View style={styles.errorBox}>
                        <Icon name="alert-circle-outline" size={wp('4.4%')} color={colors.danger} />
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    </View>
                )}

                {/* Account actions */}
                <View style={styles.card}>
                    <Pressable
                        onPress={handleChangePassword}
                        style={({ pressed }) => [
                            styles.menuRow,
                            pressed && styles.menuRowPressed,
                        ]}
                    >
                        <View style={styles.infoIconCircle}>
                            <Icon name="lock-outline" size={wp('4.6%')} color={colors.primary} />
                        </View>
                        <Text style={styles.menuLabel}>Change Password</Text>
                        <Icon name="chevron-right" size={wp('5.5%')} color={colors.textMuted} />
                    </Pressable>

                    <Pressable
                        onPress={handleLogoutPress}
                        disabled={isLoggingOut}
                        style={({ pressed }) => [
                            styles.menuRow,
                            styles.menuRowLast,
                            pressed && styles.menuRowPressed,
                        ]}
                    >
                        <View style={styles.menuIconCircleDanger}>
                            <Icon name="logout" size={wp('4.6%')} color={colors.danger} />
                        </View>
                        <Text style={[styles.menuLabel, styles.menuLabelDanger]}>Logout</Text>
                        {isLoggingOut ? (
                            <ActivityIndicator size="small" color={colors.danger} />
                        ) : (
                            <Icon name="chevron-right" size={wp('5.5%')} color={colors.textMuted} />
                        )}
                    </Pressable>
                </View>
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

const makeStyles = (colors) => StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.card,
    },

    scroll: {
        flexGrow: 1,
        backgroundColor: colors.background,
        padding: wp('5%'),
        alignItems: 'center',
    },

    avatarCircle: {
        width: wp('20%'),
        height: wp('20%'),
        borderRadius: wp('10%'),
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: hp('2.4%'),
    },

    avatarInitial: {
        color: colors.white,
        fontSize: FONT_SIZES.xxl,
        fontFamily: FONTS.openSans.bold,
    },

    card: {
        width: '100%',
        backgroundColor: colors.card,
        borderRadius: RADIUS.lg,
        paddingHorizontal: wp('4%'),
        marginBottom: hp('2%'),
        borderWidth: 1,
        borderColor: colors.border,
    },

    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: hp('1.6%'),
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },

    infoRowLast: {
        borderBottomWidth: 0,
    },

    infoIconCircle: {
        width: wp('9%'),
        height: wp('9%'),
        borderRadius: wp('4.5%'),
        backgroundColor: colors.primarySoft,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: wp('3%'),
    },

    infoTextWrap: {
        flex: 1,
    },

    infoLabel: {
        color: colors.textSecondary,
        fontSize: FONT_SIZES.xs,
        fontFamily: FONTS.openSans.regular,
    },

    infoValue: {
        color: colors.textPrimary,
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
        color: colors.textSecondary,
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
        color: colors.danger,
        fontFamily: FONTS.openSans.semiBold,
        fontSize: FONT_SIZES.sm,
    },

    menuRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: hp('1.6%'),
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },

    menuRowLast: {
        borderBottomWidth: 0,
    },

    menuRowPressed: {
        opacity: 0.6,
    },

    menuIconCircleDanger: {
        width: wp('9%'),
        height: wp('9%'),
        borderRadius: wp('4.5%'),
        backgroundColor: colors.dangerLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: wp('3%'),
    },

    menuLabel: {
        flex: 1,
        color: colors.textPrimary,
        fontSize: FONT_SIZES.md,
        fontFamily: FONTS.openSans.semiBold,
    },

    menuLabelDanger: {
        color: colors.danger,
    },
});
