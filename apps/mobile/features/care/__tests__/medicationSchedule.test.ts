import type { MedicationCreateInput } from '@prism/validation';
import { scheduleProblem, withScheduleDefaults } from '../medicationSchedule';

const base: MedicationCreateInput = {
  name: 'Estradiol (pill)',
  reminder_enabled: true,
};

describe('scheduleProblem', () => {
  it('has nothing to say when no frequency was chosen', () => {
    expect(scheduleProblem({ frequency_type: null, frequency_config: null })).toBeNull();
  });

  it('accepts a daily schedule with no extra details', () => {
    expect(scheduleProblem({ frequency_type: 'daily', frequency_config: null })).toBeNull();
  });

  it('asks for a day when weekly or custom has none', () => {
    for (const frequency_type of ['weekly', 'custom'] as const) {
      expect(
        scheduleProblem({ frequency_type, frequency_config: { days_of_week: [] } })?.path,
      ).toBe('frequency_config.days_of_week');
      expect(scheduleProblem({ frequency_type, frequency_config: null })?.path).toBe(
        'frequency_config.days_of_week',
      );
    }
  });

  it('accepts weekly and custom once a day is picked', () => {
    expect(
      scheduleProblem({ frequency_type: 'weekly', frequency_config: { days_of_week: [1] } }),
    ).toBeNull();
    expect(
      scheduleProblem({ frequency_type: 'custom', frequency_config: { days_of_week: [2, 5] } }),
    ).toBeNull();
  });

  it('asks for the interval when every-X-days has none', () => {
    expect(scheduleProblem({ frequency_type: 'every_x_days', frequency_config: null })?.path).toBe(
      'frequency_config.interval_days',
    );
    expect(
      scheduleProblem({ frequency_type: 'every_x_days', frequency_config: { interval_days: 3 } }),
    ).toBeNull();
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
