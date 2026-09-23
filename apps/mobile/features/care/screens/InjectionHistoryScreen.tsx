import React, { useState } from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react-native';
import {
  PRISMEmptyState,
  PRISMErrorState,
  PRISMHeader,
  PRISMIconButton,
  PRISMListItem,
  PRISMModal,
  PRISMSkeleton,
  spacing,
  useTheme,
  useToast,
} from '@prism/ui';
import { useInjections, useMedications } from '../../../lib/care/queries';
import { useDeleteInjection } from '../../../lib/care/mutations';
import { INJECTION_SITE_OPTIONS } from '../optionLabels';

/** Screen 29 — Injection History. */
export function InjectionHistoryScreen() {
  const theme = useTheme();
  const { data: injections, isLoading, isError, refetch } = useInjections();
  const { data: medications } = useMedications();
  const medicationNames = new Map((medications ?? []).map((m) => [m.id, m.name]));
  const deleteInjection = useDeleteInjection();
  const { showToast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const injectionId = deleteTarget;
    setDeleteTarget(null);
    try {
      await deleteInjection.mutateAsync(injectionId);
    } catch {
      showToast("Couldn't delete this entry. Please try again.", 'error');
    }
  };

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
                  trailing={
                    <PRISMIconButton
                      accessibilityLabel="Delete entry"
                      onPress={() => setDeleteTarget(injection.id)}
                    >
                      <Trash2 size={20} color={theme.colors.text.tertiary} />
                    </PRISMIconButton>
                  }
                />
              );
            })}
          </View>
        )}
      </ScrollView>
      <PRISMModal
        visible={!!deleteTarget}
        title="Delete this entry?"
        message="This removes the entry from your history. This can't be undone."
        onRequestClose={() => setDeleteTarget(null)}
        actions={[
          { label: 'Cancel', onPress: () => setDeleteTarget(null), variant: 'secondary' },
          { label: 'Delete', onPress: handleDelete, variant: 'destructive' },
        ]}
      />
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
