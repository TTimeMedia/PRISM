import React from 'react';
import { Redirect } from 'expo-router';
import type { OnboardingStep } from '@prism/types';
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
    const resumeStep = (profile?.onboarding_step as OnboardingStep | null) ?? 'philosophy';
    return <Redirect href={onboardingStepHref(resumeStep)} />;
  }

  return <Redirect href="/(tabs)/today" />;
}
