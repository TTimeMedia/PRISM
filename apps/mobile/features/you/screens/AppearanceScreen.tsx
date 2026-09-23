import React from 'react';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, Check } from 'lucide-react-native';
import {
  ACCENT_THEMES,
  type AccentKey,
  onAccentColor,
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
  const accentColor = useAppStore((state) => state.accentColor);
  const setAccentColor = useAppStore((state) => state.setAccentColor);

  const selectAccent = (key: AccentKey) => {
    setAccentColor(key);
    updateSettings.mutate({ accent_color: key });
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
        <View style={styles.content}>
          <PRISMSelect
            label="Theme"
            options={THEME_OPTIONS}
            value={settings.theme}
            onChange={setTheme}
          />
          <Text style={[styles.sectionLabel, { color: theme.colors.text.secondary }]}>
            Accent color
          </Text>
          <View style={styles.swatches} accessibilityRole="radiogroup">
            {ACCENT_THEMES.map(({ key, label, color }) => {
              const selected = key === accentColor;
              return (
                <Pressable
                  key={key}
                  accessibilityRole="radio"
                  accessibilityLabel={`${label} accent`}
                  accessibilityState={{ selected }}
                  onPress={() => selectAccent(key)}
                  style={styles.swatchItem}
                >
                  <View
                    style={[
                      styles.swatch,
                      { backgroundColor: color },
                      selected && { borderColor: theme.colors.text.primary },
                    ]}
                  >
                    {selected ? <Check size={20} color={onAccentColor(color)} /> : null}
                  </View>
                  <Text style={[styles.swatchLabel, { color: theme.colors.text.tertiary }]}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
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
  sectionLabel: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  swatches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  swatchItem: {
    alignItems: 'center',
    width: 64,
    gap: spacing.xs,
  },
  swatch: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchLabel: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
  },
});
