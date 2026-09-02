import React, { useState } from 'react';
import { router } from 'expo-router';
import { getNextOnboardingStep } from '@prism/types';
import { PRISMSwitch } from '@prism/ui';
import { OnboardingScreenLayout } from '../components/OnboardingScreenLayout';
import { onboardingStepHref } from '../../../lib/onboarding/routes';
import { useUpdateProfile, useUpdateSettings } from '../../../lib/profile/queries';

/**
 * Screen 17 — Privacy Setup. Private notifications default ON — see
 * docs/SECURITY.md §7. App Lock enforcement itself (the actual lock
 * screen) is a later milestone; this only captures the preference.
 */
export function PrivacySetupScreen() {
  const updateSettings = useUpdateSettings();
  const updateProfile = useUpdateProfile();
  const [appLockEnabled, setAppLockEnabled] = useState(false);
  const [biometricLock, setBiometricLock] = useState(false);
  const [notificationPrivacy, setNotificationPrivacy] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    setIsSubmitting(true);
    const next = getNextOnboardingStep('privacy_setup', { careSetup: null, intent: null });
    await Promise.all([
      updateSettings.mutateAsync({
        app_lock_enabled: appLockEnabled,
        biometric_lock: biometricLock,
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
      <PRISMSwitch label="App Lock" value={appLockEnabled} onValueChange={setAppLockEnabled} />
      <PRISMSwitch label="Biometrics" value={biometricLock} onValueChange={setBiometricLock} />
      <PRISMSwitch
        label="Private notifications"
        description="Private notifications hide sensitive information from your lock screen."
        value={notificationPrivacy}
        onValueChange={setNotificationPrivacy}
      />
    </OnboardingScreenLayout>
  );
}
