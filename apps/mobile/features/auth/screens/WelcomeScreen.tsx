import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { PRIZMButton, spacing } from '@prizm/ui';
import { AuthScreenLayout } from '../components/AuthScreenLayout';
import { PrizmLockup } from '../../../components/motion';

/** Screen 02 — Welcome. See docs/SCREEN_BIBLE.md §4. */
export function WelcomeScreen() {
  return (
    <AuthScreenLayout
      hero={<PrizmLockup />}
      title="A private place that's just yours."
      subtitle="Keep your care, your milestones, and your journal together in one private place. Your information stays yours."
    >
      <View style={styles.actions}>
        <PRIZMButton label="Get started" onPress={() => router.push('/(auth)/sign-up')} />
        <PRIZMButton
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
    gap: spacing.smd,
  },
});
