import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { RADIUS, FONT_SIZES, wp } from '../styles/theme';
import { FONTS } from '../styles/typography';
import { useTheme } from '../theme';
import type { ThemeColors } from '../theme';

interface StatusConfig {
  label: string;
  bg: string;
  fg: string;
  dot: string;
}

const getStatusConfig = (
  colors: ThemeColors,
  isDark: boolean,
): Record<string, StatusConfig> => ({
  pending: { label: 'Pending', bg: colors.warningLight, fg: '#B45309', dot: colors.warning },
  picking: { label: 'Picking', bg: '#FFE8D6', fg: '#B7491F', dot: colors.secondary },
  packed: { label: 'Packed', bg: colors.infoLight, fg: isDark ? '#93C5FD' : '#1D4ED8', dot: colors.info },
  dispatched: { label: 'Dispatched', bg: '#E0E7FF', fg: '#4338CA', dot: '#6366F1' },
  online: { label: 'Online', bg: colors.successLight, fg: '#15803D', dot: colors.success },
  offline: { label: 'Offline', bg: colors.surface, fg: colors.textSecondary, dot: colors.textMuted },
  assigned: { label: 'Assigned', bg: '#E0E7FF', fg: '#4338CA', dot: '#6366F1' },
  arrived: { label: 'Arrived', bg: colors.warningLight, fg: '#B45309', dot: colors.warning },
  pickedup: { label: 'Picked Up', bg: colors.infoLight, fg: '#1D4ED8', dot: colors.info },
  delivered: { label: 'Delivered', bg: colors.successLight, fg: '#15803D', dot: colors.success },
  cancelled: { label: 'Cancelled', bg: colors.dangerLight, fg: '#B91C1C', dot: colors.danger },
});

const normalizeKey = (status?: string) => String(status || '').toLowerCase().replace(/[\s_-]/g, '');

export interface StatusBadgeProps {
  status?: string;
  label?: string;
  style?: StyleProp<ViewStyle>;
}

const StatusBadge = ({ status, label, style }: StatusBadgeProps) => {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const statusConfig = useMemo(() => getStatusConfig(colors, isDark), [colors, isDark]);

  const config = statusConfig[normalizeKey(status)] || {
    label: label || status || '-',
    bg: colors.surface,
    fg: colors.textSecondary,
    dot: colors.textMuted,
  };

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }, style]}>
      <View style={[styles.dot, { backgroundColor: config.dot }]} />
      <Text style={[styles.label, { color: config.fg }]}>{label || config.label}</Text>
    </View>
  );
};

export default StatusBadge;

const makeStyles = (_colors: ThemeColors) => StyleSheet.create({
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
