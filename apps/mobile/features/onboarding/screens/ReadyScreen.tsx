import React, { useState } from 'react';
import { PrizmMark } from '../../../components/motion';
import { OnboardingScreenLayout } from '../components/OnboardingScreenLayout';
import { useUpdateProfile } from '../../../lib/profile/queries';
import { track } from '../../../lib/analytics/events';

/**
 * Screen 19 — PRIZM Ready. `onboarding_completed` is set here, on the
 * user's own explicit action — not merely on arriving at this screen —
 * so the root layout's guards don't swap them away before they see it.
 */
export function ReadyScreen() {
  const updateProfile = useUpdateProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const enterPrizm = async () => {
    setIsSubmitting(true);
    // The root layout's Stack.Protected guards react to this and route
    // to (tabs) automatically — no explicit navigation call needed.
    await updateProfile.mutateAsync({ onboarding_completed: true, onboarding_step: 'ready' });
    track('onboarding_completed');
    setIsSubmitting(false);
  };

  return (
    <OnboardingScreenLayout
      hero={<PrizmMark size={132} />}
      phase={1}
      title="Prizm is ready."
      subtitle="Everything you picked is turned on. Add or remove parts any time in You, then Make Prizm yours."
      primaryLabel="Enter Prizm"
      onPrimaryPress={enterPrizm}
      primaryLoading={isSubmitting}
    />
  );
}
