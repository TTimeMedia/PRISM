import type { Appointment, Medication } from '@prism/types';
import {
  appointmentReminderTimes,
  isMedicationDueOn,
  medicationNudgeTimes,
  needsDatedReminders,
  resolveMedicationOccurrences,
  resolveNextAppointmentOccurrence,
  resolveNextMedicationOccurrence,
} from '../scheduleResolution';

function medication(overrides: Partial<Medication> = {}): Medication {
  return {
    id: 'm1',
    user_id: 'u1',
    name: 'Testosterone',
    form: 'injection',
    dosage_text: null,
    frequency_type: null,
    frequency_config: null,
    start_date: null,
    end_date: null,
    reminder_enabled: true,
    notes: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function appointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: 'a1',
    user_id: 'u1',
    title: 'Endocrinology follow-up',
    provider: null,
    category: null,
    starts_at: '2026-06-20T14:00:00Z',
    ends_at: null,
    location: null,
    notes: null,
    reminder_enabled: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

// A fixed local "now" — 2026-06-15 08:00 local time.
const NOW = new Date(2026, 5, 15, 8, 0, 0);

describe('resolveMedicationOccurrences', () => {
  it('returns nothing for a medication with no frequency_type', () => {
    expect(resolveMedicationOccurrences(medication(), NOW)).toEqual([]);
  });

  it('daily: resolves one occurrence per day at the configured time', () => {
    const med = medication({
      frequency_type: 'daily',
      frequency_config: { time_of_day: '09:00' },
    });
    const occurrences = resolveMedicationOccurrences(med, NOW, 3);
    expect(occurrences).toHaveLength(4); // today + 3 more days
    expect(occurrences[0]!.getHours()).toBe(9);
    expect(occurrences[0]!.getDate()).toBe(15);
    expect(occurrences[1]!.getDate()).toBe(16);
  });

  it('daily: skips today if the configured time has already passed', () => {
    const med = medication({
      frequency_type: 'daily',
      frequency_config: { time_of_day: '07:00' }, // before NOW's 08:00
    });
    const occurrences = resolveMedicationOccurrences(med, NOW, 1);
    expect(occurrences[0]!.getDate()).toBe(16);
  });

  it('weekly: resolves only on the selected weekday(s)', () => {
    const med = medication({
      frequency_type: 'weekly',
      frequency_config: { days_of_week: [NOW.getDay()], time_of_day: '09:00' },
    });
    const occurrences = resolveMedicationOccurrences(med, NOW, 14);
    // Every occurrence must fall on NOW's weekday.
    expect(occurrences.every((o) => o.getDay() === NOW.getDay())).toBe(true);
    expect(occurrences.length).toBeGreaterThanOrEqual(2);
  });

  it('weekly: returns nothing when days_of_week is empty', () => {
    const med = medication({ frequency_type: 'weekly', frequency_config: { days_of_week: [] } });
    expect(resolveMedicationOccurrences(med, NOW, 14)).toEqual([]);
  });

  it('every_x_days: steps forward from start_date by interval_days', () => {
    const med = medication({
      frequency_type: 'every_x_days',
      frequency_config: { interval_days: 3, time_of_day: '09:00' },
      start_date: '2026-06-13',
    });
    // Anchor 06-13, every 3 days: 06-13, 06-16, 06-19, 06-22...
    const occurrences = resolveMedicationOccurrences(med, NOW, 10);
    const dates = occurrences.map((o) => o.getDate());
    expect(dates).toEqual([16, 19, 22, 25]);
  });

  it('every_x_days: resolves nothing without a start_date to anchor from', () => {
    const med = medication({
      frequency_type: 'every_x_days',
      frequency_config: { interval_days: 3 },
      start_date: null,
    });
    expect(resolveMedicationOccurrences(med, NOW, 10)).toEqual([]);
  });

  it('respects end_date (also used for Pause — see docs/DECISIONS.md § CARE)', () => {
    const med = medication({
      frequency_type: 'daily',
      frequency_config: { time_of_day: '09:00' },
      end_date: '2026-06-16',
    });
    const occurrences = resolveMedicationOccurrences(med, NOW, 5);
    expect(occurrences.every((o) => o.getDate() <= 16)).toBe(true);
    expect(occurrences).toHaveLength(2); // 06-15, 06-16
  });
});

describe('resolveNextMedicationOccurrence', () => {
  it('returns the single soonest occurrence', () => {
    const med = medication({
      frequency_type: 'daily',
      frequency_config: { time_of_day: '09:00' },
    });
    const next = resolveNextMedicationOccurrence(med, NOW);
    expect(next?.getDate()).toBe(15);
  });

  it('returns null when there is nothing to resolve', () => {
    expect(resolveNextMedicationOccurrence(medication(), NOW)).toBeNull();
  });
});

describe('isMedicationDueOn', () => {
  it('is true when an occurrence falls on the same local day, even earlier in the day', () => {
    const med = medication({
      frequency_type: 'daily',
      frequency_config: { time_of_day: '07:00' }, // earlier than NOW's 08:00
    });
    expect(isMedicationDueOn(med, NOW)).toBe(true);
  });

  it('is false when the next occurrence is tomorrow', () => {
    const med = medication({
      frequency_type: 'weekly',
      frequency_config: { days_of_week: [(NOW.getDay() + 1) % 7] },
    });
    expect(isMedicationDueOn(med, NOW)).toBe(false);
  });
});

describe('resolveNextAppointmentOccurrence', () => {
  it('returns starts_at when it is in the future', () => {
    const appt = appointment({ starts_at: '2026-06-20T14:00:00Z' });
    expect(resolveNextAppointmentOccurrence(appt, NOW)?.toISOString()).toBe(
      '2026-06-20T14:00:00.000Z',
    );
  });

  it('returns null when starts_at has already passed', () => {
    const appt = appointment({ starts_at: '2026-06-01T14:00:00Z' });
    expect(resolveNextAppointmentOccurrence(appt, NOW)).toBeNull();
  });
});

const baseMedication = medication();

describe('appointmentReminderTimes', () => {
  const appt = {
    id: 'a1',
    starts_at: '2026-10-10T15:00:00.000Z',
  } as unknown as Appointment;
  const now = new Date('2026-10-01T00:00:00.000Z');

  it('gives one time per lead, earliest first', () => {
    const times = appointmentReminderTimes(appt, [0, 60, 1440], now).map((d) => d.toISOString());
    expect(times).toEqual([
      '2026-10-09T15:00:00.000Z',
      '2026-10-10T14:00:00.000Z',
      '2026-10-10T15:00:00.000Z',
    ]);
  });

  it('drops times that have already passed and repeats', () => {
    const late = new Date('2026-10-10T14:30:00.000Z');
    expect(
      appointmentReminderTimes(appt, [0, 0, 60, 1440], late).map((d) => d.toISOString()),
    ).toEqual(['2026-10-10T15:00:00.000Z']);
  });

  it('has nothing to schedule with no leads', () => {
    expect(appointmentReminderTimes(appt, [], now)).toEqual([]);
  });
});

describe('needsDatedReminders', () => {
  const now = new Date(2026, 9, 1, 9, 0);
  const med = (o: Partial<Medication>) => ({ ...baseMedication, ...o }) as Medication;

  it('is false for an open-ended medication that has started', () => {
    expect(needsDatedReminders(med({ start_date: '2026-09-01', end_date: null }), now)).toBe(false);
    expect(needsDatedReminders(med({ start_date: null, end_date: null }), now)).toBe(false);
  });

  it('is true for a paused or ended medication', () => {
    expect(needsDatedReminders(med({ end_date: '2026-09-15' }), now)).toBe(true);
  });

  it('is true when the start date is still ahead', () => {
    expect(needsDatedReminders(med({ start_date: '2026-10-20' }), now)).toBe(true);
  });
});

describe('medicationNudgeTimes', () => {
  it('follows each of the next doses by the delay', () => {
    const daily = {
      ...baseMedication,
      frequency_type: 'daily',
      frequency_config: { time_of_day: '09:00' },
    } as Medication;
    const now = new Date(2026, 9, 1, 8, 0);
    const result = medicationNudgeTimes(daily, 30, now, 2);
    expect(result).toHaveLength(2);
    expect(result[0]?.nudgeAt.getTime() - (result[0]?.doseAt.getTime() ?? 0)).toBe(30 * 60 * 1000);
  });

  it('leaves out a nudge whose time has already gone by', () => {
    const daily = {
      ...baseMedication,
      frequency_type: 'daily',
      frequency_config: { time_of_day: '09:00' },
    } as Medication;
    // Dose was at 09:00 today; it is 09:40, so today's 09:30 nudge is past and the dose itself isn't upcoming.
    const now = new Date(2026, 9, 1, 9, 40);
    const result = medicationNudgeTimes(daily, 30, now, 3);
    expect(result.every((r) => r.nudgeAt > now)).toBe(true);
  });
});
