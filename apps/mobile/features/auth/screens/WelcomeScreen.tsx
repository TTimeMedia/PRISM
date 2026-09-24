import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { PRISMButton, spacing } from '@prism/ui';
import { AuthScreenLayout } from '../components/AuthScreenLayout';
import { PrismMark } from '../../../components/motion';

/** Screen 02 — Welcome. See docs/SCREEN_BIBLE.md §4. */
export function WelcomeScreen() {
  return (
    <AuthScreenLayout
      hero={<PrismMark />}
      title="A private place that's just yours."
      subtitle="Keep your care, your milestones, and your journal together in one private place. Your information stays yours."
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
