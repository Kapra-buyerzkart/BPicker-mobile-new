import React, { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    StatusBar,
    Switch,
    Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { wp, hp, RADIUS, FONT_SIZES } from '../styles/theme';
import { FONTS } from '../styles/typography';
import { useTheme } from '../theme';
import type { ThemeColors } from '../theme';
import type { PickerProfile } from '../types/api';
import type { RootStackScreenProps } from '../types/navigation';
import { getPickerProfile, logoutPickerAgent } from '../services/authService';
import { oneSignalLogout } from '../services/oneSignalService';
import AppHeader from '../components/AppHeader';
import ConfirmModal from '../components/ConfirmModal';

const APP_VERSION = '0.0.1';

interface ProfileField {
    key: keyof PickerProfile;
    label: string;
    icon: string;
}

const PROFILE_FIELDS: ProfileField[] = [
    { key: 'emailId', label: 'Email', icon: 'email-outline' },
    { key: 'phoneNo', label: 'Mobile Number', icon: 'phone-outline' },
    { key: 'storeName', label: 'Store', icon: 'storefront-outline' },
];

const withAlpha = (hex: string, alpha: number): string => {
    let value = String(hex || '').replace('#', '');

    if (value.length === 3) {
        value = value
            .split('')
            .map(char => char + char)
            .join('');
    }

    if (value.length !== 6) {
        return hex;
    }

    const r = parseInt(value.slice(0, 2), 16);
    const g = parseInt(value.slice(2, 4), 16);
    const b = parseInt(value.slice(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

type ProfileStyles = ReturnType<typeof makeStyles>;

const SectionLabel = ({
    styles,
    children,
}: {
    styles: ProfileStyles;
    children: ReactNode;
}) => <Text style={styles.sectionLabel}>{children}</Text>;

const ProfileScreen = ({ navigation }: RootStackScreenProps<'Profile'>) => {
    const { colors, isDark, toggleTheme } = useTheme();
    const styles = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

    const [isProfileLoading, setIsProfileLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
    const [profile, setProfile] = useState<PickerProfile>({
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
            } catch (error: any) {
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
        } catch (error: any) {
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
    const displayName = profile.fullName || (isProfileLoading ? 'Loading…' : 'Picker Agent');

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <StatusBar
                barStyle={colors.statusBar}
                backgroundColor={colors.card}
            />

            <AppHeader title="My Profile" onBackPress={() => navigation.goBack()} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scroll}
            >
                <View style={styles.hero}>
                    <View style={styles.heroGlowTop} />
                    <View style={styles.heroGlowBottom} />

                    <View style={styles.avatarRing}>
                        <View style={styles.avatarCircle}>
                            <Text style={styles.avatarInitial}>{initial}</Text>
                        </View>
                    </View>

                    <Text style={styles.heroName} numberOfLines={1}>
                        {displayName}
                    </Text>

                    <View style={styles.rolePill}>
                        <View style={styles.roleDot} />
                        <Text style={styles.roleText}>Picker Agent</Text>
                    </View>
                </View>

                <SectionLabel styles={styles}>Account Details</SectionLabel>

                {isProfileLoading ? (
                    <View style={[styles.card, styles.loaderBox]}>
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

                {!!errorMessage && (
                    <View style={styles.errorBox}>
                        <Icon name="alert-circle-outline" size={wp('4.4%')} color={colors.danger} />
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    </View>
                )}

                <SectionLabel styles={styles}>Preferences</SectionLabel>

                <View style={styles.card}>
                    <View style={[styles.infoRow, styles.infoRowLast]}>
                        <View style={styles.infoIconCircle}>
                            <Icon
                                name={isDark ? 'moon-waning-crescent' : 'white-balance-sunny'}
                                size={wp('4.6%')}
                                color={colors.primary}
                            />
                        </View>
                        <View style={styles.infoTextWrap}>
                            <Text style={styles.rowTitle}>Dark Mode</Text>
                            <Text style={styles.rowSubtitle}>
                                {isDark ? 'Easier on the eyes at night' : 'Bright and high contrast'}
                            </Text>
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

                <SectionLabel styles={styles}>Security</SectionLabel>

                <View style={styles.card}>
                    <Pressable
                        onPress={handleChangePassword}
                        style={({ pressed }) => [
                            styles.menuRow,
                            styles.menuRowLast,
                            pressed && styles.menuRowPressed,
                        ]}
                    >
                        <View style={styles.infoIconCircle}>
                            <Icon name="lock-outline" size={wp('4.6%')} color={colors.primary} />
                        </View>
                        <View style={styles.infoTextWrap}>
                            <Text style={styles.rowTitle}>Change Password</Text>
                            <Text style={styles.rowSubtitle}>Update your login credentials</Text>
                        </View>
                        <Icon name="chevron-right" size={wp('5.5%')} color={colors.textMuted} />
                    </Pressable>
                </View>

                <Pressable
                    onPress={handleLogoutPress}
                    disabled={isLoggingOut}
                    style={({ pressed }) => [
                        styles.logoutButton,
                        pressed && styles.logoutButtonPressed,
                        isLoggingOut && styles.logoutButtonDisabled,
                    ]}
                >
                    {isLoggingOut ? (
                        <ActivityIndicator size="small" color={colors.danger} />
                    ) : (
                        <Icon name="logout" size={wp('4.8%')} color={colors.danger} />
                    )}
                    <Text style={styles.logoutLabel}>Logout</Text>
                </Pressable>

                <Text style={styles.versionText}>BPicker • v{APP_VERSION}</Text>
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

const makeStyles = (colors: ThemeColors, isDark: boolean) => {
    const cardBackground = isDark ? colors.surface : colors.card;
    const cardBorder = isDark ? withAlpha(colors.white, 0.06) : colors.border;
    const heroTint = isDark ? withAlpha(colors.primary, 0.16) : withAlpha(colors.primary, 0.1);

    return StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: colors.card,
        },

        scroll: {
            flexGrow: 1,
            backgroundColor: colors.background,
            paddingHorizontal: wp('5%'),
            paddingTop: hp('2.4%'),
            paddingBottom: hp('4%'),
            alignItems: 'center',
        },


        hero: {
            width: '100%',
            alignItems: 'center',
            paddingVertical: hp('3%'),
            paddingHorizontal: wp('5%'),
            marginBottom: hp('1.2%'),
            borderRadius: RADIUS.xl,
            overflow: 'hidden',
            backgroundColor: cardBackground,
            borderWidth: 1,
            borderColor: isDark ? withAlpha(colors.primary, 0.22) : withAlpha(colors.primary, 0.18),
        },

        heroGlowTop: {
            position: 'absolute',
            top: -wp('22%'),
            right: -wp('16%'),
            width: wp('50%'),
            height: wp('50%'),
            borderRadius: wp('25%'),
            backgroundColor: heroTint,
        },

        heroGlowBottom: {
            position: 'absolute',
            bottom: -wp('26%'),
            left: -wp('20%'),
            width: wp('46%'),
            height: wp('46%'),
            borderRadius: wp('23%'),
            backgroundColor: isDark
                ? withAlpha(colors.secondary, 0.1)
                : withAlpha(colors.secondary, 0.08),
        },

        avatarRing: {
            width: wp('26%'),
            height: wp('26%'),
            borderRadius: wp('13%'),
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isDark
                ? withAlpha(colors.primary, 0.18)
                : withAlpha(colors.primary, 0.12),
            borderWidth: 1,
            borderColor: withAlpha(colors.primary, isDark ? 0.35 : 0.25),
        },

        avatarCircle: {
            width: wp('20%'),
            height: wp('20%'),
            borderRadius: wp('10%'),
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
        },

        avatarInitial: {
            color: colors.white,
            fontSize: FONT_SIZES.xxl,
            fontFamily: FONTS.openSans.bold,
        },

        heroName: {
            marginTop: hp('1.6%'),
            maxWidth: '100%',
            color: colors.textPrimary,
            fontSize: FONT_SIZES.xl,
            fontFamily: FONTS.openSans.bold,
            textAlign: 'center',
        },

        rolePill: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: wp('1.6%'),
            marginTop: hp('0.9%'),
            paddingHorizontal: wp('3.2%'),
            paddingVertical: hp('0.6%'),
            borderRadius: RADIUS.pill,
            backgroundColor: isDark ? withAlpha(colors.primary, 0.18) : colors.primarySoft,
        },

        roleDot: {
            width: wp('1.6%'),
            height: wp('1.6%'),
            borderRadius: wp('0.8%'),
            backgroundColor: colors.primary,
        },

        roleText: {
            color: isDark ? colors.secondary : colors.primaryDark,
            fontSize: FONT_SIZES.xs,
            fontFamily: FONTS.openSans.semiBold,
        },


        sectionLabel: {
            alignSelf: 'flex-start',
            marginTop: hp('1.4%'),
            marginBottom: hp('0.9%'),
            marginLeft: wp('1%'),
            color: colors.textMuted,
            fontSize: FONT_SIZES.xs,
            fontFamily: FONTS.openSans.semiBold,
            letterSpacing: 0.8,
            textTransform: 'uppercase',
        },

        card: {
            width: '100%',
            backgroundColor: cardBackground,
            borderRadius: RADIUS.lg,
            paddingHorizontal: wp('4%'),
            borderWidth: 1,
            borderColor: cardBorder,
        },

        infoRow: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: hp('1.6%'),
            borderBottomWidth: 1,
            borderBottomColor: isDark ? withAlpha(colors.white, 0.06) : colors.divider,
        },

        infoRowLast: {
            borderBottomWidth: 0,
        },

        infoIconCircle: {
            width: wp('9.6%'),
            height: wp('9.6%'),
            borderRadius: wp('4.8%'),
            backgroundColor: isDark
                ? withAlpha(colors.primary, 0.16)
                : colors.primarySoft,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: wp('3.2%'),
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

        rowTitle: {
            color: colors.textPrimary,
            fontSize: FONT_SIZES.md,
            fontFamily: FONTS.openSans.semiBold,
        },

        rowSubtitle: {
            marginTop: 2,
            color: colors.textSecondary,
            fontSize: FONT_SIZES.xs,
            fontFamily: FONTS.openSans.regular,
        },

        loaderBox: {
            alignItems: 'center',
            paddingVertical: hp('4%'),
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
            marginTop: hp('1.2%'),
            paddingHorizontal: wp('3.2%'),
            paddingVertical: hp('1.2%'),
            borderRadius: RADIUS.md,
            backgroundColor: isDark
                ? withAlpha(colors.danger, 0.14)
                : colors.dangerLight,
            borderWidth: 1,
            borderColor: withAlpha(colors.danger, isDark ? 0.3 : 0.22),
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
            borderBottomColor: isDark ? withAlpha(colors.white, 0.06) : colors.divider,
        },

        menuRowLast: {
            borderBottomWidth: 0,
        },

        menuRowPressed: {
            opacity: 0.6,
        },


        logoutButton: {
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: wp('2.4%'),
            marginTop: hp('2.6%'),
            paddingVertical: hp('1.7%'),
            borderRadius: RADIUS.lg,
            backgroundColor: isDark
                ? withAlpha(colors.danger, 0.12)
                : colors.dangerLight,
            borderWidth: 1,
            borderColor: withAlpha(colors.danger, isDark ? 0.32 : 0.24),
        },

        logoutButtonPressed: {
            opacity: 0.7,
        },

        logoutButtonDisabled: {
            opacity: 0.6,
        },

        logoutLabel: {
            color: colors.danger,
            fontSize: FONT_SIZES.md,
            fontFamily: FONTS.openSans.bold,
        },

        versionText: {
            marginTop: hp('2.4%'),
            color: colors.textMuted,
            fontSize: FONT_SIZES.xs,
            fontFamily: FONTS.openSans.regular,
        },
    });
};
