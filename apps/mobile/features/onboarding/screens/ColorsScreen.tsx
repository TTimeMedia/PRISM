import React, { useState } from 'react';
import { router } from 'expo-router';
import { getNextOnboardingStep } from '@prism/types';
import type { PaletteKey } from '@prism/ui';
import { OnboardingScreenLayout } from '../components/OnboardingScreenLayout';
import { onboardingStepHref } from '../../../lib/onboarding/routes';
import { useUpdateProfile, useUpdateSettings } from '../../../lib/profile/queries';
import { useAppStore } from '../../../lib/store/appStore';
import { PalettePicker } from '../../you/components/PalettePicker';

/**
 * Colors. Pick the look of the whole app before setting up the rest, so
 * everything after this already wears it. Tapping a palette applies it
 * straight away (this screen recolors as you choose) and is saved to the
 * account; it can be changed any time in Settings. Nothing here is labeled
 * by who it's for.
 */
export function ColorsScreen() {
  const updateProfile = useUpdateProfile();
  const updateSettings = useUpdateSettings();
  const palette = useAppStore((state) => state.palette);
  const setPalette = useAppStore((state) => state.setPalette);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const choose = (key: PaletteKey) => {
    setPalette(key);
    updateSettings.mutate({ palette: key });
  };

  const onContinue = async () => {
    setIsSubmitting(true);
    const next = getNextOnboardingStep('colors', { careSetup: null, intent: null });
    await updateProfile.mutateAsync({ onboarding_step: next });
    setIsSubmitting(false);
    router.replace(onboardingStepHref(next));
  };

  return (
    <OnboardingScreenLayout
      phase={0.32}
      title="Pick your colors."
      subtitle="Choose a look for the whole app. You can change it any time."
      primaryLabel="Continue"
      onPrimaryPress={onContinue}
      primaryLoading={isSubmitting}
    >
      <PalettePicker value={palette} onChange={choose} />
    </OnboardingScreenLayout>
  );
}
