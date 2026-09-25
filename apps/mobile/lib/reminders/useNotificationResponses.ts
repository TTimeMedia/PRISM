import { useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { router, type Href } from 'expo-router';
import { useToast } from '@prism/ui';
import { useSession } from '../auth/AuthProvider';
import { useProfile } from '../profile/queries';
import { useCreateMedicationLog } from '../care/mutations';
import { ACTION_DONE, ACTION_SNOOZE, scheduleSnooze } from './notificationScheduler';

type ReminderKind = 'medication' | 'appointment';

interface ReminderData {
  kind: ReminderKind;
  referenceId: string;
  /** For a follow-up: when the dose it follows was due. */
  doseAt?: string;
}

/** Works out what a notification was about, including one that was snoozed. */
function readReminderData(data: Record<string, unknown> | undefined): ReminderData | null {
  const type = data?.type === 'snooze' ? data.originType : data?.type;
  const referenceId = typeof data?.referenceId === 'string' ? data.referenceId : null;
  if (!referenceId) return null;
  if (type === 'medication' || type === 'medication_nudge') {
    return {
      kind: 'medication',
      referenceId,
      doseAt: typeof data?.doseAt === 'string' ? data.doseAt : undefined,
    };
  }
  if (type === 'appointment') return { kind: 'appointment', referenceId };
  return null;
}

function hrefFor(reminder: ReminderData): Href {
  return reminder.kind === 'medication'
    ? `/care/medications/${reminder.referenceId}`
    : `/care/appointments/${reminder.referenceId}`;
}

/** expo-notifications reports the delivery time in seconds on some platforms and ms on others. */
function deliveredAt(notification: Notifications.Notification): Date {
  const raw = notification.date;
  return new Date(raw < 1e12 ? raw * 1000 : raw);
}

/**
 * Makes reminders do something when they're used. Tapping one opens the
 * medication or appointment it was about; "Done" logs the dose; "Snooze"
 * sends the reminder again in a few minutes. Also handles a reminder that
 * was tapped while the app wasn't running.
 */
export function useNotificationResponses(): void {
  const { session } = useSession();
  const { data: profile } = useProfile();
  const { showToast } = useToast();
  const createLog = useCreateMedicationLog();
  const handled = useRef(new Set<string>());
  const ready = Platform.OS !== 'web' && !!session && !!profile?.onboarding_completed;

  const handle = useCallback(
    async (response: Notifications.NotificationResponse) => {
      const content = response.notification.request.content;
      const key = `${response.notification.request.identifier}:${response.actionIdentifier}`;
      if (handled.current.has(key)) return;
      handled.current.add(key);

      const reminder = readReminderData(content.data as Record<string, unknown> | undefined);
      if (!reminder) return;

      if (response.actionIdentifier === ACTION_SNOOZE) {
        await scheduleSnooze({
          title: content.title,
          body: content.body,
          data: content.data as Record<string, unknown> | null,
          categoryIdentifier: content.categoryIdentifier,
        });
        return;
      }

      if (response.actionIdentifier === ACTION_DONE && reminder.kind === 'medication') {
        const dueAt = reminder.doseAt
          ? new Date(reminder.doseAt)
          : deliveredAt(response.notification);
        try {
          await createLog.mutateAsync({
            medication_id: reminder.referenceId,
            scheduled_at: dueAt.toISOString(),
            completed_at: new Date().toISOString(),
            status: 'completed',
          });
          showToast('Marked as done.');
        } catch {
          showToast("Couldn't mark that as done. Open the medication to log it.", 'error');
        }
        return;
      }

      if (response.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
        router.push(hrefFor(reminder));
      }
    },
    [createLog, showToast],
  );

  useEffect(() => {
    if (!ready) return;
    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) void handle(response);
    });
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      void handle(response);
    });
    return () => subscription.remove();
  }, [ready, handle]);
}
