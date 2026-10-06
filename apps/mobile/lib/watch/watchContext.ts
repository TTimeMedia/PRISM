import type { Appointment, Medication, MedicationLog } from '@prism/types';
import { isMedicationDueOn, resolveMedicationOccurrences } from '../reminders/scheduleResolution';

/**
 * What the Apple Watch app shows, worked out on the phone and sent as one
 * JSON object (modules/prism-watch). The watch never talks to Supabase
 * itself: it keeps no account, no keys and no copy of anything beyond
 * today's doses and the next appointment.
 *
 * With Private notifications on, names never reach the watch: doses read
 * "Dose" and the appointment "Appointment", the same rule as reminders on
 * the lock screen. Change the shape only together with
 * targets/watch/WatchStore.swift, which decodes it.
 */
export const WATCH_CONTEXT_VERSION = 1;

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

export interface WatchContext {
  v: typeof WATCH_CONTEXT_VERSION;
  signedIn: boolean;
  private: boolean;
  /** When this was worked out, ISO; the watch shows its age if the phone has been away. */
  updatedAt: string;
  doses: WatchDose[];
  next: WatchAppointment | null;
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

  const doses = medications
    .filter((medication) => isMedicationDueOn(medication, now))
    .map((medication): WatchDose | null => {
      const at = resolveMedicationOccurrences(medication, startOfDay(now), 1).find((date) =>
        sameDay(date, now),
      );
      if (!at) return null;
      return {
        medicationId: medication.id,
        label: notificationPrivacy ? 'Dose' : medication.name,
        ...(!notificationPrivacy && medication.dosage_text
          ? { detail: medication.dosage_text }
          : {}),
        at: at.toISOString(),
        taken: takenToday.has(medication.id),
      };
    })
    .filter((dose): dose is WatchDose => dose !== null)
    .sort((a, b) => a.at.localeCompare(b.at));

  const upcoming = appointments
    .filter((appointment) => new Date(appointment.starts_at) >= now)
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at))[0];

  return {
    v: WATCH_CONTEXT_VERSION,
    signedIn: true,
    private: notificationPrivacy,
    updatedAt: now.toISOString(),
    doses,
    next: upcoming
      ? {
          label: notificationPrivacy ? 'Appointment' : upcoming.title,
          at: upcoming.starts_at,
          ...(!notificationPrivacy && upcoming.location ? { place: upcoming.location } : {}),
        }
      : null,
  };
}

/** Something done on the watch, sent back to the phone as JSON. */
export type WatchAction = { type: 'logDose'; id: string; medicationId: string; at: string };

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
  } catch {
    // Not JSON: ignore it.
  }
  return null;
}
