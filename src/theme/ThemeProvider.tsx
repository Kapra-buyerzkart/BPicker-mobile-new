import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Animated, Appearance, StyleSheet, View } from 'react-native';
import type { ThemeColors, ThemeMode } from './colors';
import { lightColors } from './lightTheme';
import { darkColors } from './darkTheme';
import { getStoredThemeMode, storeThemeMode } from './storage';

export interface ThemeContextValue {
  mode: ThemeMode;
  theme: ThemeMode;
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
}

const PALETTES: Record<ThemeMode, ThemeColors> = {
  light: lightColors,
  dark: darkColors,
};

// Duration of the cross-fade played when the theme changes (~250ms).
const FADE_DURATION = 250;

const resolveInitialMode = (): ThemeMode =>
  Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';

export const ThemeContext = createContext<ThemeContextValue>({
  mode: 'light',
  theme: 'light',
  colors: lightColors,
  isDark: false,
  toggleTheme: () => {},
  setMode: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Start from the system preference; replaced by the stored value once
  // hydration completes. Rendering is gated until then to avoid a flash.
  const [mode, setModeState] = useState<ThemeMode>(resolveInitialMode);
  const [isHydrated, setIsHydrated] = useState(false);

  // Overlay used for the cross-fade. It is filled with the *incoming*
  // background color and faded out, smoothly revealing the re-themed UI.
  const fadeOverlay = useRef(new Animated.Value(0)).current;
  const isFirstApply = useRef(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const stored = await getStoredThemeMode();
      if (mounted && stored) {
        setModeState(stored);
      }
      if (mounted) {
        setIsHydrated(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Play the cross-fade whenever the mode actually changes (not on first paint).
  useEffect(() => {
    if (isFirstApply.current) {
      isFirstApply.current = false;
      return;
    }
    fadeOverlay.setValue(1);
    Animated.timing(fadeOverlay, {
      toValue: 0,
      duration: FADE_DURATION,
      useNativeDriver: true,
    }).start();
  }, [mode, fadeOverlay]);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    storeThemeMode(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setModeState(prev => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
      storeThemeMode(next);
      return next;
    });
  }, []);

  const colors = PALETTES[mode];

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      theme: mode,
      colors,
      isDark: mode === 'dark',
      toggleTheme,
      setMode,
    }),
    [mode, colors, toggleTheme, setMode],
  );

  return (
    <ThemeContext.Provider value={value}>
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        {isHydrated ? children : null}
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: colors.background, opacity: fadeOverlay },
          ]}
        />
      </View>
    </ThemeContext.Provider>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
});
