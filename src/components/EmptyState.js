import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONT_SIZES, wp, hp } from '../styles/theme';
import { FONTS } from '../styles/typography';

const EmptyState = ({ icon = 'package-variant', title = 'Nothing here', subtitle = '' }) => (
  <View style={styles.container}>
    <View style={styles.iconCircle}>
      <Icon name={icon} size={wp('9%')} color={COLORS.textMuted} />
    </View>
    <Text style={styles.title}>{title}</Text>
    {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
  </View>
);

export default EmptyState;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: hp('8%'),
    paddingHorizontal: wp('10%'),
  },
  iconCircle: {
    width: wp('20%'),
    height: wp('20%'),
    borderRadius: wp('10%'),
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp('2%'),
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.openSans.semiBold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.openSans.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: hp('0.6%'),
  },
});
