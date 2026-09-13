/**
 * Onboarding flow types and branching logic — see docs/SCREEN_BIBLE.md §5
 * and docs/MASTER_BUILD_SPEC.md §06. Kept UI-framework-free so the
 * resume/branching logic is unit-testable without React Native.
 */

export const JOURNEY_STAGES = [
  'exploring',
  'preparing',
  'in_progress',
  'established',
  'somewhere_else',
  'prefer_not_to_say',
] as const;
export type JourneyStage = (typeof JOURNEY_STAGES)[number];

/** Screen 09 "What Brings You Here?" — multi-select, surfaces intent not identity. */
export const INTENT_OPTIONS = [
  'managing_medications',
  'tracking_injections',
  'appointments',
  'lab_work',
  'surgery',
  'legal_changes',
  'milestones',
  'journaling',
  'records',
  'all_in_one_place',
  'still_figuring_out',
  'something_else',
] as const;
export type IntentOption = (typeof INTENT_OPTIONS)[number];

/** Screen 12 "Care Setup" — multi-select; drives which of screens 13-14 appear and which modules get enabled. */
export const CARE_SETUP_OPTIONS = [
  'hormones',
  'medication',
  'injections',
  'patches',
  'gel_cream',
  'blockers',
  'surgery',
  'other',
  'none',
] as const;
export type CareSetupOption = (typeof CARE_SETUP_OPTIONS)[number];

/**
 * The 12 onboarding screens (Screens 08-19), in default sequence. Screens
 * 13-15 (medication/injection/appointment setup) are conditional — see
 * getNextOnboardingStep — so the *actual* path a given user takes is a
 * subsequence of this array, never out of order.
 */
export const ONBOARDING_STEPS = [
  'philosophy',
  'intent',
  'journey_stage',
  'identity',
  'care_setup',
  'medication_setup',
  'injection_setup',
  'appointment_setup',
  'journey_date',
  'privacy_setup',
  'building',
  'ready',
] as const;
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

const MEDICATION_TRACKING_OPTIONS: readonly CareSetupOption[] = [
  'hormones',
  'medication',
  'patches',
  'gel_cream',
  'blockers',
];

export function careSetupImpliesMedication(
  careSetup: readonly string[] | null | undefined,
): boolean {
  if (!careSetup) return false;
  return careSetup.some((option) =>
    MEDICATION_TRACKING_OPTIONS.includes(option as CareSetupOption),
  );
}

export function careSetupImpliesInjection(
  careSetup: readonly string[] | null | undefined,
): boolean {
  if (!careSetup) return false;
  return careSetup.includes('injections');
}

export function intentImpliesAppointments(intent: readonly string[] | null | undefined): boolean {
  if (!intent) return false;
  return intent.includes('appointments');
}

export interface OnboardingBranchContext {
  careSetup: readonly string[] | null | undefined;
  intent: readonly string[] | null | undefined;
}

/**
 * Given the step a user just completed, returns the next step to show —
 * skipping Medication/Injection/Appointment Setup when the user's earlier
 * answers don't call for them. `ready` is terminal (loops to itself; the
 * app treats reaching it as onboarding_completed = true, not a step to
 * resume into again).
 */
export function getNextOnboardingStep(
  current: OnboardingStep,
  ctx: OnboardingBranchContext,
): OnboardingStep {
  switch (current) {
    case 'philosophy':
      return 'intent';
    case 'intent':
      return 'journey_stage';
    case 'journey_stage':
      return 'identity';
    case 'identity':
      return 'care_setup';
    case 'care_setup':
      if (careSetupImpliesMedication(ctx.careSetup)) return 'medication_setup';
      if (careSetupImpliesInjection(ctx.careSetup)) return 'injection_setup';
      if (intentImpliesAppointments(ctx.intent)) return 'appointment_setup';
      return 'journey_date';
    case 'medication_setup':
      if (careSetupImpliesInjection(ctx.careSetup)) return 'injection_setup';
      if (intentImpliesAppointments(ctx.intent)) return 'appointment_setup';
      return 'journey_date';
    case 'injection_setup':
      if (intentImpliesAppointments(ctx.intent)) return 'appointment_setup';
      return 'journey_date';
    case 'appointment_setup':
      return 'journey_date';
    case 'journey_date':
      return 'privacy_setup';
    case 'privacy_setup':
      return 'building';
    case 'building':
      return 'ready';
    case 'ready':
      return 'ready';
  }
}
