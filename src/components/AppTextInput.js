import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { RADIUS, FONT_SIZES, wp, hp } from '../styles/theme';
import { FONTS } from '../styles/typography';
import { useTheme } from '../theme';

const AppTextInput = ({
  label,
  value,
  onChangeText,
  rightIcon = null,
  leftIcon = null,
  error,
  editable = true,
  ...textInputProps
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error
    ? colors.danger
    : isFocused
    ? colors.primary
    : colors.border;

  return (
    <View style={styles.wrapper}>
      {!!label && <Text style={[styles.label, isFocused && { color: colors.primary }]}>{label}</Text>}
      <View style={[styles.box, { borderColor }]}>
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={editable}
          placeholder={label}
          placeholderTextColor={colors.placeholder}
          style={styles.input}
          {...textInputProps}
        />
        {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

export default AppTextInput;

const makeStyles = (colors) =>
  StyleSheet.create({
    wrapper: {
      width: '100%',
      marginBottom: hp('1.8%'),
    },
    label: {
      fontSize: FONT_SIZES.sm,
      color: colors.textSecondary,
      fontFamily: FONTS.openSans.semiBold,
      marginBottom: hp('0.6%'),
      marginLeft: wp('0.5%'),
    },
    box: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1.5,
      borderRadius: RADIUS.md,
      paddingHorizontal: wp('3.5%'),
      height: hp('6.4%'),
      backgroundColor: colors.inputBackground,
    },
    iconLeft: {
      marginRight: wp('2%'),
    },
    iconRight: {
      marginLeft: wp('2%'),
    },
    input: {
      flex: 1,
      fontSize: FONT_SIZES.md,
      color: colors.textPrimary,
      fontFamily: FONTS.openSans.regular,
      paddingVertical: 0,
    },
    errorText: {
      color: colors.danger,
      fontFamily: FONTS.openSans.semiBold,
      fontSize: FONT_SIZES.xs,
      marginTop: hp('0.6%'),
      marginLeft: wp('1%'),
    },
  });
