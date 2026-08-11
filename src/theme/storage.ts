import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemeMode } from './colors';

const THEME_MODE_KEY = '@bpicker/theme-mode';

export const getStoredThemeMode = async (): Promise<ThemeMode | null> => {
  try {
    const value = await AsyncStorage.getItem(THEME_MODE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
};

export const storeThemeMode = async (mode: ThemeMode): Promise<void> => {
  try {
    await AsyncStorage.setItem(THEME_MODE_KEY, mode);
  } catch {
  }
};
