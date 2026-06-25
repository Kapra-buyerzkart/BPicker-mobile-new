import type { ThemeColors } from './colors';

/**
 * Dark palette. Same token keys as the light palette so every consumer keeps
 * working; only the values change. The brand orange is preserved so the app
 * keeps its identity in dark mode.
 */
export const darkColors: ThemeColors = {
  // Brand
  primary: '#F25000',
  primaryDark: '#C93D14',
  primarySoft: '#3A2417',
  secondary: '#FF7A3D',

  // Semantic / status
  success: '#22C55E',
  successLight: '#14532D',
  warning: '#FBBF24',
  warningLight: '#78350F',
  danger: '#F87171',
  dangerLight: '#7F1D1D',
  error: '#F87171',
  info: '#60A5FA',
  infoLight: '#1E3A5F',

  // Surfaces
  background: '#0F172A',
  card: '#1E293B',
  surface: '#273449',
  tabBar: '#1E293B',
  inputBackground: '#1E293B',
  skeleton: '#334155',

  // Text
  text: '#F1F5F9',
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  placeholder: '#64748B',

  // Lines / structure
  border: '#334155',
  divider: '#334155',
  icon: '#94A3B8',

  // States
  disabled: '#475569',
  disabledBackground: '#334155',

  // Absolutes
  white: '#FFFFFF',
  black: '#000000',

  // Effects
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.6)',

  statusBar: 'light-content',
};
