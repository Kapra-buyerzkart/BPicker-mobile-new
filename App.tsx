import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Container from './src/navigation/Container';
import { initOneSignal } from './src/services/oneSignalService';
import { ThemeProvider, useTheme } from './src/theme';

function ThemedApp() {
  const { colors, isDark } = useTheme();

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <Container />
    </>
  );
}

export default function App() {
  useEffect(() => {
    initOneSignal();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ThemedApp />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
