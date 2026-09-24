import React, { useState } from 'react';
import { PrismMark } from '../../../components/motion';
import { OnboardingScreenLayout } from '../components/OnboardingScreenLayout';
import { useUpdateProfile } from '../../../lib/profile/queries';

/**
 * Screen 19 — PRISM Ready. `onboarding_completed` is set here, on the
 * user's own explicit action — not merely on arriving at this screen —
 * so the root layout's guards don't swap them away before they see it.
 */
export function ReadyScreen() {
  const updateProfile = useUpdateProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const enterPrism = async () => {
    setIsSubmitting(true);
    // The root layout's Stack.Protected guards react to this and route
    // to (tabs) automatically — no explicit navigation call needed.
    await updateProfile.mutateAsync({ onboarding_completed: true, onboarding_step: 'ready' });
    setIsSubmitting(false);
  };

  return (
    <OnboardingScreenLayout
      hero={<PrismMark />}
      phase={1}
      title="Prism is ready."
      subtitle="Everything you chose is set up and waiting, all in your private space."
      primaryLabel="Enter Prism"
      onPrimaryPress={enterPrism}
      primaryLoading={isSubmitting}
    />
  );
}
