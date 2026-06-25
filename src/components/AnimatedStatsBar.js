import React, { useMemo } from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RADIUS, FONT_SIZES, wp, hp } from '../styles/theme';
import { FONTS } from '../styles/typography';
import { useTheme } from '../theme';

// Stage 2: the stat cards morph into a compact sticky toolbar between
// 50px and 120px of scroll.
const STATS_START = 50;
const STATS_END = 120;
const EXPANDED_H = hp('17%');
const COMPACT_H = hp('6.4%');

/**
 * A single stat. One TouchableOpacity owns the press (identical touch handling
 * to before); two cross-fading inner layers morph the expanded card into a
 * compact chip. The inner layers are pointerEvents="none" so the touchable
 * always receives the tap regardless of which layer is visible.
 *
 * The morph styles (radius / cross-fade) are computed once in the parent and
 * shared across every item, so all three cards animate from one worklet set.
 */
const StatItem = ({
  color,
  icon,
  title,
  count,
  total,
  isActive,
  onPress,
  expandedStyle,
  compactStyle,
  styles,
}) => {
  const sharePct = total > 0 ? Math.min(100, Math.round((count / total) * 100)) : 0;

  return (
    <TouchableOpacity
      style={styles.cardOuter}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Animated.View
        style={[styles.card, isActive && { borderColor: color }]}
      >
        {/* Expanded card layer */}
        <Animated.View
          pointerEvents="none"
          style={[styles.expandedLayer, expandedStyle]}
        >
          <View style={[styles.iconCircle, { backgroundColor: `${color}1A` }]}>
            <Icon name={icon} size={wp('5.2%')} color={color} />
          </View>
          <Text style={styles.count}>{count}</Text>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <View style={styles.shareTrack}>
            <View style={[styles.shareFill, { width: `${sharePct}%`, backgroundColor: color }]} />
          </View>
        </Animated.View>

        {/* Compact chip layer */}
        <Animated.View
          pointerEvents="none"
          style={[styles.compactLayer, compactStyle]}
        >
          <View style={[styles.compactDot, { backgroundColor: color }]} />
          <Text style={styles.compactTitle} numberOfLines={1}>{title}</Text>
          <Text style={styles.compactCount}>{count}</Text>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};

/**
 * Replaces the static stat card grid with a scroll-driven morphing toolbar.
 * Data, colors, active state and touch handling are unchanged — only the
 * footprint animates. `scrollY` is a Reanimated shared value, so the morph
 * runs entirely on the UI thread.
 */
const AnimatedStatsBar = ({ scrollY, items }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const gridStyle = useAnimatedStyle(() => ({
    height: interpolate(
      scrollY.value,
      [STATS_START, STATS_END],
      [EXPANDED_H, COMPACT_H],
      Extrapolation.CLAMP,
    ),
  }));

  // Full cross-dissolve across the whole morph: the card opacity and the chip
  // opacity always sum to ~1, so the stat area never blanks mid-scroll. The
  // previous staggered fades (card gone by 60%, chip not in until 50%) left a
  // window where both layers were near-zero — that read as a flicker.
  const expandedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [STATS_START, STATS_END],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  const compactStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [STATS_START, STATS_END],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <Animated.View style={[styles.grid, gridStyle]}>
      {items.map((item) => (
        <StatItem
          key={item.title}
          {...item}
          expandedStyle={expandedStyle}
          compactStyle={compactStyle}
          styles={styles}
        />
      ))}
    </Animated.View>
  );
};

export default React.memo(AnimatedStatsBar);

const makeStyles = (colors) =>
  StyleSheet.create({
    grid: {
      flexDirection: 'row',
      marginHorizontal: -wp('1%'),
      marginBottom: hp('1.4%'),
    },
    cardOuter: {
      flex: 1,
      marginHorizontal: wp('1%'),
    },
    card: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: RADIUS.lg,
      borderWidth: 1.5,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    // Expanded card content (mirrors SummaryCard's look).
    expandedLayer: {
      ...StyleSheet.absoluteFillObject,
      paddingVertical: hp('1.6%'),
      paddingHorizontal: wp('2%'),
      alignItems: 'flex-start',
      justifyContent: 'center',
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
    // Compact chip content.
    compactLayer: {
      ...StyleSheet.absoluteFillObject,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: wp('1.5%'),
    },
    compactDot: {
      width: wp('1.8%'),
      height: wp('1.8%'),
      borderRadius: wp('0.9%'),
      marginRight: wp('1.5%'),
    },
    compactTitle: {
      color: colors.textSecondary,
      fontSize: FONT_SIZES.sm,
      fontFamily: FONTS.openSans.semiBold,
      marginRight: wp('1.5%'),
    },
    compactCount: {
      color: colors.textPrimary,
      fontSize: FONT_SIZES.md,
      fontFamily: FONTS.openSans.bold,
    },
  });
