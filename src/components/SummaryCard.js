import React, { useMemo, useRef } from 'react';
import { Animated, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RADIUS, FONT_SIZES, wp, hp } from '../styles/theme';
import { FONTS } from '../styles/typography';
import { useTheme } from '../theme';

const SummaryCard = ({ color, icon, title, count = 0, total = 0, onPress, isActive }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const scale = useRef(new Animated.Value(1)).current;
  const sharePct = total > 0 ? Math.min(100, Math.round((count / total) * 100)) : 0;

  const animateTo = (value) => {
    Animated.spring(scale, { toValue: value, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  };

  return (
    <Animated.View style={{ flex: 1, transform: [{ scale }] }}>
      <TouchableOpacity
        style={[
          styles.card,
          isActive && { borderColor: color },
        ]}
        onPress={onPress}
        onPressIn={() => animateTo(0.96)}
        onPressOut={() => animateTo(1)}
        activeOpacity={0.9}
      >
        <View style={[styles.iconCircle, { backgroundColor: `${color}1A` }]}>
          <Icon name={icon} size={wp('5.2%')} color={color} />
        </View>
        <Text style={styles.count}>{count}</Text>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>

        <View style={styles.shareTrack}>
          <View style={[styles.shareFill, { width: `${sharePct}%`, backgroundColor: color }]} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default SummaryCard;

const makeStyles = (colors) => StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: hp('1.6%'),
    paddingHorizontal: wp('2%'),
    alignItems: 'flex-start',
    marginHorizontal: wp('1%'),
  },
  shareTrack: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.background,
    marginTop: hp('1%'),
    overflow: 'hidden',
  },
  shareFill: {
    height: 4,
    borderRadius: 2,
  },
  iconCircle: {
    width: wp('9%'),
    height: wp('9%'),
    borderRadius: wp('4.5%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp('1%'),
  },
  count: {
    fontSize: FONT_SIZES.xl,
    color: colors.textPrimary,
    fontFamily: FONTS.openSans.bold,
  },
  title: {
    color: colors.textSecondary,
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.openSans.semiBold,
    marginTop: 2,
  },
});
