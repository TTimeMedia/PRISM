import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { getNextOnboardingStep } from '@prism/types';
import { spacing, type, useTheme } from '@prism/ui';
import { OnboardingScreenLayout } from '../components/OnboardingScreenLayout';
import { onboardingStepHref } from '../../../lib/onboarding/routes';
import { useUpdateProfile } from '../../../lib/profile/queries';

/** Screen 08 — Philosophy. A short, calm intro to how PRISM works: optional, private, yours. */
export function PhilosophyScreen() {
  const theme = useTheme();
  const updateProfile = useUpdateProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onContinue = async () => {
    setIsSubmitting(true);
    const next = getNextOnboardingStep('philosophy', { careSetup: null, intent: null });
    await updateProfile.mutateAsync({ onboarding_step: next });
    setIsSubmitting(false);
    router.replace(onboardingStepHref(next));
  };

  return (
    <OnboardingScreenLayout
      title="Set it up your way."
      phase={0.25}
      primaryLabel="Continue"
      onPrimaryPress={onContinue}
      primaryLoading={isSubmitting}
    >
      <View style={styles.manifesto}>
        <Text style={[styles.line, { color: theme.colors.text.secondary }]}>
          Add only what you want to keep. Leave the rest out.
        </Text>
        <Text style={[styles.line, { color: theme.colors.text.secondary }]}>
          Everything is optional, and you can change any of it later.
        </Text>
        <Text style={[styles.line, { color: theme.colors.text.secondary }]}>
          What you write here stays in your private space.
        </Text>
        <Text style={[styles.emphasis, { color: theme.colors.text.primary }]}>
          Prism fits around you.
        </Text>
      </View>
    </OnboardingScreenLayout>
  );
}

const styles = StyleSheet.create({
  manifesto: {
    gap: spacing.sm,
  },
  line: {
    fontSize: type.bodyL.fontSize,
    lineHeight: type.bodyL.lineHeight,
  },
  emphasis: {
    fontSize: type.headingM.fontSize,
    lineHeight: type.headingM.lineHeight,
    fontWeight: '600',
    marginTop: spacing.md,
  },
});
