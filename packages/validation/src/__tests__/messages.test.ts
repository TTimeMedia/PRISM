import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  appointmentFormSchema,
  medicationCreateSchema,
  medicationScheduleProblems,
} from '../index';

function messages(result: z.SafeParseReturnType<unknown, unknown>): Record<string, string> {
  if (result.success) return {};
  return Object.fromEntries(
    result.error.issues.map((issue) => [issue.path.join('.'), issue.message]),
  );
}

describe('form messages', () => {
  it('never shows zod’s developer wording', () => {
    const result = medicationCreateSchema.safeParse({
      name: null,
      frequency_config: { time_of_day: 7 },
      dosage_text: 'x'.repeat(201),
    });
    const all = Object.values(messages(result));
    expect(all.length).toBeGreaterThan(0);
    for (const message of all) {
      expect(message).not.toMatch(/Expected|received|Required|Invalid/);
    }
    expect(messages(result).name).toBe('Please fill this in.');
    expect(messages(result).dosage_text).toBe('Keep this to 200 characters or fewer.');
  });

  it('treats a cleared medication time as not chosen yet, not as an error', () => {
    for (const time_of_day of [null, '']) {
      expect(
        medicationCreateSchema.safeParse({ name: 'Estradiol', frequency_config: { time_of_day } })
          .success,
      ).toBe(true);
    }
  });

  it('treats a cleared optional date as no date', () => {
    expect(medicationCreateSchema.safeParse({ name: 'Estradiol', start_date: '' }).success).toBe(
      true,
    );
  });

  it('asks for a date in plain words when one is needed', () => {
    const result = appointmentFormSchema.safeParse({ title: 'Endo', date: '' });
    expect(messages(result).date).toBe('Choose a date.');
  });

  it('says what an email should look like', () => {
    const result = z.object({ email: z.string().email() }).safeParse({ email: 'nope' });
    expect(messages(result).email).toBe('Enter an email address, like name@example.com.');
  });
});

describe('medicationScheduleProblems', () => {
  it('has nothing to say without a frequency', () => {
    expect(medicationScheduleProblems({ frequency_type: null, frequency_config: null })).toEqual(
      [],
    );
  });

  it('asks for the time once a frequency is picked', () => {
    expect(medicationScheduleProblems({ frequency_type: 'daily', frequency_config: null })).toEqual(
      [{ path: 'frequency_config.time_of_day', message: 'Choose what time you take it.' }],
    );
    expect(
      medicationScheduleProblems({
        frequency_type: 'daily',
        frequency_config: { time_of_day: '08:00' },
      }),
    ).toEqual([]);
  });

  it('asks for days and the interval where they matter', () => {
    const paths = (type: 'weekly' | 'custom' | 'every_x_days') =>
      medicationScheduleProblems({
        frequency_type: type,
        frequency_config: { time_of_day: '08:00' },
      }).map((problem) => problem.path);
    expect(paths('weekly')).toEqual(['frequency_config.days_of_week']);
    expect(paths('custom')).toEqual(['frequency_config.days_of_week']);
    expect(paths('every_x_days')).toEqual(['frequency_config.interval_days']);
  });
});
