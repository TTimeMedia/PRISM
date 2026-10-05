import React, { useState } from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import {
  type PaletteKey,
  PRISMErrorState,
  PRISMHeader,
  PRISMIconButton,
  PRISMSelect,
  PRISMSkeleton,
  spacing,
  type,
  useTheme,
} from '@prism/ui';
import type { Theme } from '@prism/types';
import { useSettings, useUpdateSettings } from '../../../lib/profile/queries';
import { useAppStore } from '../../../lib/store/appStore';
import { canChangeAppIcon, currentAppIcon, setAppIcon } from '../../../lib/you/appIcon';
import { AppIconPicker } from '../components/AppIconPicker';
import { PalettePicker } from '../components/PalettePicker';

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
  const palette = useAppStore((state) => state.palette);
  const setPalette = useAppStore((state) => state.setPalette);

  const [appIcon, setAppIconState] = useState<PaletteKey>(() => currentAppIcon());

  const selectAppIcon = (key: PaletteKey) => {
    const previous = appIcon;
    setAppIconState(key);
    // iOS shows its own "You have changed the icon" alert; if it refuses, show what's really there.
    setAppIcon(key).catch(() => setAppIconState(previous));
  };

  const selectPalette = (key: PaletteKey) => {
    setPalette(key);
    updateSettings.mutate({ palette: key });
  };

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
        <ScrollView contentContainerStyle={styles.content}>
          <PRISMSelect
            label="Theme"
            options={THEME_OPTIONS}
            value={settings.theme}
            onChange={setTheme}
          />
          <Text style={[styles.sectionLabel, { color: theme.colors.text.secondary }]}>Colors</Text>
          <PalettePicker value={palette} onChange={selectPalette} />
          {canChangeAppIcon() ? (
            <>
              <Text style={[styles.sectionLabel, { color: theme.colors.text.secondary }]}>
                App icon
              </Text>
              <AppIconPicker value={appIcon} onChange={selectAppIcon} />
            </>
          ) : null}
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
  sectionLabel: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
});
