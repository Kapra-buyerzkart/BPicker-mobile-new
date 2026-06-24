import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../styles/theme';
import AppHeader from '../components/AppHeader';
import EmptyState from '../components/EmptyState';

const PackedScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <AppHeader title="Packed" />
      <View style={styles.body}>
        <EmptyState
          icon="human-dolly"
          title="Packed"
          subtitle="This screen is coming soon."
        />
      </View>
    </SafeAreaView>
  );
};

export default PackedScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.card,
  },
  body: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
