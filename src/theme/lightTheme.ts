import type { ThemeColors } from './colors';

/**
 * Light palette. Values mirror the original `COLORS` map in
 * `src/styles/theme.js` so the app looks identical in light mode.
 */
export const lightColors: ThemeColors = {
  // Brand
  primary: '#F25000',
  primaryDark: '#C93D14',
  primarySoft: '#FFEDE3',
  secondary: '#FF7A3D',

  // Semantic / status
  success: '#16A34A',
  successLight: '#DCFCE7',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  danger: '#DC2626',
  dangerLight: '#FEE2E2',
  error: '#DC2626',
  info: '#4A90E2',
  infoLight: '#DBEAFE',

  // Surfaces
  background: '#F8FAFC',
  card: '#FFFFFF',
  surface: '#FFFFFF',
  tabBar: '#FFFFFF',
  inputBackground: '#FFFFFF',
  skeleton: '#E2E8F0',

  // Text
  text: '#111827',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  placeholder: '#9CA3AF',

  // Lines / structure
  border: '#E5E7EB',
  divider: '#E5E7EB',
  icon: '#6B7280',

  // States
  disabled: '#9CA3AF',
  disabledBackground: '#E5E7EB',

  // Absolutes
  white: '#FFFFFF',
  black: '#000000',

  // Effects
  shadow: '#000000',
  overlay: 'rgba(17, 24, 39, 0.5)',

  statusBar: 'dark-content',
};
