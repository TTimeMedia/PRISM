import React, { useState } from 'react';
import { router } from 'expo-router';
import { getNextOnboardingStep, type IntentOption } from '@prism/types';
import { OnboardingScreenLayout } from '../components/OnboardingScreenLayout';
import { ChipSelect } from '../components/ChipSelect';
import { INTENT_CHIP_OPTIONS } from '../optionLabels';
import { onboardingStepHref } from '../../../lib/onboarding/routes';
import { useUpdateProfile } from '../../../lib/profile/queries';

/** Screen 09 — What Brings You Here? Surfaces intent, not identity — see docs/SCREEN_BIBLE.md Screen 09. */
export function IntentScreen() {
  const updateProfile = useUpdateProfile();
  const [selected, setSelected] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (intent: string[]) => {
    setIsSubmitting(true);
    const next = getNextOnboardingStep('intent', { careSetup: null, intent });
    await updateProfile.mutateAsync({
      intent: intent as IntentOption[],
      onboarding_step: next,
    });
    setIsSubmitting(false);
    router.replace(onboardingStepHref(next));
  };

  return (
    <OnboardingScreenLayout
      title="What would you like PRISM to help with?"
      primaryLabel="Continue"
      onPrimaryPress={() => submit(selected)}
      primaryLoading={isSubmitting}
      onSkip={() => submit([])}
    >
      <ChipSelect options={INTENT_CHIP_OPTIONS} selected={selected} onChange={setSelected} />
    </OnboardingScreenLayout>
  );
}
