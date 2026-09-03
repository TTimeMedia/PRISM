import React from 'react';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, ChevronRight } from 'lucide-react-native';
import {
  PRISMCard,
  PRISMErrorState,
  PRISMHeader,
  PRISMIconButton,
  PRISMSkeleton,
  PRISMSwitch,
  spacing,
  type,
  useTheme,
} from '@prism/ui';
import type { ModuleKey } from '@prism/types';
import { useModules, useSetModuleEnabled } from '../../../lib/profile/queries';
import { MODULE_INFO } from '../moduleInfo';

/**
 * Screen 56 — Customize PRISM. Module toggles for the five P0 modules
 * only — see docs/SCREEN_BIBLE.md Screen 56. Toggling a module off never
 * deletes its data (docs/DECISIONS.md).
 */
export function CustomizeScreen() {
  const theme = useTheme();
  const { data: modules, isLoading, isError, refetch } = useModules();
  const setModuleEnabled = useSetModuleEnabled();
  const enabled = new Set((modules ?? []).filter((m) => m.enabled).map((m) => m.module_key));

  const toggle = (moduleKey: ModuleKey, next: boolean) => {
    setModuleEnabled.mutate({ moduleKey, enabled: next });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PRISMHeader
        title="Make PRISM yours."
        leading={
          <PRISMIconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.text.primary} />
          </PRISMIconButton>
        }
      />
      {isLoading ? (
        <View style={styles.content}>
          <PRISMSkeleton height={72} />
          <PRISMSkeleton height={72} />
        </View>
      ) : isError ? (
        <PRISMErrorState onRetry={() => refetch()} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {MODULE_INFO.map((info) => (
            <PRISMCard key={info.key} style={styles.card}>
              <View style={styles.body}>
                <View style={styles.row}>
                  {info.icon(theme.spectrum.cyan)}
                  <View style={styles.text}>
                    <Text style={[styles.title, { color: theme.colors.text.primary }]}>
                      {info.label}
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.colors.text.tertiary }]}>
                      {info.description}
                    </Text>
                  </View>
                </View>
                <PRISMSwitch
                  label={`${info.label} enabled`}
                  value={enabled.has(info.key)}
                  onValueChange={(value) => toggle(info.key, value)}
                />
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.configureRow,
                  { borderTopColor: theme.colors.border.subtle, opacity: pressed ? 0.7 : 1 },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Configure ${info.label}`}
                onPress={() => router.push(`/you/customize/${info.key}`)}
              >
                <Text style={[styles.configureLabel, { color: theme.colors.text.secondary }]}>
                  Configure
                </Text>
                <ChevronRight size={18} color={theme.colors.text.tertiary} />
              </Pressable>
            </PRISMCard>
          ))}
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
    gap: spacing.sm,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  body: {
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.smd,
    marginBottom: spacing.xs,
  },
  text: {
    flex: 1,
  },
  title: {
    fontSize: type.bodyL.fontSize,
    lineHeight: type.bodyL.lineHeight,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
    marginTop: 2,
  },
  configureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
  },
  configureLabel: {
    fontSize: type.bodyM.fontSize,
    lineHeight: type.bodyM.lineHeight,
  },
});
