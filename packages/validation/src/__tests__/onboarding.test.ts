import { describe, expect, it } from 'vitest';
import {
  appointmentSetupSchema,
  careSetupSchema,
  deriveAppointmentTitle,
  identitySchema,
  intentSchema,
  journeyDateSchema,
  journeyStageSchema,
  privacySetupSchema,
} from '../onboarding';

describe('intentSchema', () => {
  it('accepts an empty selection — every onboarding step is skippable', () => {
    expect(intentSchema.safeParse({ intent: [] }).success).toBe(true);
  });

  it('rejects a value outside the fixed option list', () => {
    expect(intentSchema.safeParse({ intent: ['not_a_real_option'] }).success).toBe(false);
  });
});

describe('journeyStageSchema', () => {
  it('accepts null — Journey Stage is optional and never forced', () => {
    expect(journeyStageSchema.safeParse({ journey_stage: null }).success).toBe(true);
  });

  it('rejects a value outside the six defined stages', () => {
    expect(journeyStageSchema.safeParse({ journey_stage: 'almost_there' }).success).toBe(false);
  });
});

describe('identitySchema', () => {
  it('accepts a completely empty object — no identity field is required', () => {
    expect(identitySchema.safeParse({}).success).toBe(true);
  });

  it('accepts free-text gender and pronouns', () => {
    const result = identitySchema.safeParse({ pronouns: 'they/them', gender: 'nonbinary' });
    expect(result.success).toBe(true);
  });
});

describe('careSetupSchema', () => {
  it('accepts "none" alone', () => {
    expect(careSetupSchema.safeParse({ care_setup: ['none'] }).success).toBe(true);
  });

  it('rejects an unrecognized option', () => {
    expect(careSetupSchema.safeParse({ care_setup: ['something_invalid'] }).success).toBe(false);
  });
});

describe('appointmentSetupSchema + deriveAppointmentTitle', () => {
  it('accepts every field omitted — Screen 15 is entirely optional/skippable', () => {
    expect(appointmentSetupSchema.safeParse({}).success).toBe(true);
  });

  it('derives a real title from category when provided', () => {
    expect(deriveAppointmentTitle('Endocrinology')).toBe('Endocrinology');
  });

  it('falls back to a generic title when no category was given, never leaving it blank', () => {
    expect(deriveAppointmentTitle(null)).toBe('Appointment');
    expect(deriveAppointmentTitle(undefined)).toBe('Appointment');
    expect(deriveAppointmentTitle('   ')).toBe('Appointment');
  });
});

describe('journeyDateSchema', () => {
  it('accepts null — "I don\'t know" / "no specific date" / "Skip" never invent a date', () => {
    expect(journeyDateSchema.safeParse({ journey_start_date: null }).success).toBe(true);
  });

  it('rejects a malformed date', () => {
    expect(journeyDateSchema.safeParse({ journey_start_date: 'not-a-date' }).success).toBe(false);
  });
});

describe('privacySetupSchema', () => {
  it('defaults notification_privacy to true when omitted — private by default', () => {
    const result = privacySetupSchema.parse({});
    expect(result.notification_privacy).toBe(true);
    expect(result.app_lock_enabled).toBe(false);
    expect(result.biometric_lock).toBe(false);
  });
});
