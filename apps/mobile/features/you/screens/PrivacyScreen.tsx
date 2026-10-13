import React from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, Lock, ShieldCheck } from 'lucide-react-native';
import {
  PRIZMErrorState,
  PRIZMHeader,
  PRIZMIconButton,
  PRIZMListItem,
  PRIZMSection,
  PRIZMSkeleton,
  PRIZMSwitch,
  spacing,
  type,
  useTheme,
} from '@prizm/ui';
import { useSettings, useUpdateSettings } from '../../../lib/profile/queries';
import { useAppStore } from '../../../lib/store/appStore';

/** Screen 59 — Privacy. See docs/SCREEN_BIBLE.md Screen 59. */
export function PrivacyScreen() {
  const theme = useTheme();
  const { data: settings, isLoading, isError, refetch } = useSettings();
  const updateSettings = useUpdateSettings();
  const analyticsConsent = useAppStore((state) => state.analyticsConsent);
  const setAnalyticsConsent = useAppStore((state) => state.setAnalyticsConsent);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PRIZMHeader
        title="Privacy & security."
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
          <PRIZMSection title="App security">
            <PRIZMListItem
              title="App lock"
              subtitle={settings.app_lock_enabled ? 'On' : 'Off'}
              leading={<Lock size={20} color={theme.accent} />}
              onPress={() => router.push('/you/privacy/app-lock')}
            />
          </PRIZMSection>

          <PRIZMSection title="Notifications">
            <PRIZMSwitch
              label="Private notifications"
              description={
                'Notification previews stay generic, e.g. "Your Prizm reminder is ready."'
              }
              value={settings.notification_privacy}
              onValueChange={(value) => updateSettings.mutate({ notification_privacy: value })}
            />
          </PRIZMSection>

          <PRIZMSection title="Data">
            <PRIZMListItem title="Data & export" onPress={() => router.push('/you/data')} />
            <PRIZMSwitch
              label="Share anonymous usage"
              description="Which screens and features get used, so Prizm can be improved. Never your name, health details or anything you write."
              value={analyticsConsent === 'granted'}
              onValueChange={(value) => setAnalyticsConsent(value ? 'granted' : 'declined')}
            />
          </PRIZMSection>

          <PRIZMSection title="Security information">
            <View style={styles.infoRow}>
              <ShieldCheck size={20} color={theme.spectrum.mint} />
              <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
                Your information is scoped to your account at the database level — no other Prizm
                user can query, guess into, or read it. Sensitive files (photos, documents) live in
                private storage, never a public link. Prizm doesn&rsquo;t sell your information or
                share it with third parties for advertising. Anonymous usage counts are only sent if
                you turn them on above.
              </Text>
            </View>
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
  infoRow: {
    flexDirection: 'row',
    gap: spacing.smd,
  },
  infoText: {
    flex: 1,
    fontSize: type.bodyM.fontSize,
    lineHeight: type.bodyM.lineHeight,
  },
});
