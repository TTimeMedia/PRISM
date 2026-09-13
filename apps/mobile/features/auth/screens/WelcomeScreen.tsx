import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { PRISMButton, spacing } from '@prism/ui';
import { AuthScreenLayout } from '../components/AuthScreenLayout';

/** Screen 02 — Welcome. See docs/SCREEN_BIBLE.md §4. */
export function WelcomeScreen() {
  return (
    <AuthScreenLayout
      title="Welcome to PRISM."
      subtitle="A private space built around your journey—not someone else's idea of what your journey should look like."
    >
      <View style={styles.actions}>
        <PRISMButton label="Get started" onPress={() => router.push('/(auth)/sign-up')} />
        <PRISMButton
          label="I already have an account"
          variant="secondary"
          onPress={() => router.push('/(auth)/sign-in')}
        />
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.sm,
  },
});
