import React, { useState } from 'react';
import { router } from 'expo-router';
import { getNextOnboardingStep, modulesForIntent, type IntentOption } from '@prism/types';
import { OnboardingScreenLayout } from '../components/OnboardingScreenLayout';
import { OptionGrid } from '../components/OptionGrid';
import { INTENT_CHIP_OPTIONS } from '../optionLabels';
import { onboardingStepHref } from '../../../lib/onboarding/routes';
import { useSetModuleEnabled, useUpdateProfile } from '../../../lib/profile/queries';

/** Screen 09 — What Brings You Here? Surfaces intent, not identity — see docs/SCREEN_BIBLE.md Screen 09. */
export function IntentScreen() {
  const updateProfile = useUpdateProfile();
  const setModuleEnabled = useSetModuleEnabled();
  const [selected, setSelected] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (intent: string[]) => {
    setIsSubmitting(true);
    const next = getNextOnboardingStep('intent', { careSetup: null, intent });
    // What they picked is what's on in Make Prism yours; they can change it any time.
    await Promise.all(
      modulesForIntent(intent).map((moduleKey) =>
        setModuleEnabled.mutateAsync({ moduleKey, enabled: true }),
      ),
    );
    await updateProfile.mutateAsync({
      intent: intent as IntentOption[],
      onboarding_step: next,
    });
    setIsSubmitting(false);
    router.replace(onboardingStepHref(next));
  };

  return (
    <OnboardingScreenLayout
      title="What would you like to keep here?"
      subtitle="Choose anything that fits. You can change it anytime."
      phase={0.45}
      primaryLabel="Continue"
      onPrimaryPress={() => submit(selected)}
      primaryLoading={isSubmitting}
      onSkip={() => submit([])}
    >
      <OptionGrid options={INTENT_CHIP_OPTIONS} selected={selected} onChange={setSelected} />
    </OnboardingScreenLayout>
  );
}
