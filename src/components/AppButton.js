import React, { useMemo, useRef } from 'react';
import {
  Animated,
  Text,
  ActivityIndicator,
  StyleSheet,
  Pressable,
} from 'react-native';
import { RADIUS, FONT_SIZES, SPACING, hp } from '../styles/theme';
import { FONTS } from '../styles/typography';
import { useTheme } from '../theme';

const getVariants = (colors) => ({
  primary: { bg: colors.primary, fg: colors.white, border: 'transparent' },
  secondary: { bg: colors.card, fg: colors.primary, border: colors.primary },
  success: { bg: colors.success, fg: colors.white, border: 'transparent' },
  danger: { bg: colors.danger, fg: colors.white, border: 'transparent' },
  neutral: { bg: colors.surface, fg: colors.textSecondary, border: colors.border },
  disabledLook: { bg: colors.disabledBackground, fg: colors.textMuted, border: 'transparent' },
});

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
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const variants = useMemo(() => getVariants(colors), [colors]);

  const scale = useRef(new Animated.Value(1)).current;
  const isDisabled = disabled || loading;
  const variantColors = isDisabled && variant === 'primary' ? variants.disabledLook : variants[variant] || variants.primary;
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
            backgroundColor: variantColors.bg,
            borderColor: variantColors.border,
            borderWidth: variantColors.border === 'transparent' ? 0 : 1.5,
            height,
            opacity: isDisabled && variant !== 'primary' ? 0.5 : 1,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={variantColors.fg} />
        ) : (
          <>
            {icon}
            <Text style={[styles.label, { color: variantColors.fg }, textStyle]}>{label}</Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
};

export default AppButton;

const makeStyles = () => StyleSheet.create({
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
