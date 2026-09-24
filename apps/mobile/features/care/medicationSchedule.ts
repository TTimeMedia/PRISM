import type { MedicationCreateInput } from '@prism/validation';

/**
 * A schedule that can't produce any dose times: weekly/custom without a
 * day picked, or every-X-days without the X. Reminders and TODAY both
 * resolve their times from this, so saving one of these silently makes the
 * medication never come up — better to ask for the missing piece.
 */
export function scheduleProblem(
  values: Pick<MedicationCreateInput, 'frequency_type' | 'frequency_config'>,
): {
  path: 'frequency_config.days_of_week' | 'frequency_config.interval_days';
  message: string;
} | null {
  const { frequency_type: type, frequency_config: config } = values;
  if ((type === 'weekly' || type === 'custom') && !config?.days_of_week?.length) {
    return {
      path: 'frequency_config.days_of_week',
      message: 'Pick at least one day so your reminders can be set.',
    };
  }
  if (type === 'every_x_days' && !config?.interval_days) {
    return {
      path: 'frequency_config.interval_days',
      message: 'Enter how many days are between doses.',
    };
  }
  return null;
}

function todayIso(now: Date): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/**
 * Every-X-days schedules count from the start date, so without one there is
 * nothing to count from. Default it to today rather than saving a
 * medication that never comes up.
 */
export function withScheduleDefaults(
  values: MedicationCreateInput,
  now: Date = new Date(),
): MedicationCreateInput {
  if (values.frequency_type === 'every_x_days' && !values.start_date) {
    return { ...values, start_date: todayIso(now) };
  }
  return values;
}
