import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import {
  PRISMErrorState,
  PRISMHeader,
  PRISMIconButton,
  PRISMSection,
  PRISMSkeleton,
  PRISMSwitch,
  spacing,
  useTheme,
} from '@prism/ui';
import type { ModuleKey } from '@prism/types';
import { useModules, useSetModuleEnabled } from '../../../lib/profile/queries';
import { MODULE_INFO } from '../moduleInfo';

/**
 * Screen 57 — Module Configuration. Only offers settings with a real,
 * wired effect — see docs/DECISIONS.md § YOU. "Default reminders" seeds
 * the Add form's reminder toggle for medications/appointments; "Mood
 * tracking" shows/hides the Journal entry form's Mood field. Modules
 * with no per-item reminder field (injections, milestones) offer only
 * Enabled — there is nothing else real to configure yet.
 */
export function ModuleConfigScreen() {
  const theme = useTheme();
  const { moduleKey } = useLocalSearchParams<{ moduleKey: ModuleKey }>();
  const { data: modules, isLoading, isError, refetch } = useModules();
  const setModuleEnabled = useSetModuleEnabled();

  const info = MODULE_INFO.find((m) => m.key === moduleKey);
  const moduleRow = modules?.find((m) => m.module_key === moduleKey);
  const isEnabled = moduleRow?.enabled ?? false;
  const configuration = moduleRow?.configuration ?? {};

  const setEnabled = (enabled: boolean) => {
    if (!moduleKey) return;
    setModuleEnabled.mutate({ moduleKey, enabled, configuration });
  };

  const setConfigValue = (key: string, value: boolean) => {
    if (!moduleKey) return;
    setModuleEnabled.mutate({
      moduleKey,
      enabled: isEnabled,
      configuration: { ...configuration, [key]: value },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PRISMHeader
        title={info?.label ?? 'Module'}
        leading={
          <PRISMIconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.text.primary} />
          </PRISMIconButton>
        }
      />
      {isLoading ? (
        <PRISMSkeleton height={56} />
      ) : isError || !info ? (
        <PRISMErrorState onRetry={() => refetch()} />
      ) : (
        <View style={styles.content}>
          <PRISMSection>
            <PRISMSwitch
              label="Enabled"
              description={info.description}
              value={isEnabled}
              onValueChange={setEnabled}
            />
          </PRISMSection>
          {info.hasReminderDefault ? (
            <PRISMSection title="Reminder behavior">
              <PRISMSwitch
                label="Default reminders on for new items"
                description={`New ${info.label.toLowerCase()} start with reminders on.`}
                value={Boolean(configuration.default_reminder_enabled)}
                onValueChange={(value) => setConfigValue('default_reminder_enabled', value)}
              />
            </PRISMSection>
          ) : null}
          {moduleKey === 'journal' ? (
            <PRISMSection title="Journal">
              <PRISMSwitch
                label="Mood tracking"
                description="Show a free-text Mood field on journal entries."
                value={configuration.mood_tracking_enabled !== false}
                onValueChange={(value) => setConfigValue('mood_tracking_enabled', value)}
              />
            </PRISMSection>
          ) : null}
        </View>
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
});
