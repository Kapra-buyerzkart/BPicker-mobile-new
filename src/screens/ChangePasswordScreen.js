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
    Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { FONTS } from '../styles/typography';
import { SafeAreaView } from 'react-native-safe-area-context';
import { changePickerPassword } from '../services/authService';

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
                        <Text style={styles.title}>Change Password</Text>

                        <View style={styles.inputContainer}>
                            <TextInput
                                placeholder="Old Password"
                                placeholderTextColor="#999"
                                secureTextEntry={!showOldPassword}
                                value={oldPassword}
                                onChangeText={setOldPassword}
                                style={styles.input}
                            />
                            <TouchableOpacity onPress={() => setShowOldPassword(!showOldPassword)}>
                                <Icon
                                    name={'eye-outline'}
                                    size={wp('5%')}
                                    color={!showOldPassword ? "#777" : "#C93D14"}
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputContainer}>
                            <TextInput
                                placeholder="New Password"
                                placeholderTextColor="#999"
                                secureTextEntry={!showPassword}
                                value={newPassword}
                                onChangeText={setNewPassword}
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
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
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

                        {!!errorMessage && (
                            <Text style={styles.errorText}>{errorMessage}</Text>
                        )}
                        <TouchableOpacity
                            onPress={handleChangePassword}
                            style={styles.button}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Change</Text>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.secondaryButton}
                        >
                            <Text style={styles.secondaryButtonText}>Back</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
            <Modal
                visible={isSuccessModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsSuccessModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Success</Text>
                        <Text style={styles.modalMessage}>
                            {successMessage || 'Password changed successfully.'}
                        </Text>
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => setIsSuccessModalVisible(false)}
                        >
                            <Text style={styles.modalButtonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default ChangePasswordScreen;

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
        fontFamily: FONTS.openSans.semiBold,
    },
    errorText: {
        color: '#D32F2F',
        fontFamily: FONTS.openSans.semiBold,
        fontSize: wp('3.2%'),
        marginBottom: hp('1%'),
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: wp('8%'),
    },
    modalCard: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: wp('5%'),
    },
    modalTitle: {
        fontSize: wp('5%'),
        color: '#1B7A35',
        fontFamily: FONTS.openSans.semiBold,
        marginBottom: hp('1%'),
        textAlign: 'center',
    },
    modalMessage: {
        fontSize: wp('3.8%'),
        color: '#222',
        fontFamily: FONTS.openSans.regular,
        textAlign: 'center',
        marginBottom: hp('2%'),
    },
    modalButton: {
        backgroundColor: '#C93D14',
        borderRadius: wp('2%'),
        height: hp('5.8%'),
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalButtonText: {
        color: '#fff',
        fontSize: wp('3.8%'),
        fontFamily: FONTS.openSans.semiBold,
    },

    footerText: {
        marginTop: hp('3%'),
        fontSize: wp('3%'),
        color: '#aaa',
        textAlign: 'center',
    },

    backButton: {
        position: 'absolute',
        top: hp('2%'),
        left: wp('5%'),
        zIndex: 10,
    },
});
