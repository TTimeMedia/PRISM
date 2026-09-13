import React from 'react';
import { Redirect } from 'expo-router';
import { useSession } from '../lib/auth/AuthProvider';
import { useProfile } from '../lib/profile/queries';

export default function Index() {
  const { session, isLoading, isPasswordRecovery } = useSession();
  const { data: profile, isLoading: profileLoading } = useProfile();

  if (isLoading || (session && !isPasswordRecovery && profileLoading)) {
    return null;
  }

  if (!session || isPasswordRecovery) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (!profile?.onboarding_completed) {
    return <Redirect href="/(onboarding)/philosophy" />;
  }

  return <Redirect href="/(tabs)/today" />;
}
