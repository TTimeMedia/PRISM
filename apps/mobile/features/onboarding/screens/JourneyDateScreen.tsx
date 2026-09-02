import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { getNextOnboardingStep } from '@prism/types';
import { PRISMButton, PRISMDateInput, spacing } from '@prism/ui';
import { OnboardingScreenLayout } from '../components/OnboardingScreenLayout';
import { onboardingStepHref } from '../../../lib/onboarding/routes';
import { useUpdateProfile } from '../../../lib/profile/queries';

/**
 * Screen 16 — Journey Date. Four distinct options, all but the first
 * resolving to no date — never a default is invented on the user's
 * behalf. See docs/SCREEN_BIBLE.md Screen 16.
 */
export function JourneyDateScreen() {
  const updateProfile = useUpdateProfile();
  const [choosingDate, setChoosingDate] = useState(false);
  const [date, setDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (journeyStartDate: string | null) => {
    setIsSubmitting(true);
    const next = getNextOnboardingStep('journey_date', { careSetup: null, intent: null });
    await updateProfile.mutateAsync({
      journey_start_date: journeyStartDate,
      onboarding_step: next,
    });
    setIsSubmitting(false);
    router.replace(onboardingStepHref(next));
  };

  if (choosingDate) {
    return (
      <OnboardingScreenLayout
        title="Does your journey have a start date?"
        primaryLabel="Continue"
        onPrimaryPress={() => submit(date || null)}
        primaryLoading={isSubmitting}
      >
        <PRISMDateInput label="Date" value={date} onChangeText={setDate} />
      </OnboardingScreenLayout>
    );
  }

  return (
    <OnboardingScreenLayout
      title="Does your journey have a start date?"
      primaryLabel="Choose a date"
      onPrimaryPress={() => setChoosingDate(true)}
    >
      <View style={styles.actions}>
        <PRISMButton
          label="I don't know"
          variant="secondary"
          loading={isSubmitting}
          onPress={() => submit(null)}
        />
        <PRISMButton
          label="My journey doesn't have one specific start date"
          variant="secondary"
          loading={isSubmitting}
          onPress={() => submit(null)}
        />
        <PRISMButton
          label="Skip"
          variant="tertiary"
          loading={isSubmitting}
          onPress={() => submit(null)}
        />
      </View>
    </OnboardingScreenLayout>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.xs,
  },
});
