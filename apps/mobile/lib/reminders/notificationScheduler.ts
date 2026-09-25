import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { Appointment, Medication } from '@prism/types';
import {
  appointmentReminderTimes,
  medicationNudgeTimes,
  needsDatedReminders,
  resolveMedicationOccurrences,
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

const PRIVATE_TITLE = 'Prism';
/** Matches docs/SECURITY.md §7's example verbatim. */
const PRIVATE_BODY = 'Your Prism reminder is ready.';

/** Follow-up wording, also generic when notifications are private. */
const PRIVATE_NUDGE_BODY = 'Your Prism reminder is still waiting.';

/** Notification action buttons. The labels are generic on purpose, so a lock screen never says what for. */
export const MEDICATION_CATEGORY = 'prism-medication';
export const APPOINTMENT_CATEGORY = 'prism-appointment';
export const ACTION_DONE = 'done';
export const ACTION_SNOOZE = 'snooze';

export const SNOOZE_MINUTES = 10;
/** How long after a dose was due the single follow-up is sent. */
export const NUDGE_DELAY_MINUTES = 30;
/** iOS keeps at most 64 pending notifications; stay comfortably under. */
const MAX_PENDING = 60;

/** Registers the Done / Snooze buttons shown under reminders. Safe to call more than once. */
export async function registerNotificationCategories(): Promise<void> {
  if (!isNotificationsSupported) return;
  await Notifications.setNotificationCategoryAsync(MEDICATION_CATEGORY, [
    { identifier: ACTION_DONE, buttonTitle: 'Done', options: { opensAppToForeground: true } },
    {
      identifier: ACTION_SNOOZE,
      buttonTitle: `Snooze ${SNOOZE_MINUTES} min`,
      options: { opensAppToForeground: false },
    },
  ]);
  await Notifications.setNotificationCategoryAsync(APPOINTMENT_CATEGORY, [
    {
      identifier: ACTION_SNOOZE,
      buttonTitle: `Snooze ${SNOOZE_MINUTES} min`,
      options: { opensAppToForeground: false },
    },
  ]);
}

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

export type NotificationPermissionStatus = 'granted' | 'denied' | 'undetermined' | 'unsupported';

/** Where the phone's notification permission stands right now, without prompting. */
export async function getNotificationPermissionStatus(): Promise<NotificationPermissionStatus> {
  if (!isNotificationsSupported) return 'unsupported';
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return 'granted';
  return current.canAskAgain ? 'undetermined' : 'denied';
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
  categoryIdentifier?: string;
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
      (request.content.data?.type === type ||
        (type === 'medication' && request.content.data?.type === 'medication_nudge')) &&
      request.content.data?.referenceId === referenceId,
  );
  await cancelScheduledNotifications(toCancel.map((request) => request.identifier));
}

/**
 * Logging a dose means its follow-up is no longer needed: cancels the
 * pending follow-up for any dose of this medication that has already come
 * due. Called whenever a dose is logged, in the app or from a notification.
 */
export async function cancelDueNudges(medicationId: string, now: Date = new Date()): Promise<void> {
  if (!isNotificationsSupported) return;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const toCancel = scheduled.filter((request) => {
    const data = request.content.data;
    return (
      data?.type === 'medication_nudge' &&
      data?.referenceId === medicationId &&
      typeof data?.doseAt === 'string' &&
      new Date(data.doseAt) <= now
    );
  });
  await cancelScheduledNotifications(toCancel.map((request) => request.identifier));
}

/** Sends the same reminder again in a few minutes. Used by the Snooze button. */
export async function scheduleSnooze(source: {
  title?: string | null;
  body?: string | null;
  data?: Record<string, unknown> | null;
  categoryIdentifier?: string | null;
}): Promise<void> {
  if (!isNotificationsSupported) return;
  const data = source.data ?? {};
  await Notifications.scheduleNotificationAsync({
    content: {
      title: source.title ?? 'Prism',
      body: source.body ?? PRIVATE_BODY,
      categoryIdentifier: source.categoryIdentifier ?? undefined,
      // "snooze" is not cancelled by the routine re-sync, so it survives it.
      data: { ...data, originType: data.originType ?? data.type, type: 'snooze' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: SNOOZE_MINUTES * 60,
    },
  });
}

/** Sends a reminder in a few seconds so someone can see exactly what theirs will look like. */
export async function scheduleTestReminder(notificationPrivacy: boolean): Promise<void> {
  if (!isNotificationsSupported) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      ...reminderContent(
        notificationPrivacy,
        'Test reminder',
        'This is what your reminders look like.',
      ),
      categoryIdentifier: MEDICATION_CATEGORY,
      data: { type: 'test' },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 5 },
  });
}

/**
 * If more notifications are pending than the phone will hold, cancels the
 * ones furthest in the future (follow-ups first) — the app re-schedules
 * them as those days get closer.
 */
export async function trimToBudget(): Promise<void> {
  if (!isNotificationsSupported) return;
  const all = await Notifications.getAllScheduledNotificationsAsync();
  const excess = all.length - MAX_PENDING;
  if (excess <= 0) return;
  const dated = all
    .map((request) => {
      const trigger = request.trigger as { type?: string; value?: number } | null;
      const at =
        trigger?.type === 'date' && typeof trigger.value === 'number' ? trigger.value : null;
      return { request, at, nudge: request.content.data?.type === 'medication_nudge' };
    })
    .filter(
      (entry): entry is { request: (typeof all)[number]; at: number; nudge: boolean } =>
        entry.at !== null,
    )
    .sort((a, b) => Number(b.nudge) - Number(a.nudge) || b.at - a.at);
  await cancelScheduledNotifications(
    dated.slice(0, excess).map((entry) => entry.request.identifier),
  );
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
export interface MedicationReminderOptions {
  /** Send one gentle follow-up this many minutes after each dose is due. Off when null or omitted. */
  nudgeDelayMinutes?: number | null;
}

export async function scheduleMedicationReminders(
  medication: Medication,
  notificationPrivacy: boolean,
  options: MedicationReminderOptions = {},
): Promise<string[]> {
  if (!isNotificationsSupported || !medication.reminder_enabled) return [];

  const content = {
    ...reminderContent(notificationPrivacy, medication.name, medication.dosage_text ?? undefined),
    categoryIdentifier: MEDICATION_CATEGORY,
  };
  const data = { type: 'medication', referenceId: medication.id };
  const config = medication.frequency_config;
  const identifiers: string[] = [];

  // Repeating reminders can't stop on an end date (Pause) or wait for a start
  // date, so those medications get one reminder per upcoming dose instead.
  const repeating = !needsDatedReminders(medication);

  if (repeating && medication.frequency_type === 'daily') {
    const [hour, minute] = parseTimeOfDay(config?.time_of_day);
    identifiers.push(
      await Notifications.scheduleNotificationAsync({
        content: { ...content, data },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute },
      }),
    );
  } else if (
    repeating &&
    (medication.frequency_type === 'weekly' || medication.frequency_type === 'custom') &&
    config?.days_of_week &&
    config.days_of_week.length > 0
  ) {
    const [hour, minute] = parseTimeOfDay(config.time_of_day);
    identifiers.push(
      ...(await Promise.all(
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
      )),
    );
  } else {
    identifiers.push(
      ...(await Promise.all(
        resolveMedicationOccurrences(medication).map((date) =>
          Notifications.scheduleNotificationAsync({
            content: { ...content, data },
            trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
          }),
        ),
      )),
    );
  }

  if (options.nudgeDelayMinutes) {
    const nudgeContent = notificationPrivacy
      ? { title: PRIVATE_TITLE, body: PRIVATE_NUDGE_BODY }
      : { title: medication.name, body: 'Still waiting to be marked done.' };
    identifiers.push(
      ...(await Promise.all(
        medicationNudgeTimes(medication, options.nudgeDelayMinutes).map(({ doseAt, nudgeAt }) =>
          Notifications.scheduleNotificationAsync({
            content: {
              ...nudgeContent,
              categoryIdentifier: MEDICATION_CATEGORY,
              data: {
                type: 'medication_nudge',
                referenceId: medication.id,
                doseAt: doseAt.toISOString(),
              },
            },
            trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: nudgeAt },
          }),
        ),
      )),
    );
  }
  return identifiers;
}

function leadLabel(minutes: number): string | undefined {
  if (minutes <= 0) return undefined;
  if (minutes >= 1440 && minutes % 1440 === 0) {
    const days = minutes / 1440;
    return days === 1 ? 'Tomorrow' : `In ${days} days`;
  }
  if (minutes >= 60 && minutes % 60 === 0) {
    const hours = minutes / 60;
    return hours === 1 ? 'In 1 hour' : `In ${hours} hours`;
  }
  return `In ${minutes} minutes`;
}

/**
 * Appointments aren't recurring, so this schedules one DATE-triggered
 * notification per chosen lead time (0 = at the time, 60 = an hour before,
 * 1440 = a day before). Defaults to just at the time.
 */
export async function scheduleAppointmentReminder(
  appointment: Appointment,
  notificationPrivacy: boolean,
  leadMinutes: readonly number[] = [0],
): Promise<string[]> {
  if (!isNotificationsSupported || !appointment.reminder_enabled) return [];
  const startsAt = new Date(appointment.starts_at).getTime();
  const times = appointmentReminderTimes(appointment, leadMinutes);
  return Promise.all(
    times.map((date) => {
      const lead = Math.round((startsAt - date.getTime()) / 60000);
      const detail = [leadLabel(lead), appointment.provider].filter(Boolean).join(' · ');
      return Notifications.scheduleNotificationAsync({
        content: {
          ...reminderContent(notificationPrivacy, appointment.title, detail || undefined),
          categoryIdentifier: APPOINTMENT_CATEGORY,
          data: { type: 'appointment', referenceId: appointment.id },
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
      });
    }),
  );
}
