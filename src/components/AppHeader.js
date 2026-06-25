import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FONT_SIZES, wp, hp } from '../styles/theme';
import { FONTS } from '../styles/typography';
import { useTheme } from '../theme';

const AppHeader = ({ title, subtitle, onBackPress, rightContent = null }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.header}>
      {onBackPress ? (
        <TouchableOpacity
          onPress={onBackPress}
          style={styles.backButton}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="arrow-left" size={wp('5.6%')} color={colors.textPrimary} />
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
};

export default AppHeader;

const makeStyles = (colors) => StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('1.6%'),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'),
    backgroundColor: colors.background,
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
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.openSans.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
