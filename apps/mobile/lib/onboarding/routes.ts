import type { Href } from 'expo-router';
import type { OnboardingStep } from '@prism/types';

/**
 * OnboardingStep values are snake_case (they're also stored verbatim in
 * profiles.onboarding_step); route segments stay kebab-case to match the
 * rest of the app's routes (see app/(auth)/). This is the one place that
 * translates between the two.
 */
export const ONBOARDING_ROUTE_SEGMENTS: Record<OnboardingStep, string> = {
  philosophy: 'philosophy',
  colors: 'colors',
  intent: 'intent',
  identity: 'identity',
  care_setup: 'care-setup',
  medication_setup: 'medication-setup',
  appointment_setup: 'appointment-setup',
  journey_date: 'journey-date',
  privacy_setup: 'privacy-setup',
  reminders: 'reminders',
  building: 'building',
  tour: 'tour',
  ready: 'ready',
};

/**
 * A `${string}` template built from ONBOARDING_ROUTE_SEGMENTS doesn't
 * structurally match expo-router's generated `Href` union (a closed set of
 * literal route strings), even though every value it produces is one of
 * those literals — so this is spelled out as an explicit literal-to-literal
 * map instead of a template interpolation.
 */
const ONBOARDING_HREFS: Record<OnboardingStep, Href> = {
  philosophy: '/(onboarding)/philosophy',
  colors: '/(onboarding)/colors',
  intent: '/(onboarding)/intent',
  identity: '/(onboarding)/identity',
  care_setup: '/(onboarding)/care-setup',
  medication_setup: '/(onboarding)/medication-setup',
  appointment_setup: '/(onboarding)/appointment-setup',
  journey_date: '/(onboarding)/journey-date',
  privacy_setup: '/(onboarding)/privacy-setup',
  reminders: '/(onboarding)/reminders',
  building: '/(onboarding)/building',
  tour: '/(onboarding)/tour',
  ready: '/(onboarding)/ready',
};

export function onboardingStepHref(step: OnboardingStep): Href {
  return ONBOARDING_HREFS[step];
}
