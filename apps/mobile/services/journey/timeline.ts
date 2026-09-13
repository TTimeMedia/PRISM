import type {
  Appointment,
  Injection,
  Medication,
  MedicationLog,
  MedicationLogStatus,
  Milestone,
  JournalEntry,
  TimelineEvent,
} from '@prism/types';

const MEDICATION_LOG_STATUS_LABELS: Record<MedicationLogStatus, string> = {
  scheduled: 'Scheduled',
  completed: 'Completed',
  skipped: 'Skipped',
  missed: 'Missed',
  skipped_intentionally: 'Skipped intentionally',
};

export interface TimelineRecords {
  medicationLogs: MedicationLog[];
  medications: Medication[];
  injections: Injection[];
  appointments: Appointment[];
  milestones: Milestone[];
  journalEntries: JournalEntry[];
}

/**
 * Unifies medications, injections, appointments, milestones, and journal
 * entries into a single chronological list — Screen 42 (Timeline). Events
 * reference their source records (`sourceId`); this never duplicates
 * data, it only classifies and orders it. See docs/SCREEN_BIBLE.md
 * Screens 42-43 and docs/MASTER_BUILD_SPEC.md §09.
 *
 * "Medications" appear on Timeline as their real logged doses
 * (`medication_logs`), not a predicted schedule — the same reasoning
 * that keeps TODAY from fabricating a "medication due today" bucket (see
 * services/personalization/engine.ts): no real scheduling-resolution
 * engine exists yet, and Timeline is a history, so only events that
 * actually happened belong on it.
 */
export function buildTimelineEvents(records: TimelineRecords): TimelineEvent[] {
  const medicationNames = new Map(records.medications.map((m) => [m.id, m.name]));

  const logEvents: TimelineEvent[] = records.medicationLogs.map((log) => ({
    id: `medication_log:${log.id}`,
    moduleKey: 'medications',
    sourceId: log.medication_id,
    title: medicationNames.get(log.medication_id) ?? 'Medication',
    subtitle: MEDICATION_LOG_STATUS_LABELS[log.status] ?? log.status,
    at: log.scheduled_at,
  }));

  const injectionEvents: TimelineEvent[] = records.injections.map((injection) => ({
    id: `injection:${injection.id}`,
    moduleKey: 'injections',
    sourceId: injection.id,
    title: injection.medication_id
      ? (medicationNames.get(injection.medication_id) ?? 'Injection')
      : 'Injection',
    subtitle: injection.site ? siteLabel(injection.site) : undefined,
    at: injection.injected_at,
  }));

  const appointmentEvents: TimelineEvent[] = records.appointments.map((appointment) => ({
    id: `appointment:${appointment.id}`,
    moduleKey: 'appointments',
    sourceId: appointment.id,
    title: appointment.title,
    subtitle: appointment.provider ?? undefined,
    at: appointment.starts_at,
  }));

  const milestoneEvents: TimelineEvent[] = records.milestones.map((milestone) => ({
    id: `milestone:${milestone.id}`,
    moduleKey: 'milestones',
    sourceId: milestone.id,
    title: milestone.title,
    subtitle: milestone.category ?? undefined,
    at: dateToSortKey(milestone.date),
  }));

  const journalEvents: TimelineEvent[] = records.journalEntries.map((entry) => ({
    id: `journal_entry:${entry.id}`,
    moduleKey: 'journal',
    sourceId: entry.id,
    title: entry.title?.trim() || 'Journal entry',
    subtitle: entry.mood ?? undefined,
    at: dateToSortKey(entry.date),
  }));

  return [
    ...logEvents,
    ...injectionEvents,
    ...appointmentEvents,
    ...milestoneEvents,
    ...journalEvents,
  ].sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));
}

/**
 * A date-only record (`YYYY-MM-DD`) gets a synthetic midday-UTC sort key
 * so it interleaves sensibly with full-timestamp events on the same
 * calendar day. This only affects ordering — the record's own `date`
 * field (what's actually displayed) is never touched, so a recorded date
 * still never shifts a day due to timezone conversion (docs/TECHNICAL_BIBLE.md §14).
 */
function dateToSortKey(date: string): string {
  return new Date(`${date}T12:00:00.000Z`).toISOString();
}

function siteLabel(site: string): string {
  return site
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
