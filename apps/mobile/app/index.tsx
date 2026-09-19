import React from 'react';
import { Redirect } from 'expo-router';
import { useSession } from '../lib/auth/AuthProvider';
import { useProfile } from '../lib/profile/queries';
import { onboardingStepHref } from '../lib/onboarding/routes';

export default function Index() {
  const { session, isLoading, isPasswordRecovery } = useSession();
  const { data: profile, isLoading: profileLoading } = useProfile();

  if (isLoading || (session && !isPasswordRecovery && profileLoading)) {
    return null;
  }

  if (isPasswordRecovery) {
    return <Redirect href="/(auth)/reset-password" />;
  }

  if (!session) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (!profile?.onboarding_completed) {
    return <Redirect href={onboardingStepHref(profile?.onboarding_step ?? 'philosophy')} />;
  }

  return <Redirect href="/(tabs)/today" />;
}
