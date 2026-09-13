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
 * Screen 61 — Accessibility. "Reduced motion" is the one real toggle
 * here (settings.reduced_motion, wired through ReducedMotionProvider in
 * app/_layout.tsx). Text size, contrast, and screen reader support are
 * already handled by respecting OS-level settings throughout PRISM
 * (system font scaling, semantic accessibilityLabel/Role on every
 * control) rather than a separate, PRISM-specific override that would
 * fight the OS setting — see docs/DECISIONS.md § YOU.
 */
export function AccessibilityScreen() {
  const theme = useTheme();
  const { data: settings, isLoading, isError, refetch } = useSettings();
  const updateSettings = useUpdateSettings();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PRISMHeader
        title="Accessibility."
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
              label="Reduced motion"
              description="Skip decorative motion effects throughout PRISM."
              value={settings.reduced_motion}
              onValueChange={(value) => updateSettings.mutate({ reduced_motion: value })}
            />
          </PRISMSection>
          <Text style={[styles.note, { color: theme.colors.text.tertiary }]}>
            Text size follows your device&rsquo;s system setting. Screen reader labels are built
            into every PRISM control. Increased contrast isn&rsquo;t available as a separate PRISM
            setting yet — for now, your device&rsquo;s own contrast setting applies.
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
