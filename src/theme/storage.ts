import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemeMode } from './colors';

const THEME_MODE_KEY = '@bpicker/theme-mode';

/**
 * Read the persisted theme mode. Returns `null` when nothing has been stored
 * yet (e.g. first launch) so callers can fall back to the system preference.
 */
export const getStoredThemeMode = async (): Promise<ThemeMode | null> => {
  try {
    const value = await AsyncStorage.getItem(THEME_MODE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
};

/** Persist the selected theme mode so it survives app restarts. */
export const storeThemeMode = async (mode: ThemeMode): Promise<void> => {
  try {
    await AsyncStorage.setItem(THEME_MODE_KEY, mode);
  } catch {
    // Persisting the theme is best-effort; ignore storage failures.
  }
};
