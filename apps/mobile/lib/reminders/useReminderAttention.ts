import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { useAppointments, useMedications } from '../care/queries';
import {
  getNotificationPermissionStatus,
  type NotificationPermissionStatus,
} from './notificationScheduler';

/**
 * True when there are reminders switched on but this phone isn't allowed to
 * send them, so the bell should ask for a look. Never true for someone who
 * hasn't turned any reminder on, so it never nags people who don't want them.
 */
export function useReminderAttention(): boolean {
  const { data: medications } = useMedications();
  const { data: appointments } = useAppointments();
  const [status, setStatus] = useState<NotificationPermissionStatus>('granted');

  useEffect(() => {
    const refresh = () => void getNotificationPermissionStatus().then(setStatus);
    refresh();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => subscription.remove();
  }, []);

  const wantsReminders =
    !!medications?.some((m) => m.reminder_enabled) ||
    !!appointments?.some((a) => a.reminder_enabled);
  return wantsReminders && status !== 'granted' && status !== 'unsupported';
}
