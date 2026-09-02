import React from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ArrowLeft, Plus } from 'lucide-react-native';
import {
  PRISMEmptyState,
  PRISMErrorState,
  PRISMHeader,
  PRISMIconButton,
  PRISMListItem,
  PRISMSkeleton,
  spacing,
  useTheme,
} from '@prism/ui';
import { useInjections, useMedications } from '../../../lib/care/queries';
import { INJECTION_SITE_OPTIONS } from '../optionLabels';

/** Screen 29 — Injection History. */
export function InjectionHistoryScreen() {
  const theme = useTheme();
  const { data: injections, isLoading, isError, refetch } = useInjections();
  const { data: medications } = useMedications();
  const medicationNames = new Map((medications ?? []).map((m) => [m.id, m.name]));

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PRISMHeader
        title="Injections"
        leading={
          <PRISMIconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.text.primary} />
          </PRISMIconButton>
        }
        trailing={
          <PRISMIconButton
            accessibilityLabel="Log injection"
            onPress={() => router.push('/care/injections/add')}
          >
            <Plus size={22} color={theme.colors.text.primary} />
          </PRISMIconButton>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        {isLoading ? (
          <PRISMSkeleton height={56} />
        ) : isError ? (
          <PRISMErrorState onRetry={() => refetch()} />
        ) : (injections ?? []).length === 0 ? (
          <PRISMEmptyState
            title="No injections logged yet."
            subtitle="Log one whenever you're ready."
            action={{ label: 'Log injection', onPress: () => router.push('/care/injections/add') }}
          />
        ) : (
          <View style={styles.list}>
            {(injections ?? []).map((injection) => {
              const site = INJECTION_SITE_OPTIONS.find((o) => o.value === injection.site)?.label;
              const medicationName = injection.medication_id
                ? medicationNames.get(injection.medication_id)
                : undefined;
              const subtitleParts = [medicationName, site].filter(Boolean);
              return (
                <PRISMListItem
                  key={injection.id}
                  title={new Date(injection.injected_at).toLocaleString()}
                  subtitle={subtitleParts.join(' · ')}
                  showChevron={false}
                />
              );
            })}
          </View>
        )}
      </ScrollView>
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
  list: {
    gap: spacing.xs,
  },
});
