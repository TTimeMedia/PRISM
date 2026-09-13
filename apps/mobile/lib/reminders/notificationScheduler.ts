import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { Appointment, Medication } from '@prism/types';
import {
  resolveMedicationOccurrences,
  resolveNextAppointmentOccurrence,
} from './scheduleResolution';

/**
 * Local-notification scheduling — "Reminder Created → Schedule
 * Notification → Native Notification" (docs/TECHNICAL_BIBLE.md §15).
 * Deliberately *local* notifications only (`expo-notifications`'
 * on-device scheduling), not remote push: a medication/appointment
 * reminder is scheduled for a time already known on-device, so the OS
 * itself can fire it without any server round-trip — no push provider,
 * no backend, nothing to review as a third-party data flow. See
 * docs/DECISIONS.md § Reminders.
 *
 * Not available on web (`expo-notifications` has no web implementation
 * for scheduling/permissions) — every export here no-ops there rather
 * than throwing, since this app's own visual verification runs on web.
 */

const isNotificationsSupported = Platform.OS !== 'web';

const PRIVATE_TITLE = 'PRISM';
/** Matches docs/SECURITY.md §7's example verbatim. */
const PRIVATE_BODY = 'Your PRISM reminder is ready.';

export function configureNotificationHandler(): void {
  if (!isNotificationsSupported) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!isNotificationsSupported) return false;
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

function parseTimeOfDay(timeOfDay: string | undefined): [hour: number, minute: number] {
  const match = timeOfDay?.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  return match ? [Number(match[1]), Number(match[2])] : [9, 0];
}

/** PRISM's `days_of_week` is 0 = Sunday (JS convention); expo-notifications' WEEKLY trigger is 1 = Sunday. */
function toExpoWeekday(jsWeekday: number): number {
  return jsWeekday + 1;
}

interface ReminderContent {
  title: string;
  body?: string;
}

/** Private notifications default ON (docs/SECURITY.md §7) — content is generic unless the user opted into detail. */
function reminderContent(
  notificationPrivacy: boolean,
  detailedTitle: string,
  detailedBody?: string,
): ReminderContent {
  return notificationPrivacy
    ? { title: PRIVATE_TITLE, body: PRIVATE_BODY }
    : { title: detailedTitle, body: detailedBody };
}

export async function cancelScheduledNotifications(identifiers: string[]): Promise<void> {
  if (!isNotificationsSupported) return;
  await Promise.all(
    identifiers.map((identifier) => Notifications.cancelScheduledNotificationAsync(identifier)),
  );
}

/**
 * Cancels every currently-scheduled native notification for a given
 * `{type, referenceId}` — matched via `content.data`, which every
 * `schedule*Reminder(s)` call above sets. Lets `useReminderSync`
 * reschedule idempotently (cancel what's there, then schedule fresh)
 * without having to persist native notification identifiers anywhere
 * itself; a device's own OS-level schedule is the only place those
 * identifiers need to live.
 */
export async function cancelRemindersFor(type: string, referenceId: string): Promise<void> {
  if (!isNotificationsSupported) return;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const toCancel = scheduled.filter(
    (request) =>
      request.content.data?.type === type && request.content.data?.referenceId === referenceId,
  );
  await cancelScheduledNotifications(toCancel.map((request) => request.identifier));
}

/**
 * Schedules every reminder a medication needs and returns the
 * notification identifiers so the caller can cancel them later.
 * `daily`/`weekly`/`custom` (with `days_of_week`) use native repeating
 * triggers — they keep firing without the app ever being reopened.
 * `every_x_days` (and `custom` without `days_of_week`) has no native
 * repeating equivalent for an arbitrary N-day interval, so this
 * schedules one `DATE` trigger per resolved upcoming occurrence
 * instead — re-synced (see `useReminderSync`) whenever the app is
 * opened, so the next batch gets scheduled before the current one runs out.
 */
export async function scheduleMedicationReminders(
  medication: Medication,
  notificationPrivacy: boolean,
): Promise<string[]> {
  if (!isNotificationsSupported || !medication.reminder_enabled) return [];

  const content = reminderContent(
    notificationPrivacy,
    medication.name,
    medication.dosage_text ?? undefined,
  );
  const data = { type: 'medication', referenceId: medication.id };
  const config = medication.frequency_config;

  if (medication.frequency_type === 'daily') {
    const [hour, minute] = parseTimeOfDay(config?.time_of_day);
    const identifier = await Notifications.scheduleNotificationAsync({
      content: { ...content, data },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute },
    });
    return [identifier];
  }

  if (
    (medication.frequency_type === 'weekly' || medication.frequency_type === 'custom') &&
    config?.days_of_week &&
    config.days_of_week.length > 0
  ) {
    const [hour, minute] = parseTimeOfDay(config.time_of_day);
    return Promise.all(
      config.days_of_week.map((day) =>
        Notifications.scheduleNotificationAsync({
          content: { ...content, data },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday: toExpoWeekday(day),
            hour,
            minute,
          },
        }),
      ),
    );
  }

  const occurrences = resolveMedicationOccurrences(medication);
  return Promise.all(
    occurrences.map((date) =>
      Notifications.scheduleNotificationAsync({
        content: { ...content, data },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
      }),
    ),
  );
}

/** Appointments aren't recurring, so this schedules at most one DATE-triggered notification. */
export async function scheduleAppointmentReminder(
  appointment: Appointment,
  notificationPrivacy: boolean,
): Promise<string[]> {
  if (!isNotificationsSupported || !appointment.reminder_enabled) return [];
  const next = resolveNextAppointmentOccurrence(appointment);
  if (!next) return [];

  const content = reminderContent(
    notificationPrivacy,
    appointment.title,
    appointment.provider ?? undefined,
  );
  const identifier = await Notifications.scheduleNotificationAsync({
    content: { ...content, data: { type: 'appointment', referenceId: appointment.id } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: next },
  });
  return [identifier];
}
