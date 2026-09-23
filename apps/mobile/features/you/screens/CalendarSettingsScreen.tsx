import React from 'react';
import { router } from 'expo-router';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
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
  useToast,
} from '@prism/ui';
import { useSettings, useUpdateSettings } from '../../../lib/profile/queries';
import { calendarProvider } from '../../../lib/calendar';

/**
 * Calendar sync settings — opt-in device-calendar (Apple Calendar on
 * iOS) integration for appointments. Permission is requested only here,
 * only on the transition to ON, never eagerly — same shape as App
 * Lock's toggle-intercept pattern (AppLockSettingsScreen.tsx).
 */
export function CalendarSettingsScreen() {
  const theme = useTheme();
  const { data: settings, isLoading, isError, refetch } = useSettings();
  const updateSettings = useUpdateSettings();
  const { showToast } = useToast();
  const available = Platform.OS === 'ios';

  const toggleCalendarSync = async (value: boolean) => {
    if (value) {
      try {
        const granted = await calendarProvider.requestPermission();
        if (!granted) {
          showToast('Calendar access was not granted.', 'error');
          return;
        }
      } catch {
        showToast("Calendar isn't available in this build of PRISM.", 'error');
        return;
      }
    }
    updateSettings.mutate({ calendar_sync_enabled: value });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PRISMHeader
        title="Calendar."
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
          <PRISMSection>
            <PRISMSwitch
              label="Sync to calendar"
              description={
                available
                  ? 'Add appointments to your device calendar. PRISM only asks for calendar access once you turn this on.'
                  : 'Not available on this device.'
              }
              value={settings.calendar_sync_enabled}
              disabled={!available}
              onValueChange={toggleCalendarSync}
            />
          </PRISMSection>
          <Text style={[styles.note, { color: theme.colors.text.tertiary }]}>
            Once this is on, open any appointment to add it to your calendar.
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
