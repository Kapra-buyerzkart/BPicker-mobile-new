import React, { useRef, useState } from 'react';
import { Animated, View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS, RADIUS, FONT_SIZES, wp, hp } from '../styles/theme';
import { FONTS } from '../styles/typography';

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
  const [isFocused, setIsFocused] = useState(false);
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  const animateLabel = (toValue) => {
    Animated.timing(labelAnim, {
      toValue,
      duration: 150,
      useNativeDriver: false,
    }).start();
  };

  const handleFocus = () => {
    setIsFocused(true);
    animateLabel(1);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!value) {
      animateLabel(0);
    }
  };

  const borderColor = error ? COLORS.danger : isFocused ? COLORS.primary : COLORS.border;

  return (
    <View style={styles.wrapper}>
      <View style={[styles.box, { borderColor }]}>
        {leftIcon}
        <View style={styles.inputArea}>
          <Animated.Text
            style={[
              styles.floatingLabel,
              {
                top: labelAnim.interpolate({ inputRange: [0, 1], outputRange: [hp('1.9%'), -hp('0.9%')] }),
                fontSize: labelAnim.interpolate({ inputRange: [0, 1], outputRange: [FONT_SIZES.md, FONT_SIZES.xs] }),
                color: isFocused ? COLORS.primary : COLORS.textSecondary,
              },
            ]}
          >
            {label}
          </Animated.Text>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            editable={editable}
            placeholderTextColor={COLORS.textMuted}
            style={styles.input}
            {...textInputProps}
          />
        </View>
        {rightIcon}
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

export default AppTextInput;

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: hp('1.8%'),
  },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: RADIUS.md,
    paddingHorizontal: wp('3.5%'),
    height: hp('7%'),
    backgroundColor: COLORS.card,
  },
  inputArea: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: wp('1%'),
  },
  floatingLabel: {
    position: 'absolute',
    left: 0,
    fontFamily: FONTS.openSans.regular,
    backgroundColor: COLORS.card,
    paddingHorizontal: 2,
  },
  input: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    fontFamily: FONTS.openSans.regular,
    paddingTop: hp('1.2%'),
  },
  errorText: {
    color: COLORS.danger,
    fontFamily: FONTS.openSans.semiBold,
    fontSize: FONT_SIZES.xs,
    marginTop: hp('0.6%'),
    marginLeft: wp('1%'),
  },
});
