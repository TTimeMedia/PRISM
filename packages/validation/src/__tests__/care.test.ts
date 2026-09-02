import { describe, expect, it } from 'vitest';
import { medicationCreateSchema, injectionCreateSchema, appointmentCreateSchema } from '../care';

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
