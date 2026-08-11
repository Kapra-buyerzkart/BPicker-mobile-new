import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  View,
  StyleSheet,
  type DimensionValue,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { RADIUS, wp, hp } from '../styles/theme';
import { useTheme } from '../theme';
import type { ThemeColors } from '../theme';

export interface SkeletonBlockProps {
  width?: DimensionValue;
  height?: DimensionValue;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

export const SkeletonBlock = ({
  width,
  height,
  radius = RADIUS.sm,
  style,
}: SkeletonBlockProps) => {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 650, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: radius, backgroundColor: colors.skeleton, opacity },
        style,
      ]}
    />
  );
};

export const OrderCardSkeleton = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <SkeletonBlock width="40%" height={16} />
        <SkeletonBlock width={70} height={22} radius={RADIUS.pill} />
      </View>
      <SkeletonBlock width="60%" height={12} style={{ marginTop: hp('1.4%') }} />
      <SkeletonBlock width="45%" height={12} style={{ marginTop: hp('0.8%') }} />
      <View style={[styles.row, { marginTop: hp('1.8%') }]}>
        <SkeletonBlock width={80} height={20} />
        <SkeletonBlock width={100} height={38} radius={RADIUS.md} />
      </View>
    </View>
  );
};

export interface OrderListSkeletonProps {
  count?: number;
}

export const OrderListSkeleton = ({ count = 3 }: OrderListSkeletonProps) => (
  <View>
    {Array.from({ length: count }).map((_, index) => (
      <OrderCardSkeleton key={index} />
    ))}
  </View>
);

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: RADIUS.lg,
    padding: wp('4%'),
    marginBottom: hp('1.4%'),
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
