import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { getNextOnboardingStep } from '@prism/types';
import { spacing, type, useTheme } from '@prism/ui';
import { OnboardingScreenLayout } from '../components/OnboardingScreenLayout';
import { onboardingStepHref } from '../../../lib/onboarding/routes';
import { useUpdateProfile } from '../../../lib/profile/queries';

/** Screen 08 — Philosophy. Verbatim from docs/PRODUCT_BIBLE.md §4 — never rewritten into clinical language. */
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
      title="There's no right way to transition."
      primaryLabel="Continue"
      onPrimaryPress={onContinue}
      primaryLoading={isSubmitting}
    >
      <View style={styles.manifesto}>
        <Text style={[styles.line, { color: theme.colors.text.secondary }]}>
          Some people take hormones. Some don&apos;t.
        </Text>
        <Text style={[styles.line, { color: theme.colors.text.secondary }]}>
          Some have surgery. Some don&apos;t.
        </Text>
        <Text style={[styles.line, { color: theme.colors.text.secondary }]}>
          Some change their name. Some don&apos;t.
        </Text>
        <Text style={[styles.line, { color: theme.colors.text.secondary }]}>
          Some know exactly what they want. Others are still figuring things out.
        </Text>
        <Text style={[styles.emphasis, { color: theme.colors.text.primary }]}>
          PRISM adapts to every journey.
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
