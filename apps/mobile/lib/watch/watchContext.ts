import type { Appointment, Medication, MedicationLog } from '@prism/types';
import { resolveMedicationOccurrences } from '../reminders/scheduleResolution';

/**
 * What the Apple Watch app shows, worked out on the phone and sent as one
 * JSON object (modules/prism-watch).
 *
 * The phone sends the next SCHEDULE_DAYS days of doses and the next few
 * appointments, so the watch can move on to a new day by itself. Whether a
 * dose is taken, and logging one, go through the watch Edge Function
 * (supabase/functions/watch) with the watch-only key in `server`, so the
 * watch keeps working without Prism open on the phone. The key can only read
 * which doses are taken and log a dose; names never go through the server.
 *
 * With Private notifications on, names never reach the watch: medications
 * read "Medication" and the appointment "Appointment", the same rule as reminders on
 * the lock screen. Change the shape only together with
 * targets/watch/WatchStore.swift, which decodes it. Fields are only ever
 * added, so a watch app from an older build still reads `doses` and `next`.
 */
export const WATCH_CONTEXT_VERSION = 1;

/** How many days ahead the watch gets, starting today. */
export const SCHEDULE_DAYS = 14;
/** How many upcoming appointments the watch gets. */
const APPOINTMENT_COUNT = 5;

export interface WatchDose {
  medicationId: string;
  label: string;
  /** The dose as the person wrote it, e.g. ".3cc". Absent when private. */
  detail?: string;
  /** When it's due, ISO. */
  at: string;
  taken: boolean;
}

export interface WatchAppointment {
  label: string;
  at: string;
  /** Where. Absent when private. */
  place?: string;
}

/** Where the watch reads and logs doses itself. */
export interface WatchServer {
  /** The watch Edge Function's URL. */
  url: string;
  /** The watch-only key (lib/watch/watchToken.ts). */
  token: string;
}

export interface WatchContext {
  v: typeof WATCH_CONTEXT_VERSION;
  signedIn: boolean;
  private: boolean;
  /** When this was worked out, ISO. */
  updatedAt: string;
  /** Today's doses. */
  doses: WatchDose[];
  /** The next appointment. */
  next: WatchAppointment | null;
  /** Every dose from the start of today until `until`, soonest first. */
  schedule?: WatchDose[];
  /** The next few appointments, soonest first. */
  appointments?: WatchAppointment[];
  /** The end of the last day `schedule` covers, ISO. */
  until?: string;
  server?: WatchServer;
}

export const SIGNED_OUT_CONTEXT = (now: Date = new Date()): WatchContext => ({
  v: WATCH_CONTEXT_VERSION,
  signedIn: false,
  private: true,
  updatedAt: now.toISOString(),
  doses: [],
  next: null,
});

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function sameDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

export interface WatchContextInput {
  medications: Medication[];
  /** Any of the person's dose logs; only today's count. */
  logs: Pick<MedicationLog, 'medication_id' | 'scheduled_at' | 'status'>[];
  appointments: Appointment[];
  notificationPrivacy: boolean;
  now?: Date;
}

export function buildWatchContext({
  medications,
  logs,
  appointments,
  notificationPrivacy,
  now = new Date(),
}: WatchContextInput): WatchContext {
  const takenToday = new Set(
    logs
      .filter((log) => log.status === 'completed' && sameDay(new Date(log.scheduled_at), now))
      .map((log) => log.medication_id),
  );

  const today = startOfDay(now);
  const until = new Date(today);
  until.setDate(until.getDate() + SCHEDULE_DAYS);

  const schedule = medications
    .flatMap((medication) =>
      resolveMedicationOccurrences(medication, today, SCHEDULE_DAYS)
        .filter((at) => at < until)
        .map((at): WatchDose => ({
          medicationId: medication.id,
          label: notificationPrivacy ? 'Medication' : medication.name,
          ...(!notificationPrivacy && medication.dosage_text
            ? { detail: medication.dosage_text }
            : {}),
          at: at.toISOString(),
          taken: sameDay(at, now) && takenToday.has(medication.id),
        })),
    )
    .sort((a, b) => a.at.localeCompare(b.at));

  const upcoming = appointments
    .filter((appointment) => new Date(appointment.starts_at) >= now)
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
    .slice(0, APPOINTMENT_COUNT)
    .map((appointment): WatchAppointment => ({
      label: notificationPrivacy ? 'Appointment' : appointment.title,
      at: appointment.starts_at,
      ...(!notificationPrivacy && appointment.location ? { place: appointment.location } : {}),
    }));

  return {
    v: WATCH_CONTEXT_VERSION,
    signedIn: true,
    private: notificationPrivacy,
    updatedAt: now.toISOString(),
    doses: schedule.filter((dose) => sameDay(new Date(dose.at), now)),
    next: upcoming[0] ?? null,
    schedule,
    appointments: upcoming,
    until: until.toISOString(),
  };
}

/**
 * Something done on the watch, sent back to the phone as JSON. logDose is
 * only sent when the watch has no key yet (it logs through the server
 * otherwise); needKey means the server turned the watch's key down.
 */
export type WatchAction =
  { type: 'logDose'; id: string; medicationId: string; at: string } | { type: 'needKey' };

export function parseWatchAction(json: string): WatchAction | null {
  try {
    const value = JSON.parse(json) as Record<string, unknown>;
    if (
      value.type === 'logDose' &&
      typeof value.id === 'string' &&
      typeof value.medicationId === 'string' &&
      typeof value.at === 'string' &&
      !Number.isNaN(Date.parse(value.at))
    ) {
      return { type: 'logDose', id: value.id, medicationId: value.medicationId, at: value.at };
    }
    if (value.type === 'needKey') return { type: 'needKey' };
  } catch {
    // Not JSON: ignore it.
  }
  return null;
}
