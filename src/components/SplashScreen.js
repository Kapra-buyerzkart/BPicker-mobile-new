import React, { useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  withRepeat,
  runOnJS,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../theme';
import { FONTS } from '../styles/typography';
import { wp, hp } from '../styles/theme';

// Minimum time the splash entrance animation takes before exit can start.
const MIN_DISPLAY_MS = 2500;

const SplashScreen = ({ isReady, onAnimationComplete }) => {
  const { colors } = useTheme();

  // ── Shared values ──────────────────────────────────────────────
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const logoRotate = useSharedValue(-15); // degrees

  const titleTranslateY = useSharedValue(30);
  const titleOpacity = useSharedValue(0);

  const taglineOpacity = useSharedValue(0);
  const taglineTranslateY = useSharedValue(20);

  const glowScale = useSharedValue(0.8);
  const glowOpacity = useSharedValue(0);

  const exitScale = useSharedValue(1);
  const exitOpacity = useSharedValue(1);

  // Track whether entrance animation is done so we don't exit too early.
  const entranceDone = useSharedValue(0); // 0 = not done, 1 = done

  // ── Entrance animation sequence ────────────────────────────────
  useEffect(() => {
    // Stage 0: Glow ring starts pulsing immediately
    glowOpacity.value = withDelay(100, withTiming(0.6, { duration: 400 }));
    glowScale.value = withDelay(
      100,
      withRepeat(
        withSequence(
          withTiming(1.15, {
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0.85, {
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
          }),
        ),
        -1, // infinite
        true,
      ),
    );

    // Stage 1 (200ms): Logo scales in with spring bounce
    logoOpacity.value = withDelay(200, withTiming(1, { duration: 300 }));
    logoScale.value = withDelay(
      200,
      withSpring(1, { damping: 12, stiffness: 150 }),
    );
    logoRotate.value = withDelay(
      200,
      withSpring(0, { damping: 14, stiffness: 100 }),
    );

    // Stage 2 (500ms): Title slides up and fades in
    titleOpacity.value = withDelay(500, withTiming(1, { duration: 350 }));
    titleTranslateY.value = withDelay(
      500,
      withSpring(0, { damping: 16, stiffness: 120 }),
    );

    // Stage 3 (800ms): Tagline fades in
    taglineOpacity.value = withDelay(800, withTiming(1, { duration: 400 }));
    taglineTranslateY.value = withDelay(
      800,
      withSpring(0, { damping: 16, stiffness: 120 }),
    );

    // Mark entrance as complete after MIN_DISPLAY_MS
    const timer = setTimeout(() => {
      entranceDone.value = 1;
    }, MIN_DISPLAY_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Exit animation (triggered when isReady + entrance done) ────
  const triggerExit = useCallback(() => {
    exitScale.value = withTiming(1.15, {
      duration: 350,
      easing: Easing.out(Easing.ease),
    });
    exitOpacity.value = withTiming(0, { duration: 350 }, finished => {
      if (finished && onAnimationComplete) {
        runOnJS(onAnimationComplete)();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onAnimationComplete]);

  useEffect(() => {
    if (!isReady) return;

    // If entrance is already done, exit immediately.
    // Otherwise wait for it.
    if (entranceDone.value === 1) {
      triggerExit();
    } else {
      const remaining = MIN_DISPLAY_MS - (Date.now() % MIN_DISPLAY_MS);
      const delay = Math.max(0, remaining);
      const timer = setTimeout(() => {
        triggerExit();
      }, delay);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, triggerExit]);

  // ── Animated styles ────────────────────────────────────────────

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: exitScale.value }],
    opacity: exitOpacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: glowOpacity.value,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotate.value}deg` },
    ],
    opacity: logoOpacity.value,
  }));

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: titleTranslateY.value }],
    opacity: titleOpacity.value,
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: taglineTranslateY.value }],
    opacity: taglineOpacity.value,
  }));

  // Decorative floating dots
  const dot1Opacity = useSharedValue(0);
  const dot2Opacity = useSharedValue(0);
  const dot3Opacity = useSharedValue(0);
  const dot1Y = useSharedValue(0);
  const dot2Y = useSharedValue(0);
  const dot3Y = useSharedValue(0);

  useEffect(() => {
    // Floating dots animation
    dot1Opacity.value = withDelay(600, withTiming(0.3, { duration: 500 }));
    dot1Y.value = withDelay(
      600,
      withRepeat(
        withSequence(
          withTiming(-8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      ),
    );

    dot2Opacity.value = withDelay(750, withTiming(0.25, { duration: 500 }));
    dot2Y.value = withDelay(
      750,
      withRepeat(
        withSequence(
          withTiming(6, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
          withTiming(-6, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      ),
    );

    dot3Opacity.value = withDelay(900, withTiming(0.2, { duration: 500 }));
    dot3Y.value = withDelay(
      900,
      withRepeat(
        withSequence(
          withTiming(-10, {
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(10, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dot1Style = useAnimatedStyle(() => ({
    opacity: dot1Opacity.value,
    transform: [{ translateY: dot1Y.value }],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    opacity: dot2Opacity.value,
    transform: [{ translateY: dot2Y.value }],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    opacity: dot3Opacity.value,
    transform: [{ translateY: dot3Y.value }],
  }));

  return (
    <View style={[styles.root, { backgroundColor: colors.primary }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <Animated.View style={[styles.content, containerStyle]}>
        {/* Floating decorative dots */}
        <Animated.View style={[styles.dot, styles.dot1, dot1Style]} />
        <Animated.View style={[styles.dot, styles.dot2, dot2Style]} />
        <Animated.View style={[styles.dot, styles.dot3, dot3Style]} />

        {/* Glow ring behind logo */}
        <Animated.View style={[styles.glowRing, glowStyle]} />

        {/* Logo circle */}
        {/* <Animated.View style={[styles.logoCircle, logoStyle]}> */}
        <Icon name="scooter" size={wp('12%')} color="#FFFFFF" />
        {/* </Animated.View> */}

        {/* App name */}
        <Animated.View style={titleStyle}>
          <Text style={styles.title}>BPicker</Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.View style={taglineStyle}>
          <Text style={styles.tagline}>Pick · Pack · Deliver</Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

export default SplashScreen;

const LOGO_SIZE = wp('22%');
const GLOW_SIZE = wp('36%');

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: GLOW_SIZE,
    height: GLOW_SIZE,
    borderRadius: GLOW_SIZE / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  logoCircle: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp('2%'),
    // Subtle shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: wp('9%'),
    fontFamily: FONTS.openSans.extraBold,
    color: '#FFFFFF',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  tagline: {
    fontSize: wp('3.5%'),
    fontFamily: FONTS.openSans.regular,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: hp('0.8%'),
    letterSpacing: 2,
    textAlign: 'center',
  },
  // Decorative floating dots
  dot: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dot1: {
    width: 12,
    height: 12,
    top: '18%',
    left: '12%',
  },
  dot2: {
    width: 8,
    height: 8,
    top: '25%',
    right: '15%',
  },
  dot3: {
    width: 16,
    height: 16,
    bottom: '22%',
    right: '20%',
  },
});
