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
const MIN_DISPLAY_MS = 3000;

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

  // Decorative floating circles – configuration driven
  const CIRCLE_CONFIG = [
    { delay: 600, maxOpacity: 0.3, travel: 8, duration: 1500 },
    { delay: 750, maxOpacity: 0.25, travel: 6, duration: 1800 },
    { delay: 900, maxOpacity: 0.2, travel: 10, duration: 2000 },
    { delay: 500, maxOpacity: 0.15, travel: 12, duration: 2200 },
    { delay: 650, maxOpacity: 0.2, travel: 7, duration: 1600 },
    { delay: 800, maxOpacity: 0.18, travel: 9, duration: 1900 },
    { delay: 550, maxOpacity: 0.22, travel: 11, duration: 2100 },
    { delay: 700, maxOpacity: 0.12, travel: 5, duration: 1400 },
    { delay: 850, maxOpacity: 0.16, travel: 14, duration: 2400 },
    { delay: 950, maxOpacity: 0.14, travel: 8, duration: 1700 },
  ];

  // Create shared values for each circle
  const c1Op = useSharedValue(0);
  const c1Y = useSharedValue(0);
  const c2Op = useSharedValue(0);
  const c2Y = useSharedValue(0);
  const c3Op = useSharedValue(0);
  const c3Y = useSharedValue(0);
  const c4Op = useSharedValue(0);
  const c4Y = useSharedValue(0);
  const c5Op = useSharedValue(0);
  const c5Y = useSharedValue(0);
  const c6Op = useSharedValue(0);
  const c6Y = useSharedValue(0);
  const c7Op = useSharedValue(0);
  const c7Y = useSharedValue(0);
  const c8Op = useSharedValue(0);
  const c8Y = useSharedValue(0);
  const c9Op = useSharedValue(0);
  const c9Y = useSharedValue(0);
  const c10Op = useSharedValue(0);
  const c10Y = useSharedValue(0);

  const allOps = [c1Op, c2Op, c3Op, c4Op, c5Op, c6Op, c7Op, c8Op, c9Op, c10Op];
  const allYs = [c1Y, c2Y, c3Y, c4Y, c5Y, c6Y, c7Y, c8Y, c9Y, c10Y];

  useEffect(() => {
    CIRCLE_CONFIG.forEach((cfg, i) => {
      allOps[i].value = withDelay(
        cfg.delay,
        withTiming(cfg.maxOpacity, { duration: 500 }),
      );
      allYs[i].value = withDelay(
        cfg.delay,
        withRepeat(
          withSequence(
            withTiming(-cfg.travel, {
              duration: cfg.duration,
              easing: Easing.inOut(Easing.ease),
            }),
            withTiming(cfg.travel, {
              duration: cfg.duration,
              easing: Easing.inOut(Easing.ease),
            }),
          ),
          -1,
          true,
        ),
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dot1Style = useAnimatedStyle(() => ({
    opacity: c1Op.value,
    transform: [{ translateY: c1Y.value }],
  }));
  const dot2Style = useAnimatedStyle(() => ({
    opacity: c2Op.value,
    transform: [{ translateY: c2Y.value }],
  }));
  const dot3Style = useAnimatedStyle(() => ({
    opacity: c3Op.value,
    transform: [{ translateY: c3Y.value }],
  }));
  const dot4Style = useAnimatedStyle(() => ({
    opacity: c4Op.value,
    transform: [{ translateY: c4Y.value }],
  }));
  const dot5Style = useAnimatedStyle(() => ({
    opacity: c5Op.value,
    transform: [{ translateY: c5Y.value }],
  }));
  const dot6Style = useAnimatedStyle(() => ({
    opacity: c6Op.value,
    transform: [{ translateY: c6Y.value }],
  }));
  const dot7Style = useAnimatedStyle(() => ({
    opacity: c7Op.value,
    transform: [{ translateY: c7Y.value }],
  }));
  const dot8Style = useAnimatedStyle(() => ({
    opacity: c8Op.value,
    transform: [{ translateY: c8Y.value }],
  }));
  const dot9Style = useAnimatedStyle(() => ({
    opacity: c9Op.value,
    transform: [{ translateY: c9Y.value }],
  }));
  const dot10Style = useAnimatedStyle(() => ({
    opacity: c10Op.value,
    transform: [{ translateY: c10Y.value }],
  }));

  return (
    <View style={[styles.root, { backgroundColor: colors.primary }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <Animated.View style={[styles.content, containerStyle]}>
        {/* Floating decorative circles */}
        <Animated.View style={[styles.dot, styles.dot1, dot1Style]} />
        <Animated.View style={[styles.dot, styles.dot2, dot2Style]} />
        <Animated.View style={[styles.dot, styles.dot3, dot3Style]} />
        <Animated.View style={[styles.dot, styles.dot4, dot4Style]} />
        <Animated.View style={[styles.dot, styles.dot5, dot5Style]} />
        <Animated.View style={[styles.dot, styles.dot6, dot6Style]} />
        <Animated.View style={[styles.dot, styles.dot7, dot7Style]} />
        <Animated.View style={[styles.dot, styles.dot8, dot8Style]} />
        <Animated.View style={[styles.dot, styles.dot9, dot9Style]} />
        <Animated.View style={[styles.dot, styles.dot10, dot10Style]} />

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
  // Decorative floating circles
  dot: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dot1: {
    width: 45,
    height: 45,
    top: '18%',
    left: '12%',
  },
  dot2: {
    width: 30,
    height: 30,
    top: '25%',
    right: '15%',
  },
  dot3: {
    width: 55,
    height: 55,
    bottom: '22%',
    right: '20%',
  },
  dot4: {
    width: 70,
    height: 70,
    top: '10%',
    right: '35%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  dot5: {
    width: 35,
    height: 35,
    top: '35%',
    left: '25%',
  },
  dot6: {
    width: 50,
    height: 50,
    bottom: '35%',
    left: '8%',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  dot7: {
    width: 80,
    height: 80,
    bottom: '12%',
    left: '30%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dot8: {
    width: 24,
    height: 24,
    top: '45%',
    right: '8%',
  },
  dot9: {
    width: 60,
    height: 60,
    bottom: '42%',
    right: '10%',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  dot10: {
    width: 32,
    height: 32,
    top: '60%',
    left: '15%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});
