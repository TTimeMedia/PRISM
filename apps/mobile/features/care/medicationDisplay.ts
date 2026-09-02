import type { FrequencyConfig, FrequencyType } from '@prism/types';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * A plain-language description of a medication's configured recurrence —
 * "Schedule" on Screens 24/26. This describes the stored pattern, it does
 * not resolve it into a next-occurrence date/time: no real
 * scheduling-resolution engine exists yet (see docs/BUILD_STATUS.md
 * Known Technical Risks — the same gap that keeps TODAY from classifying
 * "medication due today"). Deliberately honest rather than inventing a
 * fake "next dose" timestamp.
 */
export function describeFrequency(
  frequencyType: FrequencyType | null,
  config: FrequencyConfig | null,
): string {
  switch (frequencyType) {
    case 'daily':
      return config?.time_of_day ? `Daily at ${config.time_of_day}` : 'Daily';
    case 'weekly': {
      const days = config?.days_of_week?.map((d) => DAY_LABELS[d]).join(', ');
      return days ? `Weekly on ${days}` : 'Weekly';
    }
    case 'every_x_days':
      return config?.interval_days ? `Every ${config.interval_days} days` : 'Every few days';
    case 'custom':
      return 'Custom schedule';
    default:
      return 'No schedule set';
  }
}

export function isMedicationActive(endDate: string | null): boolean {
  if (!endDate) return true;
  return endDate >= new Date().toISOString().slice(0, 10);
}
