import React, { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { AppState, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import {
  PRISMButton,
  PRISMChipGroup,
  PRISMErrorState,
  PRISMHeader,
  PRISMIconButton,
  PRISMSection,
  PRISMSkeleton,
  PRISMSwitch,
  spacing,
  type,
  useTheme,
} from '@prism/ui';
import { useSettings, useUpdateSettings } from '../../../lib/profile/queries';
import { useAppStore } from '../../../lib/store/appStore';
import {
  getNotificationPermissionStatus,
  requestNotificationPermissions,
  scheduleTestReminder,
  type NotificationPermissionStatus,
} from '../../../lib/reminders/notificationScheduler';

/**
 * Screen 58 — Notification Settings. Medication and appointment
 * reminders are real (see lib/reminders/useReminderSync.ts) but toggled
 * per-item, on each medication's/appointment's own Add/Edit screen —
 * not centrally here, since "remind me about this one" is a property of
 * the thing being reminded about, not a global category switch. This
 * screen only holds settings that really are global: notification
 * privacy. See docs/DECISIONS.md § YOU.
 */
export function NotificationSettingsScreen() {
  const theme = useTheme();
  const { data: settings, isLoading, isError, refetch } = useSettings();
  const updateSettings = useUpdateSettings();
  const missedDoseNudge = useAppStore((state) => state.missedDoseNudge);
  const setMissedDoseNudge = useAppStore((state) => state.setMissedDoseNudge);
  const leadMinutes = useAppStore((state) => state.appointmentLeadMinutes);
  const setLeadMinutes = useAppStore((state) => state.setAppointmentLeadMinutes);
  const [testSent, setTestSent] = useState(false);
  const [permission, setPermission] = useState<NotificationPermissionStatus>('unsupported');

  // Re-check whenever the app comes back to the foreground, so returning
  // from the phone's Settings reflects the change straight away.
  useEffect(() => {
    const refresh = () => void getNotificationPermissionStatus().then(setPermission);
    refresh();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => subscription.remove();
  }, []);

  const turnOnReminders = async () => {
    if (permission === 'denied') {
      await Linking.openSettings();
      return;
    }
    await requestNotificationPermissions();
    setPermission(await getNotificationPermissionStatus());
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PRISMHeader
        title="Notifications."
        leading={
          <PRISMIconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.text.primary} />
          </PRISMIconButton>
        }
      />
      {isLoading ? (
        <PRISMSkeleton height={56} />
      ) : isError || !settings ? (
        <PRISMErrorState onRetry={() => refetch()} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {permission === 'undetermined' || permission === 'denied' ? (
            <PRISMSection title="Reminders">
              <Text style={[styles.note, { color: theme.colors.text.secondary }]}>
                {permission === 'denied'
                  ? "Reminders are off on this phone, so Prism can't remind you about medications or appointments. Turn them on in your phone's Settings."
                  : 'Turn on reminders so Prism can tell you when a medication or appointment is coming up.'}
              </Text>
              <PRISMButton
                label={permission === 'denied' ? 'Open Settings' : 'Turn on reminders'}
                onPress={turnOnReminders}
              />
            </PRISMSection>
          ) : null}
          <PRISMSection title="Notifications">
            <PRISMSwitch
              label="Private notifications"
              description={
                'Notification previews stay generic, e.g. "Your Prism reminder is ready."'
              }
              value={settings.notification_privacy}
              onValueChange={(value) => updateSettings.mutate({ notification_privacy: value })}
            />
          </PRISMSection>
          <PRISMSection title="Appointment reminders">
            <Text style={[styles.note, { color: theme.colors.text.secondary }]}>
              When to be reminded about an appointment that has its reminder turned on. Pick as many
              as you like.
            </Text>
            <PRISMChipGroup
              options={LEAD_OPTIONS}
              value={leadMinutes.map(String)}
              onChange={(next) => setLeadMinutes(next.map(Number).sort((a, b) => a - b))}
              multiple
            />
          </PRISMSection>
          <PRISMSection title="Doses">
            <PRISMSwitch
              label="Gentle follow-up"
              description="If a dose isn't marked done 30 minutes after its reminder, send one more nudge."
              value={missedDoseNudge}
              onValueChange={setMissedDoseNudge}
            />
          </PRISMSection>
          <PRISMSection title="See how it looks">
            <PRISMButton
              label={testSent ? 'Sent. Look for it in a few seconds.' : 'Send a test reminder'}
              variant="secondary"
              disabled={permission !== 'granted'}
              onPress={async () => {
                await scheduleTestReminder(settings.notification_privacy);
                setTestSent(true);
              }}
            />
            {permission !== 'granted' ? (
              <Text style={[styles.note, { color: theme.colors.text.tertiary }]}>
                Turn on reminders above to send a test.
              </Text>
            ) : null}
          </PRISMSection>
          <Text style={[styles.note, { color: theme.colors.text.tertiary }]}>
            Reminders are set on this phone. Medication and appointment reminders are set per item —
            open a medication or appointment and turn its reminder on or off there.
          </Text>
        </ScrollView>
      )}
    </View>
  );
}

const LEAD_OPTIONS = [
  { value: '0', label: 'At the time' },
  { value: '60', label: '1 hour before' },
  { value: '1440', label: '1 day before' },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  note: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
    marginTop: spacing.sm,
  },
});
