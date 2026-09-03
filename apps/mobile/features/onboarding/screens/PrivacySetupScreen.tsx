import React, { useState } from 'react';
import { router } from 'expo-router';
import { getNextOnboardingStep } from '@prism/types';
import { PRISMSwitch } from '@prism/ui';
import { OnboardingScreenLayout } from '../components/OnboardingScreenLayout';
import { onboardingStepHref } from '../../../lib/onboarding/routes';
import { useUpdateProfile, useUpdateSettings } from '../../../lib/profile/queries';

/**
 * Screen 17 — Privacy Setup. Private notifications default ON — see
 * docs/SECURITY.md §7.
 *
 * App Lock is deliberately NOT offered here. Enabling it requires a PIN
 * to exist first — there's no lock without a fallback unlock method
 * (see AppLockSettingsScreen's own header) — and this screen has no way
 * to collect one. An earlier version of this screen let onboarding set
 * `app_lock_enabled: true` with no PIN ever stored, which permanently
 * locked the user out on next launch (AppLockScreen has no recovery
 * path). App Lock is only ever enabled from YOU → App Lock, where PIN
 * creation is enforced before the setting can be turned on.
 */
export function PrivacySetupScreen() {
  const updateSettings = useUpdateSettings();
  const updateProfile = useUpdateProfile();
  const [notificationPrivacy, setNotificationPrivacy] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    setIsSubmitting(true);
    const next = getNextOnboardingStep('privacy_setup', { careSetup: null, intent: null });
    await Promise.all([
      updateSettings.mutateAsync({
        notification_privacy: notificationPrivacy,
      }),
      updateProfile.mutateAsync({ onboarding_step: next }),
    ]);
    setIsSubmitting(false);
    router.replace(onboardingStepHref(next));
  };

  return (
    <OnboardingScreenLayout
      title="Protect your PRISM."
      primaryLabel="Continue"
      onPrimaryPress={submit}
      primaryLoading={isSubmitting}
    >
      <PRISMSwitch
        label="Private notifications"
        description="Private notifications hide sensitive information from your lock screen."
        value={notificationPrivacy}
        onValueChange={setNotificationPrivacy}
      />
    </OnboardingScreenLayout>
  );
}
