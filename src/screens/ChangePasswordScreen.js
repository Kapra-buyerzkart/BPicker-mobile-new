import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { wp, hp, COLORS, RADIUS, CARD_BORDER, FONT_SIZES } from '../styles/theme';
import { FONTS } from '../styles/typography';
import { SafeAreaView } from 'react-native-safe-area-context';
import { changePickerPassword } from '../services/authService';
import AppHeader from '../components/AppHeader';
import AppTextInput from '../components/AppTextInput';
import AppButton from '../components/AppButton';
import ConfirmModal from '../components/ConfirmModal';

const ChangePasswordScreen = ({ navigation }) => {
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

    const handleChangePassword = async () => {
        const trimmedOldPassword = oldPassword.trim();
        const trimmedNewPassword = newPassword.trim();
        const trimmedConfirmPassword = confirmPassword.trim();

        if (!trimmedOldPassword || !trimmedNewPassword || !trimmedConfirmPassword) {
            setSuccessMessage('');
            setErrorMessage('All password fields are required.');
            return;
        }

        if (trimmedNewPassword !== trimmedConfirmPassword) {
            setSuccessMessage('');
            setErrorMessage('New password and confirm password do not match.');
            return;
        }

        try {
            setErrorMessage('');
            setSuccessMessage('');
            setIsLoading(true);

            const response = await changePickerPassword({
                oldpassword: trimmedOldPassword,
                newpassword: trimmedNewPassword,
            });

            setSuccessMessage(response?.message || 'Password changed successfully.');
            setIsSuccessModalVisible(true);
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            setErrorMessage(
                error?.response?.data?.message ||
                error?.message ||
                'Unable to change password.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const eyeToggle = (visible, setVisible) => (
        <TouchableOpacity onPress={() => setVisible(!visible)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Icon
                name={visible ? 'eye-off-outline' : 'eye-outline'}
                size={wp('5%')}
                color={visible ? COLORS.primary : COLORS.textMuted}
            />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <AppHeader title="Change Password" onBackPress={() => navigation.goBack()} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scroll}>
                    <View style={styles.card}>
                        <View style={styles.iconCircle}>
                            <Icon name="lock-reset" size={wp('8%')} color={COLORS.primary} />
                        </View>

                        <AppTextInput
                            label="Old Password"
                            secureTextEntry={!showOldPassword}
                            value={oldPassword}
                            onChangeText={setOldPassword}
                            rightIcon={eyeToggle(showOldPassword, setShowOldPassword)}
                        />

                        <AppTextInput
                            label="New Password"
                            secureTextEntry={!showPassword}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            rightIcon={eyeToggle(showPassword, setShowPassword)}
                        />

                        <AppTextInput
                            label="Confirm New Password"
                            secureTextEntry={!showConfirmPassword}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            rightIcon={eyeToggle(showConfirmPassword, setShowConfirmPassword)}
                        />

                        {!!errorMessage && (
                            <View style={styles.errorBox}>
                                <Icon name="alert-circle-outline" size={wp('4.4%')} color={COLORS.danger} />
                                <Text style={styles.errorText}>{errorMessage}</Text>
                            </View>
                        )}

                        <AppButton
                            label="Change"
                            onPress={handleChangePassword}
                            loading={isLoading}
                            disabled={isLoading}
                            style={styles.actionButton}
                        />
                        <AppButton
                            label="Back"
                            variant="secondary"
                            onPress={() => navigation.goBack()}
                            style={styles.actionButton}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <ConfirmModal
                visible={isSuccessModalVisible}
                title="Success"
                message={successMessage || 'Password changed successfully.'}
                confirmLabel="OK"
                variant="success"
                hideCancel
                onConfirm={() => setIsSuccessModalVisible(false)}
                onCancel={() => setIsSuccessModalVisible(false)}
            />
        </SafeAreaView>
    );
};

export default ChangePasswordScreen;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.card,
    },
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },

    scroll: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: wp('5%'),
    },

    card: {
        width: '100%',
        backgroundColor: COLORS.card,
        borderRadius: RADIUS.xl,
        padding: wp('6%'),
        alignItems: 'center',
        ...CARD_BORDER,
    },

    iconCircle: {
        width: wp('16%'),
        height: wp('16%'),
        borderRadius: wp('8%'),
        backgroundColor: '#FFEDE3',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: hp('2.2%'),
    },

    errorBox: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp('1.6%'),
        marginBottom: hp('1%'),
    },

    errorText: {
        flex: 1,
        color: COLORS.danger,
        fontFamily: FONTS.openSans.semiBold,
        fontSize: FONT_SIZES.sm,
    },

    actionButton: {
        width: '100%',
        marginTop: hp('1%'),
    },
});
