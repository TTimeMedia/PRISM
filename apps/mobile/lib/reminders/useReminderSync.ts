import { useEffect, useRef } from 'react';
import type { Appointment, Medication, NotificationStyle, Reminder } from '@prism/types';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/AuthProvider';
import { useModules, useSettings } from '../profile/queries';
import { useAppointments, useMedications } from '../care/queries';
import {
  cancelRemindersFor,
  configureNotificationHandler,
  requestNotificationPermissions,
  scheduleAppointmentReminder,
  scheduleMedicationReminders,
} from './notificationScheduler';
import {
  resolveNextAppointmentOccurrence,
  resolveNextMedicationOccurrence,
} from './scheduleResolution';

/**
 * Reconciles medication/appointment reminders (`reminder_enabled`)
 * against both the device's native notification schedule and the
 * `reminders` table — "Reminder Created → Schedule Notification → Native
 * Notification" (docs/TECHNICAL_BIBLE.md §15). Wired into the root
 * layout alongside `useAppLockGate`, so it re-syncs whenever the
 * relevant data actually changes (a medication/appointment added,
 * edited, deleted, its `reminder_enabled` toggled, its module disabled,
 * or `notification_privacy` changed) — not on every render.
 *
 * Cancels then reschedules every desired reminder from scratch rather
 * than diffing occurrence-by-occurrence: simpler, and still correct
 * since `every_x_days` reminders are only ever scheduled a rolling
 * window ahead and need re-syncing on each app open anyway (see
 * notificationScheduler.ts's own header).
 */
export function useReminderSync(): void {
  const { session } = useSession();
  const userId = session?.user.id;
  const { data: modules } = useModules();
  const { data: settings } = useSettings();
  const { data: medications } = useMedications();
  const { data: appointments } = useAppointments();

  const medicationsEnabled = !!modules?.find((m) => m.module_key === 'medications')?.enabled;
  const appointmentsEnabled = !!modules?.find((m) => m.module_key === 'appointments')?.enabled;
  const notificationPrivacy = settings?.notification_privacy ?? true;

  const signature = JSON.stringify({
    meds: medications?.map((m) => [
      m.id,
      m.reminder_enabled,
      m.frequency_type,
      m.frequency_config,
      m.start_date,
      m.end_date,
    ]),
    appts: appointments?.map((a) => [a.id, a.reminder_enabled, a.starts_at]),
    medicationsEnabled,
    appointmentsEnabled,
    notificationPrivacy,
  });
  const lastSynced = useRef<string | null>(null);

  useEffect(() => {
    configureNotificationHandler();
  }, []);

  useEffect(() => {
    if (!userId || !medications || !appointments || !modules || !settings) return;
    if (lastSynced.current === signature) return;
    lastSynced.current = signature;

    let cancelled = false;
    void (async () => {
      const granted = await requestNotificationPermissions();
      if (!granted || cancelled) return;
      await syncReminders({
        userId,
        medications: medicationsEnabled ? medications : [],
        appointments: appointmentsEnabled ? appointments : [],
        notificationPrivacy,
      });
    })();
    return () => {
      cancelled = true;
    };
    // signature already captures every input the sync needs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, userId]);
}

interface DesiredReminder {
  type: 'medication' | 'appointment';
  referenceId: string;
  scheduledTime: string | null;
  recurrence: Record<string, unknown> | null;
}

interface SyncArgs {
  userId: string;
  medications: Medication[];
  appointments: Appointment[];
  notificationPrivacy: boolean;
}

async function syncReminders({
  userId,
  medications,
  appointments,
  notificationPrivacy,
}: SyncArgs): Promise<void> {
  const desired = new Map<string, DesiredReminder>();

  for (const medication of medications) {
    if (!medication.reminder_enabled) continue;
    const next = resolveNextMedicationOccurrence(medication);
    desired.set(`medication:${medication.id}`, {
      type: 'medication',
      referenceId: medication.id,
      scheduledTime: next?.toISOString() ?? null,
      recurrence: medication.frequency_config as Record<string, unknown> | null,
    });
  }
  for (const appointment of appointments) {
    if (!appointment.reminder_enabled) continue;
    const next = resolveNextAppointmentOccurrence(appointment);
    if (!next) continue;
    desired.set(`appointment:${appointment.id}`, {
      type: 'appointment',
      referenceId: appointment.id,
      scheduledTime: next.toISOString(),
      recurrence: null,
    });
  }

  const { data: existingReminders, error: fetchError } = await supabase
    .from('reminders')
    .select('*');
  if (fetchError) throw fetchError;
  const existing = new Map<string, Reminder>(
    (existingReminders ?? []).map((reminder: Reminder) => [
      `${reminder.type}:${reminder.reference_id}`,
      reminder,
    ]),
  );

  for (const [key, reminder] of existing) {
    if (desired.has(key) || !reminder.reference_id) continue;
    await cancelRemindersFor(reminder.type, reminder.reference_id);
    await supabase
      .from('reminders')
      .delete()
      .eq('user_id', userId)
      .eq('type', reminder.type)
      .eq('reference_id', reminder.reference_id);
  }

  for (const medication of medications) {
    if (!desired.has(`medication:${medication.id}`)) continue;
    await cancelRemindersFor('medication', medication.id);
    await scheduleMedicationReminders(medication, notificationPrivacy);
  }
  for (const appointment of appointments) {
    if (!desired.has(`appointment:${appointment.id}`)) continue;
    await cancelRemindersFor('appointment', appointment.id);
    await scheduleAppointmentReminder(appointment, notificationPrivacy);
  }

  const notificationStyle: NotificationStyle = notificationPrivacy ? 'private' : 'standard';
  const rows = [...desired.values()]
    .filter((d): d is DesiredReminder & { scheduledTime: string } => d.scheduledTime !== null)
    .map((d) => ({
      user_id: userId,
      type: d.type,
      reference_id: d.referenceId,
      scheduled_time: d.scheduledTime,
      recurrence: d.recurrence,
      notification_style: notificationStyle,
      enabled: true,
    }));
  if (rows.length > 0) {
    const { error: upsertError } = await supabase
      .from('reminders')
      .upsert(rows, { onConflict: 'user_id,type,reference_id' });
    if (upsertError) throw upsertError;
  }
}
