import type { StatusBarStyle } from 'react-native';

/**
 * Shape of a single theme palette.
 *
 * It is intentionally a *superset* that contains both the new semantic tokens
 * required for theming (background, card, surface, text, border, divider,
 * icon, tabBar, statusBar, inputBackground, placeholder, disabled, overlay …)
 * and every legacy key that already existed in `src/styles/theme.js`
 * (textPrimary, textMuted, danger, successLight, info …).
 *
 * Keeping the legacy keys means existing screens/components can switch from the
 * static `COLORS` import to themed `colors` with a near mechanical change and
 * without losing any color reference.
 */
export interface ThemeColors {
  // Brand
  primary: string;
  primaryDark: string;
  primarySoft: string;
  secondary: string;

  // Semantic / status
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  danger: string;
  dangerLight: string;
  error: string;
  info: string;
  infoLight: string;

  // Surfaces
  background: string;
  card: string;
  surface: string;
  tabBar: string;
  inputBackground: string;
  skeleton: string;

  // Text
  text: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  placeholder: string;

  // Lines / structure
  border: string;
  divider: string;
  icon: string;

  // States
  disabled: string;
  disabledBackground: string;

  // Absolutes (do not change across themes)
  white: string;
  black: string;

  // Effects
  shadow: string;
  overlay: string;

  // StatusBar bar style for this theme
  statusBar: StatusBarStyle;
}

export type ThemeMode = 'light' | 'dark';
