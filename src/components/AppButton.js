import React, { useRef } from 'react';
import {
  Animated,
  Text,
  ActivityIndicator,
  StyleSheet,
  Pressable,
} from 'react-native';
import { COLORS, RADIUS, FONT_SIZES, SPACING, hp } from '../styles/theme';
import { FONTS } from '../styles/typography';

const VARIANTS = {
  primary: { bg: COLORS.primary, fg: COLORS.white, border: 'transparent' },
  secondary: { bg: COLORS.white, fg: COLORS.primary, border: COLORS.primary },
  success: { bg: COLORS.success, fg: COLORS.white, border: 'transparent' },
  danger: { bg: COLORS.white, fg: COLORS.danger, border: COLORS.danger },
  disabledLook: { bg: '#E5E7EB', fg: COLORS.textMuted, border: 'transparent' },
};

const AppButton = ({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'lg',
  icon = null,
  style,
  textStyle,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const isDisabled = disabled || loading;
  const colors = isDisabled && variant === 'primary' ? VARIANTS.disabledLook : VARIANTS[variant] || VARIANTS.primary;
  const height = size === 'sm' ? hp('5.2%') : hp('6.4%');

  const animateTo = (value) => {
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
  };

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }, style]}>
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        onPressIn={() => !isDisabled && animateTo(0.97)}
        onPressOut={() => !isDisabled && animateTo(1)}
        style={[
          styles.base,
          {
            backgroundColor: colors.bg,
            borderColor: colors.border,
            borderWidth: colors.border === 'transparent' ? 0 : 1.5,
            height,
            opacity: isDisabled && variant !== 'primary' ? 0.5 : 1,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={colors.fg} />
        ) : (
          <>
            {icon}
            <Text style={[styles.label, { color: colors.fg }, textStyle]}>{label}</Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
};

export default AppButton;

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'stretch',
  },
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    gap: 8,
  },
  label: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.openSans.semiBold,
    letterSpacing: 0.3,
  },
});
