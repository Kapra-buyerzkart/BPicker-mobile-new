import type { StatusBarStyle } from 'react-native';

export interface ThemeColors {
  primary: string;
  primaryDark: string;
  primarySoft: string;
  secondary: string;

  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  danger: string;
  dangerLight: string;
  error: string;
  info: string;
  infoLight: string;

  background: string;
  card: string;
  surface: string;
  tabBar: string;
  inputBackground: string;
  skeleton: string;

  text: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  placeholder: string;

  border: string;
  divider: string;
  icon: string;

  disabled: string;
  disabledBackground: string;

  white: string;
  black: string;

  shadow: string;
  overlay: string;

  statusBar: StatusBarStyle;
}

export type ThemeMode = 'light' | 'dark';
