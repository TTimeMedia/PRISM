import React, { useState } from 'react';
import { router } from 'expo-router';
import { getNextOnboardingStep } from '@prism/types';
import { TourSlides } from '../components/TourSlides';
import { onboardingStepHref } from '../../../lib/onboarding/routes';
import { useUpdateProfile } from '../../../lib/profile/queries';

/** How Prism works — a short, skippable walkthrough shown once, after setup and before "Prism is ready." */
export function TourScreen() {
  const updateProfile = useUpdateProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const finish = async () => {
    setIsSubmitting(true);
    try {
      const next = getNextOnboardingStep('tour', { careSetup: null, intent: null });
      await updateProfile.mutateAsync({ onboarding_step: next });
      router.replace(onboardingStepHref(next));
    } finally {
      setIsSubmitting(false);
    }
  };

  return <TourSlides doneLabel="Got it" onDone={finish} onSkip={finish} loading={isSubmitting} />;
}
