import type { Medication, FrequencyConfig, FrequencyType } from '@prism/types';
import { resolveNextMedicationOccurrence } from '../../lib/reminders/scheduleResolution';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * A plain-language description of a medication's configured recurrence —
 * "Schedule" on Screens 24/26. This describes the stored pattern; see
 * `describeNextDose` below for the resolved next-occurrence date/time
 * (lib/reminders/scheduleResolution.ts).
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

/** "Next dose" on Screens 24/26 — resolved via lib/reminders/scheduleResolution.ts, never invented. */
export function describeNextDose(medication: Medication): string {
  if (!medication.frequency_type) return 'Not scheduled';
  const next = resolveNextMedicationOccurrence(medication);
  return next ? next.toLocaleString() : 'None scheduled';
}
