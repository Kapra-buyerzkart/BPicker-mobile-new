import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  RADIUS,
  FONT_SIZES,
  wp,
  hp,
} from '../styles/theme';
import { FONTS } from '../styles/typography';
import { useTheme } from '../theme';
import type { ThemeColors } from '../theme';
import StatusBadge from './StatusBadge';
import AppButton, { type AppButtonVariant } from './AppButton';

interface OrderCta {
  label: string;
  variant: AppButtonVariant;
}

const CTA_BY_STATUS: Record<string, OrderCta> = {
  Pending: { label: 'START', variant: 'primary' },
  Picking: { label: 'CONTINUE', variant: 'primary' },
};

export interface OrderCardProps {
  orderId?: string;
  date?: string;
  slot?: string;
  amount?: string | number;
  onStartPress?: () => void;
  selectedStatus?: string;
}

const OrderCard = ({
  orderId,
  date,
  slot,
  amount,
  onStartPress,
  selectedStatus,
}: OrderCardProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const formattedAmount = Number.isFinite(Number(amount))
    ? Number(amount).toFixed(2)
    : '0.00';
  const cta = CTA_BY_STATUS[selectedStatus ?? ''] || {
    label: 'VIEW',
    variant: 'secondary',
  };

  const fade = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        speed: 18,
        bounciness: 6,
      }),
    ]).start();
  }, [fade, translateY]);

  return (
    <Animated.View style={{ opacity: fade, transform: [{ translateY }] }}>
      <View style={styles.card}>
        <View style={styles.topRow}>
          <Text style={styles.orderId}>{orderId}</Text>
          <StatusBadge status={selectedStatus} />
        </View>

        <View style={styles.metaRow}>
          <Icon
            name="calendar-blank-outline"
            size={wp('3.8%')}
            color={colors.textSecondary}
          />
          <Text style={styles.orderMeta}>{date}</Text>
        </View>
        <View style={styles.metaRow}>
          <Icon
            name="clock-outline"
            size={wp('3.8%')}
            color={colors.textSecondary}
          />
          <Text style={styles.orderMeta}>{slot}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.bottomRow}>
          <View>
            <Text style={styles.amountLabel}>Order Value</Text>
            <Text style={styles.amount}>₹ {formattedAmount}</Text>
          </View>
          <AppButton
            label={cta.label}
            variant={cta.variant}
            size="sm"
            onPress={onStartPress}
            style={styles.ctaButton}
            textStyle={styles.ctaText}
          />
        </View>
      </View>
    </Animated.View>
  );
};

export default OrderCard;

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: RADIUS.lg,
    padding: wp('4%'),
    marginBottom: hp('1.4%'),
    borderWidth: 1,
    borderColor: colors.border,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp('1%'),
  },
  orderId: {
    color: colors.textPrimary,
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.openSans.semiBold,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('0.3%'),
    gap: 6,
  },
  orderMeta: {
    color: colors.textSecondary,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.openSans.regular,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: hp('1.4%'),
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amountLabel: {
    color: colors.textMuted,
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.openSans.regular,
  },
  amount: {
    color: colors.textPrimary,
    fontFamily: FONTS.openSans.bold,
    fontSize: FONT_SIZES.lg,
    marginTop: 2,
  },
  ctaButton: {
    minWidth: wp('30%'),
  },
  ctaText: {
    fontSize: FONT_SIZES.md,
  },
});
