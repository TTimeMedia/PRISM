import type { Appointment, Medication } from '@prism/types';
import { toISODateTime } from '../care/dateTime';

/**
 * Resolves a medication's `frequency_type`/`frequency_config` into
 * concrete local-time occurrence dates — the reminder-scheduling
 * resolution engine flagged as missing across CARE/JOURNEY/YOU's
 * completion notes (see docs/DECISIONS.md § Reminders). Pure and
 * deterministic: takes already-fetched records plus an explicit `now`,
 * used by both the personalization engine (TODAY's due-today
 * classification) and the local-notification scheduler.
 *
 * Occurrence times are computed in local time via `toISODateTime`
 * (no `Z` suffix, so the JS runtime interprets it in the device's own
 * timezone) — consistent with docs/TECHNICAL_BIBLE.md §14's "a dose
 * time should not move when a user travels" rule.
 */

const DEFAULT_WINDOW_DAYS = 30;
const DEFAULT_TIME_OF_DAY = '09:00';
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function combineLocal(date: Date, timeOfDay: string | undefined): Date {
  return new Date(toISODateTime(isoDate(date), timeOfDay ?? DEFAULT_TIME_OF_DAY));
}

/** `medications.end_date` also represents Pause (see docs/DECISIONS.md § CARE) — no occurrences past it. */
function withinActiveRange(occurrence: Date, medication: Medication): boolean {
  if (medication.start_date && isoDate(occurrence) < medication.start_date) return false;
  if (medication.end_date && isoDate(occurrence) > medication.end_date) return false;
  return true;
}

function dailyOccurrences(medication: Medication, from: Date, until: Date): Date[] {
  const config = medication.frequency_config;
  const occurrences: Date[] = [];
  const cursor = startOfDay(from);
  while (cursor <= until) {
    const occurrence = combineLocal(cursor, config?.time_of_day);
    if (occurrence >= from && withinActiveRange(occurrence, medication)) {
      occurrences.push(occurrence);
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return occurrences;
}

/** Shared by 'weekly' and 'custom' — both key off `frequency_config.days_of_week` (0 = Sunday). */
function weeklyOccurrences(medication: Medication, from: Date, until: Date): Date[] {
  const config = medication.frequency_config;
  const daysOfWeek = config?.days_of_week;
  if (!daysOfWeek || daysOfWeek.length === 0) return [];
  const occurrences: Date[] = [];
  const cursor = startOfDay(from);
  while (cursor <= until) {
    if (daysOfWeek.includes(cursor.getDay())) {
      const occurrence = combineLocal(cursor, config?.time_of_day);
      if (occurrence >= from && withinActiveRange(occurrence, medication)) {
        occurrences.push(occurrence);
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return occurrences;
}

/**
 * 'every_x_days' has no native repeating-notification equivalent and no
 * calendar-aligned pattern — it's anchored to `start_date` and stepped
 * by `interval_days`. Without a `start_date` there's no anchor to step
 * from, so this honestly returns no occurrences rather than guessing one.
 */
function everyXDaysOccurrences(medication: Medication, from: Date, until: Date): Date[] {
  const config = medication.frequency_config;
  const intervalDays = config?.interval_days;
  if (!medication.start_date || !intervalDays || intervalDays < 1) return [];

  const anchor = startOfDay(new Date(`${medication.start_date}T00:00:00`));
  const daysSinceAnchor = Math.floor((startOfDay(from).getTime() - anchor.getTime()) / MS_PER_DAY);
  const stepsToFrom = Math.max(0, Math.ceil(daysSinceAnchor / intervalDays));

  const occurrences: Date[] = [];
  for (let step = stepsToFrom; ; step++) {
    const day = new Date(anchor);
    day.setDate(day.getDate() + step * intervalDays);
    if (day > until) break;
    const occurrence = combineLocal(day, config?.time_of_day);
    if (occurrence >= from && withinActiveRange(occurrence, medication)) {
      occurrences.push(occurrence);
    }
  }
  return occurrences;
}

/**
 * Every upcoming occurrence for a medication within `[now, now + windowDays]`,
 * sorted chronologically. A medication with `reminder_enabled: false` or no
 * `frequency_type` set has no occurrences — this only resolves *when* a
 * dose is scheduled, never whether reminding about it is wanted.
 */
export function resolveMedicationOccurrences(
  medication: Medication,
  now: Date = new Date(),
  windowDays: number = DEFAULT_WINDOW_DAYS,
): Date[] {
  const until = new Date(now.getTime() + windowDays * MS_PER_DAY);
  switch (medication.frequency_type) {
    case 'daily':
      return dailyOccurrences(medication, now, until);
    case 'weekly':
    case 'custom':
      return weeklyOccurrences(medication, now, until);
    case 'every_x_days':
      return everyXDaysOccurrences(medication, now, until);
    default:
      return [];
  }
}

/** The single soonest upcoming dose — Medication Detail's "Next dose" (see docs/DECISIONS.md § CARE). */
export function resolveNextMedicationOccurrence(
  medication: Medication,
  now: Date = new Date(),
): Date | null {
  const [next] = resolveMedicationOccurrences(medication, now);
  return next ?? null;
}

/** True if any resolved occurrence falls on the same local calendar day as `now` — TODAY's due-today classification. */
export function isMedicationDueOn(medication: Medication, now: Date = new Date()): boolean {
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return resolveMedicationOccurrences(medication, startOfDay(now), 1).some(
    (occurrence) => occurrence <= endOfDay,
  );
}

/**
 * Appointments aren't recurring (a single `starts_at`) — "next occurrence"
 * is just that timestamp if it hasn't passed, matching the same
 * `starts_at >= now` rule `AppointmentsScreen` already uses for its
 * Upcoming section.
 */
export function resolveNextAppointmentOccurrence(
  appointment: Appointment,
  now: Date = new Date(),
): Date | null {
  const startsAt = new Date(appointment.starts_at);
  return startsAt >= now ? startsAt : null;
}
