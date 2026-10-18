import type { MedicationCreateInput } from '@prism/validation';
import { medicationResolver, withScheduleDefaults } from '../medicationSchedule';

const base: MedicationCreateInput = {
  name: 'Estradiol (pill)',
  reminder_enabled: true,
};

async function check(values: Partial<MedicationCreateInput>) {
  const result = await medicationResolver(
    { ...base, ...values } as MedicationCreateInput,
    undefined,
    { fields: {}, shouldUseNativeValidation: false },
  );
  return result.errors as Record<string, Record<string, { message?: string }> | undefined>;
}

describe('medicationResolver', () => {
  it('has nothing to say when no frequency was chosen', async () => {
    expect(await check({ frequency_type: null, frequency_config: null })).toEqual({});
  });

  it('accepts a daily schedule with a time', async () => {
    expect(
      await check({ frequency_type: 'daily', frequency_config: { time_of_day: '09:00' } }),
    ).toEqual({});
  });

  it('asks for the time in plain words when it was left out', async () => {
    for (const time_of_day of [undefined, null, '']) {
      const errors = await check({
        frequency_type: 'daily',
        frequency_config: { time_of_day } as MedicationCreateInput['frequency_config'],
      });
      expect(errors.frequency_config?.time_of_day?.message).toBe('Choose what time you take it.');
    }
  });

  it('asks for a day when weekly or custom has none', async () => {
    for (const frequency_type of ['weekly', 'custom'] as const) {
      const errors = await check({
        frequency_type,
        frequency_config: { days_of_week: [], time_of_day: '09:00' },
      });
      expect(errors.frequency_config?.days_of_week?.message).toBe(
        'Pick at least one day so your reminders can be set.',
      );
    }
  });

  it('asks for the interval when every-X-days has none', async () => {
    const errors = await check({
      frequency_type: 'every_x_days',
      frequency_config: { time_of_day: '09:00' },
    });
    expect(errors.frequency_config?.interval_days?.message).toBe(
      'Enter how many days are between doses.',
    );
  });

  it('shows every missing piece at once, including the name', async () => {
    const errors = (await check({
      name: '',
      frequency_type: 'weekly',
      frequency_config: null,
    })) as Record<string, unknown> & {
      name?: { message?: string };
      frequency_config?: Record<string, { message?: string }>;
    };
    expect(errors.name?.message).toBe('Please fill this in.');
    expect(Object.keys(errors.frequency_config ?? {}).sort()).toEqual([
      'days_of_week',
      'time_of_day',
    ]);
  });
});

describe('withScheduleDefaults', () => {
  const now = new Date(2026, 8, 24, 10, 0);

  it('starts every-X-days schedules today when no start date was given', () => {
    const result = withScheduleDefaults(
      { ...base, frequency_type: 'every_x_days', frequency_config: { interval_days: 3 } },
      now,
    );
    expect(result.start_date).toBe('2026-09-24');
  });

  it('keeps a start date that was given', () => {
    const result = withScheduleDefaults(
      {
        ...base,
        frequency_type: 'every_x_days',
        frequency_config: { interval_days: 3 },
        start_date: '2026-10-01',
      },
      now,
    );
    expect(result.start_date).toBe('2026-10-01');
  });

  it('leaves other schedules alone', () => {
    const values: MedicationCreateInput = { ...base, frequency_type: 'daily' };
    expect(withScheduleDefaults(values, now)).toBe(values);
  });
});
