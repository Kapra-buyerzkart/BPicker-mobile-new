import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, FONT_SIZES, wp, hp } from '../styles/theme';
import { FONTS } from '../styles/typography';
import AppButton from './AppButton';
import {
  startIncomingOrderSound,
  stopIncomingOrderSound,
} from '../services/incomingOrderSoundService';
import {
  startIncomingOrderVibration,
  stopIncomingOrderVibration,
} from '../services/incomingOrderVibrationService';

const DEFAULT_COUNTDOWN_SECONDS = 20;

const formatLocation = location => {
  if (!location) {
    return '-';
  }
  if (typeof location === 'string') {
    return location;
  }
  return location.address ?? location.line1 ?? location.name ?? '-';
};

/**
 * Full-screen rider order request UI. Owns its own ringtone/vibration/countdown
 * lifecycle so it behaves the same whether it was reached via a notification tap,
 * a full-screen-intent deep link, or an in-app foreground push.
 */
const IncomingOrderAlert = ({
  visible,
  order,
  onAccept,
  onReject,
  onTimeout,
  duration = DEFAULT_COUNTDOWN_SECONDS,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(duration);
  const intervalRef = useRef(null);
  const isActiveRef = useRef(false);

  const stopAlertEffects = () => {
    isActiveRef.current = false;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    stopIncomingOrderSound();
    stopIncomingOrderVibration();
  };

  useEffect(() => {
    if (!visible || !order) {
      stopAlertEffects();
      return;
    }

    if (isActiveRef.current) {
      return;
    }
    isActiveRef.current = true;
    setSecondsLeft(duration);
    startIncomingOrderSound();
    startIncomingOrderVibration();

    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          stopAlertEffects();
          onTimeout && onTimeout(order);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, order]);

  // Cleanup on unmount (covers navigating away without accept/reject/timeout).
  useEffect(() => () => stopAlertEffects(), []);

  const handleAccept = () => {
    stopAlertEffects();
    onAccept && onAccept(order);
  };

  const handleReject = () => {
    stopAlertEffects();
    onReject && onReject(order);
  };

  if (!order) {
    return null;
  }

  const earnings = order.earnings ?? order.earningAmount ?? order.amount ?? 0;

  return (
    <Modal visible={!!visible} animationType="slide" onRequestClose={() => {}}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.headerLabel}>New Order Request</Text>
          <View style={styles.timerPill}>
            <Text style={styles.timerText}>{secondsLeft}s</Text>
          </View>
        </View>

        <View style={styles.earningsCard}>
          <Text style={styles.earningsLabel}>You will earn</Text>
          <Text style={styles.earningsAmount}>
            ₹ {Number(earnings).toFixed(2)}
          </Text>
          {!!order.orderNumber && (
            <Text style={styles.orderNumber}>{order.orderNumber}</Text>
          )}
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <View style={[styles.dot, { backgroundColor: COLORS.success }]} />
            <View style={styles.detailTextWrap}>
              <Text style={styles.detailLabel}>Pickup</Text>
              <Text style={styles.detailValue}>
                {formatLocation(order.pickup)}
              </Text>
            </View>
          </View>
          <View style={styles.connector} />
          <View style={styles.detailRow}>
            <View style={[styles.dot, { backgroundColor: COLORS.primary }]} />
            <View style={styles.detailTextWrap}>
              <Text style={styles.detailLabel}>Delivery</Text>
              <Text style={styles.detailValue}>
                {formatLocation(order.delivery)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <AppButton
            label="REJECT"
            variant="danger"
            onPress={handleReject}
            style={styles.flexButton}
          />
          <AppButton
            label="ACCEPT"
            variant="success"
            onPress={handleAccept}
            style={styles.flexButton}
          />
        </View>
      </View>
    </Modal>
  );
};

export default IncomingOrderAlert;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: wp('6%'),
    paddingTop: hp('7%'),
    paddingBottom: hp('4%'),
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLabel: {
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.openSans.bold,
    color: COLORS.textPrimary,
  },
  timerPill: {
    minWidth: wp('14%'),
    paddingVertical: hp('0.8%'),
    paddingHorizontal: wp('3%'),
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.dangerLight,
    alignItems: 'center',
  },
  timerText: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.openSans.bold,
    color: COLORS.danger,
  },
  earningsCard: {
    marginTop: hp('4%'),
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    paddingVertical: hp('3%'),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  earningsLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.openSans.regular,
    color: COLORS.textSecondary,
  },
  earningsAmount: {
    fontSize: FONT_SIZES.xxl,
    fontFamily: FONTS.openSans.extraBold,
    color: COLORS.primary,
    marginTop: hp('0.6%'),
  },
  orderNumber: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.openSans.regular,
    color: COLORS.textMuted,
    marginTop: hp('0.6%'),
  },
  detailsCard: {
    marginTop: hp('2.4%'),
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: wp('4%'),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: wp('3%'),
  },
  dot: {
    width: wp('2.6%'),
    height: wp('2.6%'),
    borderRadius: wp('1.3%'),
    marginTop: hp('0.5%'),
  },
  connector: {
    width: 1,
    height: hp('2.4%'),
    backgroundColor: COLORS.border,
    marginLeft: wp('1.3%'),
    marginVertical: hp('0.4%'),
  },
  detailTextWrap: {
    flex: 1,
  },
  detailLabel: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.openSans.semiBold,
    color: COLORS.textMuted,
  },
  detailValue: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.openSans.regular,
    color: COLORS.textPrimary,
    marginTop: hp('0.2%'),
  },
  actions: {
    flexDirection: 'row',
    gap: wp('3%'),
    marginTop: hp('2%'),
  },
  flexButton: {
    flex: 1,
  },
});
