import React, { useState } from 'react';
import { router } from 'expo-router';
import {
  careSetupImpliesInjection,
  careSetupImpliesMedication,
  getNextOnboardingStep,
} from '@prism/types';
import { OnboardingScreenLayout } from '../components/OnboardingScreenLayout';
import { ChipSelect } from '../components/ChipSelect';
import { CARE_SETUP_CHIP_OPTIONS } from '../optionLabels';
import { onboardingStepHref } from '../../../lib/onboarding/routes';
import { useProfile, useSetModuleEnabled, useUpdateProfile } from '../../../lib/profile/queries';

/**
 * Screen 12 — Care Setup. Drives which of Medication/Injection Setup
 * (13-14) appear next and which modules get enabled — see
 * docs/SCREEN_BIBLE.md Screen 12. The raw selection itself isn't
 * persisted (see docs/DECISIONS.md) — only its effect (module
 * enablement) is, which is also what downstream screens read back on a
 * resumed flow.
 */
export function CareSetupScreen() {
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const setModuleEnabled = useSetModuleEnabled();
  const [selected, setSelected] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (careSetup: string[]) => {
    setIsSubmitting(true);
    const mutations: Promise<unknown>[] = [];
    if (careSetupImpliesMedication(careSetup)) {
      mutations.push(setModuleEnabled.mutateAsync({ moduleKey: 'medications', enabled: true }));
    }
    if (careSetupImpliesInjection(careSetup)) {
      mutations.push(setModuleEnabled.mutateAsync({ moduleKey: 'injections', enabled: true }));
    }
    await Promise.all(mutations);

    const next = getNextOnboardingStep('care_setup', { careSetup, intent: profile?.intent });
    await updateProfile.mutateAsync({ onboarding_step: next });
    setIsSubmitting(false);
    router.replace(onboardingStepHref(next));
  };

  return (
    <OnboardingScreenLayout
      title="What would you like to keep track of?"
      primaryLabel="Continue"
      onPrimaryPress={() => submit(selected)}
      primaryLoading={isSubmitting}
    >
      <ChipSelect options={CARE_SETUP_CHIP_OPTIONS} selected={selected} onChange={setSelected} />
    </OnboardingScreenLayout>
  );
}
