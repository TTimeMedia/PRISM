import React from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { normalizeOnboardingStep } from '@prism/types';
import { useProfile } from '../../lib/profile/queries';
import { ONBOARDING_ROUTE_SEGMENTS } from '../../lib/onboarding/routes';
import { OnboardingBackButton } from '../../features/onboarding/components/OnboardingBackButton';

/**
 * The 13 Onboarding screens (docs/SCREEN_BIBLE.md §5). Resumes at
 * profile.onboarding_step so an interrupted flow picks back up where it
 * left off, rather than restarting — see docs/SCREEN_BIBLE.md §5 ("the
 * whole flow can be resumed if interrupted"). The root layout only ever
 * mounts this group once `useProfile()` has already resolved, so this
 * read is a cache hit, not a second fetch.
 */
export default function OnboardingLayout() {
  const { data: profile } = useProfile();
  const resumeStep = normalizeOnboardingStep(profile?.onboarding_step);
  const initialRouteName = ONBOARDING_ROUTE_SEGMENTS[resumeStep] ?? 'philosophy';

  return (
    <View style={{ flex: 1 }}>
      <Stack initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="philosophy" />
        <Stack.Screen name="colors" />
        <Stack.Screen name="intent" />
        <Stack.Screen name="identity" />
        <Stack.Screen name="care-setup" />
        <Stack.Screen name="medication-setup" />
        <Stack.Screen name="appointment-setup" />
        <Stack.Screen name="journey-date" />
        <Stack.Screen name="privacy-setup" />
        <Stack.Screen name="reminders" />
        <Stack.Screen name="building" />
        <Stack.Screen name="tour" />
        <Stack.Screen name="ready" />
      </Stack>
      <OnboardingBackButton />
    </View>
  );
}
