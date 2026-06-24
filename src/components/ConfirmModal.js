import React, { useEffect, useRef } from 'react';
import { Animated, Modal, Text, View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, RADIUS, FONT_SIZES, wp, hp } from '../styles/theme';
import { FONTS } from '../styles/typography';
import AppButton from './AppButton';

const ICONS = {
  default: { name: 'help-circle-outline', color: COLORS.primary, bg: '#FFEDE3' },
  success: { name: 'check-circle-outline', color: COLORS.success, bg: COLORS.successLight },
  danger: { name: 'alert-circle-outline', color: COLORS.danger, bg: COLORS.dangerLight },
};

const ConfirmModal = ({
  visible,
  title,
  message,
  error,
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  variant = 'default',
  hideCancel = false,
}) => {
  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const icon = ICONS[variant] || ICONS.default;

  useEffect(() => {
    if (visible) {
      scale.setValue(0.9);
      opacity.setValue(0);
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 16, bounciness: 8 }),
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, scale, opacity]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.card, { opacity, transform: [{ scale }] }]}>
          <View style={[styles.iconCircle, { backgroundColor: icon.bg }]}>
            <Icon name={icon.name} size={wp('8%')} color={icon.color} />
          </View>
          <Text style={styles.title}>{title}</Text>
          {!!message && <Text style={styles.message}>{message}</Text>}
          {!!error && <Text style={styles.errorText}>{error}</Text>}

          <View style={styles.actions}>
            {!hideCancel && (
              <AppButton
                label={cancelLabel}
                variant="secondary"
                onPress={onCancel}
                disabled={loading}
                style={styles.flexButton}
              />
            )}
            <AppButton
              label={confirmLabel}
              variant={variant === 'danger' ? 'danger' : 'primary'}
              onPress={onConfirm}
              loading={loading}
              style={styles.flexButton}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default ConfirmModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp('7%'),
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: wp('6%'),
    alignItems: 'center',
  },
  iconCircle: {
    width: wp('16%'),
    height: wp('16%'),
    borderRadius: wp('8%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp('1.6%'),
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.openSans.semiBold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  message: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.openSans.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: hp('0.8%'),
  },
  errorText: {
    color: COLORS.danger,
    fontFamily: FONTS.openSans.semiBold,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    marginTop: hp('1%'),
  },
  actions: {
    flexDirection: 'row',
    width: '100%',
    gap: wp('3%'),
    marginTop: hp('2.2%'),
  },
  flexButton: {
    flex: 1,
  },
});
