import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router, useSegments } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getPreviousOnboardingStep, ONBOARDING_STEPS, type OnboardingStep } from '@prism/types';
import { PRISMIconButton, spacing, useTheme } from '@prism/ui';
import { onboardingStepHref, ONBOARDING_ROUTE_SEGMENTS } from '../../../lib/onboarding/routes';
import { careSetupSignalFromModules } from '../../../lib/onboarding/careSetupSignal';
import { useModules, useProfile, useUpdateProfile } from '../../../lib/profile/queries';

/** Screens that are a moment, not a place to go back from. */
const NO_BACK: OnboardingStep[] = ['building'];

function stepFromSegment(segment: string | undefined): OnboardingStep | null {
  return ONBOARDING_STEPS.find((step) => ONBOARDING_ROUTE_SEGMENTS[step] === segment) ?? null;
}

/**
 * A Back arrow floating over every onboarding screen. Onboarding moves
 * forward by replacing screens, so there is no navigation history to pop;
 * instead this steps to the previous screen in the flow — skipping the
 * setup screens that were skipped on the way forward — and moves the saved
 * resume point back with it. The first screen has nothing before it, and
 * the short "Building Prism" transition isn't somewhere to go back from.
 */
export function OnboardingBackButton() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const { data: profile } = useProfile();
  const { data: modules } = useModules();
  const updateProfile = useUpdateProfile();

  const step = stepFromSegment(segments[segments.length - 1]);
  if (!step || NO_BACK.includes(step)) return null;
  const previous = getPreviousOnboardingStep(step, {
    careSetup: careSetupSignalFromModules(modules),
    intent: profile?.intent,
  });
  if (!previous) return null;

  const goBack = () => {
    router.replace(onboardingStepHref(previous));
    // Keep the resume point in step with what's on screen. Fire and forget:
    // moving back should never wait on the network.
    updateProfile.mutate({ onboarding_step: previous });
  };

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { top: insets.top + spacing.xs }]}>
      <PRISMIconButton accessibilityLabel="Back" onPress={goBack}>
        <ArrowLeft size={24} color={theme.colors.text.primary} />
      </PRISMIconButton>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: spacing.sm,
    zIndex: 10,
  },
});
