import React from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
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
} from '@prizm/ui';
import { useSettings, useUpdateSettings } from '../../../lib/profile/queries';

/**
 * Screen 61 — Accessibility. "Reduced motion" is the one real toggle
 * here (settings.reduced_motion, wired through ReducedMotionProvider in
 * app/_layout.tsx). Text size, contrast, and screen reader support are
 * already handled by respecting OS-level settings throughout PRIZM
 * (system font scaling, semantic accessibilityLabel/Role on every
 * control) rather than a separate, PRIZM-specific override that would
 * fight the OS setting — see docs/DECISIONS.md § YOU.
 */
export function AccessibilityScreen() {
  const theme = useTheme();
  const { data: settings, isLoading, isError, refetch } = useSettings();
  const updateSettings = useUpdateSettings();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PRIZMHeader
        title="Accessibility."
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
              label="Reduced motion"
              description="Skip decorative motion effects throughout Prizm."
              value={settings.reduced_motion}
              onValueChange={(value) => updateSettings.mutate({ reduced_motion: value })}
            />
          </PRIZMSection>
          <Text style={[styles.note, { color: theme.colors.text.tertiary }]}>
            Text size follows your device&rsquo;s system setting. Screen reader labels are built
            into every Prizm control. Increased contrast isn&rsquo;t available as a separate Prizm
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
