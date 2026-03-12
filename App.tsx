import React, { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Container from './src/navigation/Container';
import { initOneSignal } from './src/services/oneSignalService';

export default function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    initOneSignal();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Container />
    </SafeAreaProvider>
  );
}
