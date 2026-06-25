import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { wp, hp, RADIUS, FONT_SIZES } from '../styles/theme';
import { useTheme } from '../theme';
import { FONTS } from '../styles/typography';
import { loginPickerAgent } from '../services/authService';
import {
  oneSignalLogin,
  requestPushPermissionIfNeeded,
} from '../services/oneSignalService';
import AppTextInput from '../components/AppTextInput';
import AppButton from '../components/AppButton';

const LoginScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
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
        Object.entries(tags).filter(
          ([, value]) => String(value).trim().length > 0,
        ),
      );
      const pickerAgentId = loginData?.pickerAgentId;
      const custId = loginData?.custId;
      const phoneValue = String(loginData?.phone || trimmedPhone).trim();
      const externalId =
        pickerAgentId != null && String(pickerAgentId).trim().length > 0
          ? `cust-${
              custId != null ? String(custId).trim() : 'na'
            }-pickerAgent-${String(pickerAgentId).trim()}`
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
          'Login failed. Please try again.',
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
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.logoCircle}>
          <Icon name="scooter" size={wp('10%')} color={colors.white} />
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>BPicker</Text>
          <Text style={styles.subtitle}>Sign in to start picking orders</Text>

          <AppTextInput
            label="Mobile Number"
            keyboardType="phone-pad"
            maxLength={10}
            value={phone}
            onChangeText={text => setPhone(text.replace(/\D/g, ''))}
            rightIcon={<Icon name="cellphone" size={wp('5%')} color={colors.textMuted} />}
          />

          <AppTextInput
            label="Password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Icon
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={wp('5%')}
                  color={showPassword ? colors.primary : colors.textMuted}
                />
              </TouchableOpacity>
            }
          />

          {!!errorMessage && (
            <View style={styles.errorBox}>
              <Icon name="alert-circle-outline" size={wp('4.4%')} color={colors.danger} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          <AppButton
            label="LOGIN"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
            style={styles.loginButton}
          />

          <Text style={styles.forgotPasswordText}>
            If you forgot your password, contact your system administrator.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const makeStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },

  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp('6%'),
  },

  logoCircle: {
    width: wp('20%'),
    height: wp('20%'),
    borderRadius: wp('10%'),
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp('2.5%'),
  },

  card: {
    width: wp('90%'),
    backgroundColor: colors.card,
    borderRadius: RADIUS.xl,
    padding: wp('6%'),
    borderWidth: 1,
    borderColor: colors.border,
  },

  title: {
    fontSize: FONT_SIZES.xxl,
    color: colors.textPrimary,
    textAlign: 'center',
    fontFamily: FONTS.openSans.bold,
  },

  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    fontFamily: FONTS.openSans.regular,
    marginTop: hp('0.6%'),
    marginBottom: hp('2.6%'),
  },

  loginButton: {
    marginTop: hp('0.6%'),
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('1.6%'),
    marginBottom: hp('1%'),
  },

  errorText: {
    flex: 1,
    color: colors.danger,
    fontFamily: FONTS.openSans.semiBold,
    fontSize: FONT_SIZES.sm,
  },

  forgotPasswordText: {
    marginTop: hp('1.8%'),
    fontSize: FONT_SIZES.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    fontFamily: FONTS.openSans.regular,
  },
});
