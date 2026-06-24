import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, FONT_SIZES, wp } from '../styles/theme';
import { FONTS } from '../styles/typography';

const STATUS_CONFIG = {
  pending: { label: 'Pending', bg: COLORS.warningLight, fg: '#B45309', dot: COLORS.warning },
  picking: { label: 'Picking', bg: '#FFE8D6', fg: '#B7491F', dot: COLORS.secondary },
  packed: { label: 'Packed', bg: COLORS.infoLight, fg: '#1D4ED8', dot: COLORS.info },
  dispatched: { label: 'Dispatched', bg: '#E0E7FF', fg: '#4338CA', dot: '#6366F1' },
  online: { label: 'Online', bg: COLORS.successLight, fg: '#15803D', dot: COLORS.success },
  offline: { label: 'Offline', bg: '#F1F5F9', fg: COLORS.textSecondary, dot: COLORS.textMuted },
  assigned: { label: 'Assigned', bg: '#E0E7FF', fg: '#4338CA', dot: '#6366F1' },
  arrived: { label: 'Arrived', bg: COLORS.warningLight, fg: '#B45309', dot: COLORS.warning },
  pickedup: { label: 'Picked Up', bg: COLORS.infoLight, fg: '#1D4ED8', dot: COLORS.info },
  delivered: { label: 'Delivered', bg: COLORS.successLight, fg: '#15803D', dot: COLORS.success },
  cancelled: { label: 'Cancelled', bg: COLORS.dangerLight, fg: '#B91C1C', dot: COLORS.danger },
};

const normalizeKey = (status) => String(status || '').toLowerCase().replace(/[\s_-]/g, '');

const StatusBadge = ({ status, label, style }) => {
  const config = STATUS_CONFIG[normalizeKey(status)] || {
    label: label || status || '-',
    bg: '#F1F5F9',
    fg: COLORS.textSecondary,
    dot: COLORS.textMuted,
  };

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }, style]}>
      <View style={[styles.dot, { backgroundColor: config.dot }]} />
      <Text style={[styles.label, { color: config.fg }]}>{label || config.label}</Text>
    </View>
  );
};

export default StatusBadge;

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: wp('2.6%'),
    paddingVertical: wp('1.1%'),
    borderRadius: RADIUS.pill,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  label: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.openSans.semiBold,
  },
});
