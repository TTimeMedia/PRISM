import React from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import {
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
          <PRISMSection title="Notifications">
            <PRISMSwitch
              label="Private notifications"
              description={
                'Notification previews stay generic, e.g. "Your PRISM reminder is ready."'
              }
              value={settings.notification_privacy}
              onValueChange={(value) => updateSettings.mutate({ notification_privacy: value })}
            />
          </PRISMSection>
          <Text style={[styles.note, { color: theme.colors.text.tertiary }]}>
            Medication and appointment reminders are set per item — open a medication or appointment
            and turn its reminder on or off there.
          </Text>
        </ScrollView>
      )}
    </View>
  );
}

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
