import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import AppHeader from '../components/AppHeader';
import EmptyState from '../components/EmptyState';

const DispatchedScreen = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <AppHeader title="Dispatched" />
      <View style={styles.body}>
        <EmptyState
          icon="truck-outline"
          title="Dispatched"
          subtitle="This screen is coming soon."
        />
      </View>
    </SafeAreaView>
  );
};

export default DispatchedScreen;

const makeStyles = (colors) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.card,
  },
  body: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
