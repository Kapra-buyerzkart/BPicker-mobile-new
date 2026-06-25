import React, { useMemo } from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FONTS } from '../styles/typography';
import { FONT_SIZES, wp, hp } from '../styles/theme';
import { useTheme } from '../theme';
import BadgeIcon from './BadgeIcon';

// Stage 1: the header collapses over the first 50px of scroll (Airbnb-style).
const HEADER_COLLAPSE = 50;
const RANGE = [0, HEADER_COLLAPSE];

// wp()/hp() are remote functions (react-native-responsive-screen) and cannot run
// on the UI runtime, so resolve them to plain numbers here on the JS thread and
// capture the results inside the worklets below.
const PADDING_RANGE = [hp('1.6%'), hp('0.9%')];
const ICON_SIZE_RANGE = [wp('10.5%'), wp('9%')];
const ICON_RADIUS_RANGE = [wp('5.25%'), wp('4.5%')];
// Collapse the icon buttons with a transform scale rather than animating
// width/height — scale runs purely on the GPU and triggers no layout pass,
// where animating width/height re-laid-out the header row every frame.
const ICON_SCALE_END = ICON_SIZE_RANGE[1] / ICON_SIZE_RANGE[0];

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

/**
 * Wraps the existing dashboard header layout in scroll-driven interpolations.
 * Pure presentation — every handler/value is passed in from HomeScreen so no
 * business logic lives here. `scrollY` is a Reanimated shared value, so every
 * interpolation below runs as a worklet on the UI thread (no bridge crossing).
 */
const AnimatedDashboardHeader = ({
  scrollY,
  storeName,
  notificationBadgeCount,
  onRefresh,
  onNotifications,
  onProfile,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const greetingStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(
      scrollY.value,
      RANGE,
      [FONT_SIZES.xs, FONT_SIZES.xs * 0.85],
      Extrapolation.CLAMP,
    ),
    opacity: interpolate(scrollY.value, RANGE, [1, 0.75], Extrapolation.CLAMP),
  }));

  const storeStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(
      scrollY.value,
      RANGE,
      [FONT_SIZES.lg, FONT_SIZES.md],
      Extrapolation.CLAMP,
    ),
  }));

  const iconButtonStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          scrollY.value,
          RANGE,
          [1, ICON_SCALE_END],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  return (
    <Animated.View style={styles.header}>
      <View style={styles.titleWrap}>
        <Animated.Text style={[styles.greeting, greetingStyle]}>
          Welcome back
        </Animated.Text>
        <Animated.Text style={[styles.storeText, storeStyle]} numberOfLines={1}>
          {storeName || '-'}
        </Animated.Text>
      </View>

      <View style={styles.headerActions}>
        <AnimatedTouchable
          onPress={onRefresh}
          style={[styles.iconButton, iconButtonStyle]}
          activeOpacity={0.7}
        >
          <Icon name="refresh" size={wp('5.4%')} color={colors.textPrimary} />
        </AnimatedTouchable>

        <AnimatedTouchable
          onPress={onNotifications}
          style={[styles.iconButton, iconButtonStyle]}
          activeOpacity={0.7}
        >
          <BadgeIcon count={notificationBadgeCount}>
            <Ionicons
              name="notifications-outline"
              size={wp('5.4%')}
              color={colors.textPrimary}
            />
          </BadgeIcon>
        </AnimatedTouchable>

        <AnimatedTouchable
          onPress={onProfile}
          style={[styles.iconButton, styles.profileButton, iconButtonStyle]}
          activeOpacity={0.7}
        >
          <Ionicons name="person" size={wp('5%')} color={colors.white} />
        </AnimatedTouchable>
      </View>
    </Animated.View>
  );
};

export default React.memo(AnimatedDashboardHeader);

const makeStyles = (colors) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.card,
      paddingHorizontal: wp('4%'),
      // Constant vertical padding keeps the header height fixed so it never
      // resizes the body/list mid-scroll; the collapse now reads through the
      // greeting fade, store-name shrink and icon scale instead.
      paddingVertical: PADDING_RANGE[0],
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    titleWrap: {
      flex: 1,
    },
    greeting: {
      color: colors.textSecondary,
      fontFamily: FONTS.openSans.regular,
    },
    storeText: {
      color: colors.textPrimary,
      fontFamily: FONTS.openSans.semiBold,
      marginTop: 2,
      maxWidth: wp('45%'),
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp('2.5%'),
    },
    iconButton: {
      width: ICON_SIZE_RANGE[0],
      height: ICON_SIZE_RANGE[0],
      borderRadius: ICON_RADIUS_RANGE[0],
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    profileButton: {
      backgroundColor: colors.primary,
    },
  });
