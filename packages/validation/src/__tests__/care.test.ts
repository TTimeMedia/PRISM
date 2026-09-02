import { describe, expect, it } from 'vitest';
import {
  medicationCreateSchema,
  medicationUpdateSchema,
  medicationLogCreateSchema,
  injectionCreateSchema,
  appointmentCreateSchema,
  appointmentUpdateSchema,
  appointmentFormSchema,
} from '../care';

describe('medicationCreateSchema', () => {
  it('accepts a minimal valid medication with only a name', () => {
    const result = medicationCreateSchema.safeParse({ name: 'Testosterone' });
    expect(result.success).toBe(true);
  });

  it('accepts user-entered dosage_text without judging its content', () => {
    // PRISM stores and displays user-entered dosage; it never validates
    // whether a dose is "correct" — see docs/PRODUCT_BIBLE.md §12.
    const result = medicationCreateSchema.safeParse({
      name: 'Estradiol',
      dosage_text: 'whatever my provider told me',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an empty name', () => {
    const result = medicationCreateSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid form value', () => {
    const result = medicationCreateSchema.safeParse({ name: 'X', form: 'syringe-of-doom' });
    expect(result.success).toBe(false);
  });

  it('accepts a well-formed frequency_config', () => {
    const result = medicationCreateSchema.safeParse({
      name: 'X',
      frequency_type: 'every_x_days',
      frequency_config: { interval_days: 7, time_of_day: '08:00' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects a malformed time_of_day', () => {
    const result = medicationCreateSchema.safeParse({
      name: 'X',
      frequency_config: { time_of_day: '25:99' },
    });
    expect(result.success).toBe(false);
  });
});

describe('injectionCreateSchema', () => {
  it('accepts "not_tracked" as a valid site — tracking is optional', () => {
    const result = injectionCreateSchema.safeParse({
      injected_at: '2026-01-01T08:00:00Z',
      site: 'not_tracked',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid site value', () => {
    const result = injectionCreateSchema.safeParse({
      injected_at: '2026-01-01T08:00:00Z',
      site: 'left_arm',
    });
    expect(result.success).toBe(false);
  });
});

describe('appointmentCreateSchema', () => {
  it('accepts a custom, non-suggested category (users may add their own)', () => {
    const result = appointmentCreateSchema.safeParse({
      title: 'Follow-up',
      category: 'Something not on the suggested list',
      starts_at: '2026-01-01T08:00:00Z',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a missing title', () => {
    const result = appointmentCreateSchema.safeParse({ starts_at: '2026-01-01T08:00:00Z' });
    expect(result.success).toBe(false);
  });
});

describe('medicationUpdateSchema', () => {
  it('accepts a partial update — e.g. just pausing via end_date', () => {
    const result = medicationUpdateSchema.safeParse({ end_date: '2026-06-01' });
    expect(result.success).toBe(true);
  });

  it('accepts an empty object — no fields required on update', () => {
    const result = medicationUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('still rejects an invalid form value when provided', () => {
    const result = medicationUpdateSchema.safeParse({ form: 'not-a-real-form' });
    expect(result.success).toBe(false);
  });
});

describe('medicationLogCreateSchema', () => {
  it('accepts a completed entry with medication_id, scheduled_at, and status', () => {
    const result = medicationLogCreateSchema.safeParse({
      medication_id: '11111111-1111-1111-1111-111111111111',
      scheduled_at: '2026-01-01T08:00:00Z',
      status: 'completed',
    });
    expect(result.success).toBe(true);
  });

  it('never shames a user for a status — skipped_intentionally is a valid, first-class status', () => {
    const result = medicationLogCreateSchema.safeParse({
      medication_id: '11111111-1111-1111-1111-111111111111',
      scheduled_at: '2026-01-01T08:00:00Z',
      status: 'skipped_intentionally',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a missing medication_id', () => {
    const result = medicationLogCreateSchema.safeParse({
      scheduled_at: '2026-01-01T08:00:00Z',
      status: 'completed',
    });
    expect(result.success).toBe(false);
  });
});

describe('appointmentUpdateSchema', () => {
  it('accepts a partial update', () => {
    const result = appointmentUpdateSchema.safeParse({ location: 'New location' });
    expect(result.success).toBe(true);
  });
});

describe('appointmentFormSchema', () => {
  it('accepts a well-formed Add/Edit Appointment submission with separate date/time', () => {
    const result = appointmentFormSchema.safeParse({
      title: 'Follow-up',
      date: '2026-06-01',
      time: '09:30',
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing title — CARE's form asks for one directly, unlike onboarding", () => {
    const result = appointmentFormSchema.safeParse({ date: '2026-06-01' });
    expect(result.success).toBe(false);
  });

  it('rejects a malformed time', () => {
    const result = appointmentFormSchema.safeParse({
      title: 'Follow-up',
      date: '2026-06-01',
      time: '9:3',
    });
    expect(result.success).toBe(false);
  });
});
