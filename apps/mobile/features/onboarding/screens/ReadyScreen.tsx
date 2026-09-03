import React, { useState } from 'react';
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
      title="Your PRISM is ready."
      subtitle="Everything you chose to track is now organized around you."
      primaryLabel="Enter PRISM"
      onPrimaryPress={enterPrism}
      primaryLoading={isSubmitting}
    />
  );
}
