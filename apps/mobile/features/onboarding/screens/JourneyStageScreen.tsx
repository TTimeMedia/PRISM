import React, { useState } from 'react';
import { router } from 'expo-router';
import { getNextOnboardingStep, type JourneyStage } from '@prism/types';
import { OnboardingScreenLayout } from '../components/OnboardingScreenLayout';
import { ChipSelect } from '../components/ChipSelect';
import { JOURNEY_STAGE_CHIP_OPTIONS } from '../optionLabels';
import { onboardingStepHref } from '../../../lib/onboarding/routes';
import { useUpdateProfile } from '../../../lib/profile/queries';

/**
 * Screen 10 — Journey Stage. Optional; must never visually resemble a
 * progress meter — see docs/SCREEN_BIBLE.md Screen 10. A chip group with
 * no implied order/fill is deliberately used instead of a stepper/bar.
 */
export function JourneyStageScreen() {
  const updateProfile = useUpdateProfile();
  const [selected, setSelected] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (stage: string[]) => {
    setIsSubmitting(true);
    const next = getNextOnboardingStep('journey_stage', { careSetup: null, intent: null });
    await updateProfile.mutateAsync({
      journey_stage: (stage[0] as JourneyStage | undefined) ?? null,
      onboarding_step: next,
    });
    setIsSubmitting(false);
    router.replace(onboardingStepHref(next));
  };

  return (
    <OnboardingScreenLayout
      title="Where are you right now?"
      subtitle="There's no wrong answer, and you can change this anytime."
      primaryLabel="Continue"
      onPrimaryPress={() => submit(selected)}
      primaryLoading={isSubmitting}
      onSkip={() => submit([])}
    >
      <ChipSelect
        options={JOURNEY_STAGE_CHIP_OPTIONS}
        selected={selected}
        onChange={setSelected}
        multiple={false}
      />
    </OnboardingScreenLayout>
  );
}
