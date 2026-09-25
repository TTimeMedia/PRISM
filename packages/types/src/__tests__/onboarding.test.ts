import { describe, expect, it } from 'vitest';
import {
  careSetupImpliesMedication,
  getNextOnboardingStep,
  intentImpliesAppointments,
  ONBOARDING_STEPS,
  getPreviousOnboardingStep,
  modulesForIntent,
  normalizeOnboardingStep,
} from '../onboarding';

describe('careSetupImpliesMedication', () => {
  it('is true for any medication-family selection, injections included', () => {
    expect(careSetupImpliesMedication(['hormones'])).toBe(true);
    expect(careSetupImpliesMedication(['patches'])).toBe(true);
    expect(careSetupImpliesMedication(['gel_cream'])).toBe(true);
    expect(careSetupImpliesMedication(['blockers'])).toBe(true);
    expect(careSetupImpliesMedication(['medication'])).toBe(true);
    // An injection is a medication.
    expect(careSetupImpliesMedication(['injections'])).toBe(true);
    expect(careSetupImpliesMedication(['surgery', 'injections'])).toBe(true);
  });

  it('is false for surgery, other, none, or nothing selected', () => {
    expect(careSetupImpliesMedication(['surgery'])).toBe(false);
    expect(careSetupImpliesMedication(['other'])).toBe(false);
    expect(careSetupImpliesMedication(['none'])).toBe(false);
    expect(careSetupImpliesMedication(null)).toBe(false);
    expect(careSetupImpliesMedication([])).toBe(false);
  });
});

describe('intentImpliesAppointments', () => {
  it('is true only when appointments is in the intent list', () => {
    expect(intentImpliesAppointments(['appointments'])).toBe(true);
    expect(intentImpliesAppointments(['journaling', 'appointments'])).toBe(true);
    expect(intentImpliesAppointments(['journaling'])).toBe(false);
    expect(intentImpliesAppointments(null)).toBe(false);
  });
});

describe('getNextOnboardingStep', () => {
  it('walks the full linear path when nothing conditional is selected', () => {
    const ctx = { careSetup: ['none'], intent: [] };
    let step = getNextOnboardingStep('philosophy', ctx);
    expect(step).toBe('colors');
    step = getNextOnboardingStep(step, ctx);
    expect(step).toBe('intent');
    step = getNextOnboardingStep(step, ctx);
    expect(step).toBe('identity');
    step = getNextOnboardingStep(step, ctx);
    expect(step).toBe('care_setup');
    // No medication/appointment signal — jump straight past both setup screens.
    step = getNextOnboardingStep(step, ctx);
    expect(step).toBe('journey_date');
    step = getNextOnboardingStep(step, ctx);
    expect(step).toBe('privacy_setup');
    step = getNextOnboardingStep(step, ctx);
    expect(step).toBe('reminders');
    step = getNextOnboardingStep(step, ctx);
    expect(step).toBe('building');
    step = getNextOnboardingStep(step, ctx);
    expect(step).toBe('tour');
    step = getNextOnboardingStep(step, ctx);
    expect(step).toBe('ready');
    // Terminal.
    expect(getNextOnboardingStep('ready', ctx)).toBe('ready');
  });

  it('routes through Medication Setup then Appointment Setup when both apply', () => {
    const ctx = { careSetup: ['hormones'], intent: ['appointments'] };
    expect(getNextOnboardingStep('care_setup', ctx)).toBe('medication_setup');
    expect(getNextOnboardingStep('medication_setup', ctx)).toBe('appointment_setup');
    expect(getNextOnboardingStep('appointment_setup', ctx)).toBe('journey_date');
  });

  it('sends an injections answer to Medication Setup, since an injection is a medication', () => {
    const ctx = { careSetup: ['injections'], intent: [] };
    expect(getNextOnboardingStep('care_setup', ctx)).toBe('medication_setup');
    expect(getNextOnboardingStep('medication_setup', ctx)).toBe('journey_date');
  });

  it('skips Medication Setup but still shows Appointment Setup from intent alone', () => {
    const ctx = { careSetup: ['surgery'], intent: ['appointments'] };
    expect(getNextOnboardingStep('care_setup', ctx)).toBe('appointment_setup');
  });

  it('never produces a step outside the declared ONBOARDING_STEPS set', () => {
    const contexts = [
      { careSetup: [], intent: [] },
      { careSetup: ['hormones'], intent: [] },
      { careSetup: ['injections'], intent: [] },
      { careSetup: [], intent: ['appointments'] },
      { careSetup: ['hormones', 'injections'], intent: ['appointments'] },
    ];
    for (const ctx of contexts) {
      for (const step of ONBOARDING_STEPS) {
        expect(ONBOARDING_STEPS).toContain(getNextOnboardingStep(step, ctx));
      }
    }
  });
});

describe('getPreviousOnboardingStep', () => {
  it('has nothing before the first screen', () => {
    expect(getPreviousOnboardingStep('philosophy', { careSetup: null, intent: null })).toBeNull();
  });

  it('walks the straight-through steps backwards', () => {
    const ctx = { careSetup: null, intent: null };
    expect(getPreviousOnboardingStep('colors', ctx)).toBe('philosophy');
    expect(getPreviousOnboardingStep('intent', ctx)).toBe('colors');
    expect(getPreviousOnboardingStep('identity', ctx)).toBe('intent');
    expect(getPreviousOnboardingStep('care_setup', ctx)).toBe('identity');
    expect(getPreviousOnboardingStep('privacy_setup', ctx)).toBe('journey_date');
    expect(getPreviousOnboardingStep('ready', ctx)).toBe('tour');
    expect(getPreviousOnboardingStep('tour', ctx)).toBe('reminders');
  });

  it('skips the setup screens that were skipped going forward', () => {
    expect(
      getPreviousOnboardingStep('journey_date', { careSetup: ['none'], intent: ['journaling'] }),
    ).toBe('care_setup');
    expect(getPreviousOnboardingStep('journey_date', { careSetup: ['hormones'], intent: [] })).toBe(
      'medication_setup',
    );
    expect(
      getPreviousOnboardingStep('journey_date', { careSetup: ['injections'], intent: [] }),
    ).toBe('medication_setup');
    expect(
      getPreviousOnboardingStep('journey_date', {
        careSetup: ['hormones'],
        intent: ['appointments'],
      }),
    ).toBe('appointment_setup');
    expect(
      getPreviousOnboardingStep('appointment_setup', {
        careSetup: ['hormones'],
        intent: ['appointments'],
      }),
    ).toBe('medication_setup');
    expect(
      getPreviousOnboardingStep('appointment_setup', {
        careSetup: ['none'],
        intent: ['appointments'],
      }),
    ).toBe('care_setup');
  });
});

describe('normalizeOnboardingStep', () => {
  it('keeps every current step as it is', () => {
    for (const step of ONBOARDING_STEPS) expect(normalizeOnboardingStep(step)).toBe(step);
  });

  it('moves anyone saved on the removed Journey Stage screen on to Identity', () => {
    expect(normalizeOnboardingStep('journey_stage')).toBe('identity');
  });

  it('moves anyone saved on the removed Injection Setup screen on to the next step', () => {
    expect(normalizeOnboardingStep('injection_setup')).toBe('journey_date');
  });

  it('starts from the beginning when nothing usable was saved', () => {
    expect(normalizeOnboardingStep(null)).toBe('philosophy');
    expect(normalizeOnboardingStep(undefined)).toBe('philosophy');
    expect(normalizeOnboardingStep('something_old')).toBe('philosophy');
  });
});

describe('modulesForIntent', () => {
  it('turns on just what was picked, in a steady order', () => {
    expect(modulesForIntent(['journaling', 'managing_medications'])).toEqual([
      'medications',
      'journal',
    ]);
    expect(modulesForIntent(['appointments', 'milestones'])).toEqual([
      'appointments',
      'milestones',
    ]);
  });

  it('counts injections as medications', () => {
    expect(modulesForIntent(['tracking_injections'])).toEqual(['medications']);
    expect(modulesForIntent(['tracking_injections', 'managing_medications'])).toEqual([
      'medications',
    ]);
  });

  it('turns everything on for "all in one place", "still figuring out", or no answer', () => {
    const all = ['medications', 'appointments', 'milestones', 'journal'];
    expect(modulesForIntent(['all_in_one_place'])).toEqual(all);
    expect(modulesForIntent(['still_figuring_out', 'journaling'])).toEqual(all);
    expect(modulesForIntent([])).toEqual(all);
    expect(modulesForIntent(null)).toEqual(all);
  });

  it('turns nothing on for topics that have no feature yet', () => {
    expect(modulesForIntent(['lab_work', 'legal_changes'])).toEqual([]);
  });
});
