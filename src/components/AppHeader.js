import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONT_SIZES, wp, hp } from '../styles/theme';
import { FONTS } from '../styles/typography';

const AppHeader = ({ title, subtitle, onBackPress, rightContent = null }) => (
  <View style={styles.header}>
    {onBackPress ? (
      <TouchableOpacity
        onPress={onBackPress}
        style={styles.backButton}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Icon name="arrow-left" size={wp('5.6%')} color={COLORS.textPrimary} />
      </TouchableOpacity>
    ) : (
      <View style={styles.sideSpacer} />
    )}

    <View style={styles.titleWrap}>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      {!!subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
    </View>

    <View style={styles.sideSpacer}>{rightContent}</View>
  </View>
);

export default AppHeader;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('1.6%'),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'),
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideSpacer: {
    width: wp('10%'),
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  titleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.openSans.semiBold,
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.openSans.regular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
