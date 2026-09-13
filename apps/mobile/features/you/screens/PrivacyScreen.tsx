import React from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, Lock, ShieldCheck } from 'lucide-react-native';
import {
  PRISMErrorState,
  PRISMHeader,
  PRISMIconButton,
  PRISMListItem,
  PRISMSection,
  PRISMSkeleton,
  PRISMSwitch,
  spacing,
  type,
  useTheme,
} from '@prism/ui';
import { useSettings, useUpdateSettings } from '../../../lib/profile/queries';

/** Screen 59 — Privacy. See docs/SCREEN_BIBLE.md Screen 59. */
export function PrivacyScreen() {
  const theme = useTheme();
  const { data: settings, isLoading, isError, refetch } = useSettings();
  const updateSettings = useUpdateSettings();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PRISMHeader
        title="Privacy & security."
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
          <PRISMSection title="App security">
            <PRISMListItem
              title="App lock"
              subtitle={settings.app_lock_enabled ? 'On' : 'Off'}
              leading={<Lock size={20} color={theme.spectrum.cyan} />}
              onPress={() => router.push('/you/privacy/app-lock')}
            />
          </PRISMSection>

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

          <PRISMSection title="Data">
            <PRISMListItem title="Data & export" onPress={() => router.push('/you/data')} />
          </PRISMSection>

          <PRISMSection title="Security information">
            <View style={styles.infoRow}>
              <ShieldCheck size={20} color={theme.spectrum.mint} />
              <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
                Your information is scoped to your account at the database level — no other PRISM
                user can query, guess into, or read it. Sensitive files (photos, documents) live in
                private storage, never a public link. PRISM doesn&rsquo;t sell your information or
                share it with third parties for advertising.
              </Text>
            </View>
          </PRISMSection>
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
