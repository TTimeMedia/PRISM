import React from 'react';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import {
  PRISMErrorState,
  PRISMHeader,
  PRISMIconButton,
  PRISMSelect,
  PRISMSkeleton,
  spacing,
  useTheme,
} from '@prism/ui';
import type { Theme } from '@prism/types';
import { useSettings, useUpdateSettings } from '../../../lib/profile/queries';
import { useAppStore } from '../../../lib/store/appStore';

const THEME_OPTIONS = [
  { value: 'light' as const, label: 'Light' },
  { value: 'dark' as const, label: 'Dark' },
  { value: 'system' as const, label: 'System', description: 'Matches your device setting.' },
];

/**
 * Screen 62 — Appearance. `appStore.themePreference` is a local cache
 * of `settings.theme` (docs/BUILD_STATUS.md § state architecture) — this
 * screen writes both, so the UI updates instantly while the server stays
 * the source of truth.
 */
export function AppearanceScreen() {
  const theme = useTheme();
  const { data: settings, isLoading, isError, refetch } = useSettings();
  const updateSettings = useUpdateSettings();
  const setThemePreference = useAppStore((state) => state.setThemePreference);

  const setTheme = (value: Theme) => {
    setThemePreference(value);
    updateSettings.mutate({ theme: value });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PRISMHeader
        title="Appearance."
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
        <View style={styles.content}>
          <PRISMSelect
            label="Theme"
            options={THEME_OPTIONS}
            value={settings.theme}
            onChange={setTheme}
          />
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
