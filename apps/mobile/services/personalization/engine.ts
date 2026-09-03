import type {
  Appointment,
  JournalEntry,
  Medication,
  Milestone,
  ModuleKey,
  RelevanceBucket,
  TodayItem,
} from '@prism/types';
import {
  isMedicationDueOn,
  resolveMedicationOccurrences,
  resolveNextMedicationOccurrence,
} from '../../lib/reminders/scheduleResolution';

/**
 * The TODAY personalization engine — see docs/TECHNICAL_BIBLE.md §10 and
 * docs/MASTER_BUILD_SPEC.md §05/§07. Pure and deterministic: takes
 * already-fetched, already-module-filtered records plus an explicit
 * `now`, and returns ranked TodayItems. No I/O here — see
 * lib/today/queries.ts for the data-fetching half of the pipeline
 * (`getUserProfile → getEnabledModules → getRelevantRecords`).
 *
 * Medications are classified via lib/reminders/scheduleResolution.ts's
 * real reminder-schedule resolution (recurring medications across
 * timezones/DST) — see docs/DECISIONS.md § Reminders. Before that
 * existed, showing a synthetic "due today" card would have been
 * manufactured content (docs/MASTER_BUILD_SPEC.md §31, Non-Negotiable
 * Rule 11); it no longer is, since the date is now actually resolved.
 */

const UPCOMING_WINDOW_DAYS = 30;
const RECENT_WINDOW_DAYS = 30;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function daysBetween(a: Date, b: Date): number {
  return (b.getTime() - a.getTime()) / MS_PER_DAY;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export interface RelevantRecords {
  appointments: Appointment[];
  milestones: Milestone[];
  journalEntries: JournalEntry[];
  medications: Medication[];
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * `due_today` if any dose resolves to today (even one already passed —
 * matches `isMedicationDueOn`'s own "still due" reasoning), otherwise
 * `upcoming` if the next dose falls within the same window appointments
 * use. Independent of `reminder_enabled` — whether a dose is due and
 * whether the user wants a push notification about it are separate
 * concerns (see lib/reminders/scheduleResolution.ts's own header).
 */
function classifyMedications(medications: Medication[], now: Date): TodayItem[] {
  return medications
    .map((medication): TodayItem | null => {
      const dueToday = isMedicationDueOn(medication, now);
      const occurrence = dueToday
        ? resolveMedicationOccurrences(medication, startOfLocalDay(now), 1)[0]
        : resolveNextMedicationOccurrence(medication, now);
      if (!occurrence) return null;
      if (!dueToday) {
        const daysUntil = daysBetween(now, occurrence);
        if (daysUntil < 0 || daysUntil > UPCOMING_WINDOW_DAYS) return null;
      }
      return {
        id: `medication-${medication.id}`,
        moduleKey: 'medications' as ModuleKey,
        bucket: (dueToday ? 'due_today' : 'upcoming') as RelevanceBucket,
        sourceId: medication.id,
        title: medication.name,
        subtitle: medication.dosage_text ?? undefined,
        at: occurrence.toISOString(),
      };
    })
    .filter((item): item is TodayItem => item !== null);
}

function classifyAppointments(appointments: Appointment[], now: Date): TodayItem[] {
  return appointments
    .map((appointment): TodayItem | null => {
      const startsAt = new Date(appointment.starts_at);
      const daysUntil = daysBetween(now, startsAt);
      if (daysUntil < 0 || daysUntil > UPCOMING_WINDOW_DAYS) return null;
      const bucket: RelevanceBucket = isSameDay(now, startsAt) ? 'due_today' : 'upcoming';
      return {
        id: `appointment-${appointment.id}`,
        moduleKey: 'appointments' as ModuleKey,
        bucket,
        sourceId: appointment.id,
        title: appointment.title,
        subtitle: appointment.provider ?? undefined,
        at: appointment.starts_at,
      };
    })
    .filter((item): item is TodayItem => item !== null);
}

function classifyMilestones(milestones: Milestone[], now: Date): TodayItem[] {
  return milestones
    .map((milestone): TodayItem | null => {
      const date = new Date(milestone.date);
      const daysAgo = daysBetween(date, now);
      if (daysAgo < 0 || daysAgo > RECENT_WINDOW_DAYS) return null;
      return {
        id: `milestone-${milestone.id}`,
        moduleKey: 'milestones' as ModuleKey,
        bucket: 'meaningful' as RelevanceBucket,
        sourceId: milestone.id,
        title: milestone.title,
        subtitle: milestone.category ?? undefined,
        at: milestone.date,
      };
    })
    .filter((item): item is TodayItem => item !== null);
}

function classifyJournalEntries(entries: JournalEntry[], now: Date): TodayItem[] {
  return entries
    .map((entry): TodayItem | null => {
      const date = new Date(entry.date);
      const daysAgo = daysBetween(date, now);
      if (daysAgo < 0 || daysAgo > RECENT_WINDOW_DAYS) return null;
      return {
        id: `journal-${entry.id}`,
        moduleKey: 'journal' as ModuleKey,
        bucket: 'recent' as RelevanceBucket,
        sourceId: entry.id,
        title: entry.title ?? 'Journal entry',
        subtitle: entry.mood ?? undefined,
        at: entry.date,
      };
    })
    .filter((item): item is TodayItem => item !== null);
}

/** getRelevantRecords → calculateTodayItems (unfiltered — records are assumed already module-scoped by the caller). */
export function calculateTodayItems(records: RelevantRecords, now: Date = new Date()): TodayItem[] {
  return [
    ...classifyMedications(records.medications, now),
    ...classifyAppointments(records.appointments, now),
    ...classifyMilestones(records.milestones, now),
    ...classifyJournalEntries(records.journalEntries, now),
  ];
}

/** filterIrrelevantItems — drops anything the classifiers marked hidden (none currently do, but this keeps the pipeline stage real per docs/TECHNICAL_BIBLE.md §10). */
export function filterIrrelevantItems(items: TodayItem[]): TodayItem[] {
  return items.filter((item) => item.bucket !== 'hidden');
}

const BUCKET_PRIORITY: Record<RelevanceBucket, number> = {
  due_today: 0,
  upcoming: 1,
  recent: 2,
  meaningful: 3,
  hidden: 4,
};

/** rankItems — priority order per docs/TECHNICAL_BIBLE.md §10: due today, then upcoming, then recent/meaningful, each chronologically within its bucket. */
export function rankItems(items: TodayItem[]): TodayItem[] {
  return [...items].sort((a, b) => {
    const bucketDiff = BUCKET_PRIORITY[a.bucket] - BUCKET_PRIORITY[b.bucket];
    if (bucketDiff !== 0) return bucketDiff;
    return new Date(a.at).getTime() - new Date(b.at).getTime();
  });
}

/** The full pipeline, minus the data-fetching stages (getUserProfile/getEnabledModules/getRelevantRecords — see lib/today/queries.ts). */
export function buildTodayDashboard(records: RelevantRecords, now: Date = new Date()): TodayItem[] {
  return rankItems(filterIrrelevantItems(calculateTodayItems(records, now)));
}
