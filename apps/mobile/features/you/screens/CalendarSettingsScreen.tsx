import React from 'react';
import { router } from 'expo-router';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import {
  PRIZMErrorState,
  PRIZMHeader,
  PRIZMIconButton,
  PRIZMSection,
  PRIZMSkeleton,
  PRIZMSwitch,
  spacing,
  type,
  useTheme,
  useToast,
} from '@prizm/ui';
import { useSettings, useUpdateSettings } from '../../../lib/profile/queries';
import { calendarProvider } from '../../../lib/calendar';
import { useAppStore } from '../../../lib/store/appStore';

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
  const suggestionsOn = useAppStore((state) => state.calendarSuggestions);
  const setSuggestionsOn = useAppStore((state) => state.setCalendarSuggestions);

  // Turning suggestions on is the moment Prizm asks to read the calendar.
  const toggleSuggestions = async (value: boolean) => {
    if (value) {
      try {
        if (!(await calendarProvider.requestReadPermission())) {
          showToast("Calendar access wasn't allowed, so there's nothing to suggest.", 'error');
          return;
        }
      } catch {
        showToast("Calendar isn't available in this build of Prizm.", 'error');
        return;
      }
    }
    setSuggestionsOn(value);
  };

  const toggleCalendarSync = async (value: boolean) => {
    if (value) {
      try {
        const granted = await calendarProvider.requestPermission();
        if (!granted) {
          showToast('Calendar access was not granted.', 'error');
          return;
        }
      } catch {
        showToast("Calendar isn't available in this build of Prizm.", 'error');
        return;
      }
    }
    updateSettings.mutate({ calendar_sync_enabled: value });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PRIZMHeader
        title="Calendar."
        leading={
          <PRIZMIconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.text.primary} />
          </PRIZMIconButton>
        }
      />
      {isLoading ? (
        <PRIZMSkeleton height={56} />
      ) : isError || !settings ? (
        <PRIZMErrorState onRetry={() => refetch()} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <PRIZMSection>
            <PRIZMSwitch
              label="Sync to calendar"
              description={
                available
                  ? 'Add appointments to your device calendar. Prizm only asks for calendar access once you turn this on.'
                  : 'Not available on this device.'
              }
              value={settings.calendar_sync_enabled}
              disabled={!available}
              onValueChange={toggleCalendarSync}
            />
          </PRIZMSection>
          <Text style={[styles.note, { color: theme.colors.text.tertiary }]}>
            Once this is on, open any appointment to add it to your calendar.
          </Text>
          <PRIZMSection>
            <PRIZMSwitch
              label="Suggest appointments from my calendar"
              description={
                available
                  ? 'When you open Prizm, it looks at upcoming events on this phone and offers the ones that look like appointments on Today. Nothing is kept unless you add it.'
                  : 'Not available on this device.'
              }
              value={suggestionsOn}
              disabled={!available}
              onValueChange={toggleSuggestions}
            />
          </PRIZMSection>
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
