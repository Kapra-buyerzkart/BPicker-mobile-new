import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Platform } from 'react-native';

export const COLORS = {
  primary: '#F25000',
  primaryDark: '#C93D14',
  secondary: '#FF7A3D',
  success: '#16A34A',
  successLight: '#DCFCE7',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  danger: '#DC2626',
  dangerLight: '#FEE2E2',
  info: '#4A90E2',
  infoLight: '#DBEAFE',
  background: '#F8FAFC',
  card: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(17, 24, 39, 0.5)',
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

export const SPACING = {
  xs: wp('1%'),
  sm: wp('2%'),
  md: wp('4%'),
  lg: wp('5%'),
  xl: wp('6%'),
};

// Flat design — no shadows. Kept as a no-op map so existing references
// degrade to flat instead of needing to be ripped out everywhere.
export const SHADOWS = {
  sm: {},
  md: {},
  lg: {},
};

// Flat cards get definition from a hairline border instead of elevation.
export const CARD_BORDER = {
  borderWidth: 1,
  borderColor: '#E5E7EB',
};

export const FONT_SIZES = {
  xs: wp('2.8%'),
  sm: wp('3.2%'),
  md: wp('3.6%'),
  lg: wp('4.2%'),
  xl: wp('5%'),
  xxl: wp('6.5%'),
};

export const hairline = Platform.select({ ios: 0.5, android: 1 });

export { wp, hp };
