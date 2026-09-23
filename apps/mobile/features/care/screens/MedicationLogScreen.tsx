import React, { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ArrowLeft, Trash2 } from 'lucide-react-native';
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
import { useMedicationLogs } from '../../../lib/care/queries';
import { useDeleteMedicationLog } from '../../../lib/care/mutations';
import { ChipField } from '../components/ChipField';
import { MEDICATION_LOG_FILTER_OPTIONS, MEDICATION_LOG_STATUS_OPTIONS } from '../optionLabels';

/** Screen 28 — Medication Log. Chronological entries, filterable by status. */
export function MedicationLogScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: logs, isLoading, isError, refetch } = useMedicationLogs(id);
  const deleteLog = useDeleteMedicationLog(id);
  const { showToast } = useToast();
  const [filter, setFilter] = useState<string | null>('all');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const logId = deleteTarget;
    setDeleteTarget(null);
    try {
      await deleteLog.mutateAsync(logId);
    } catch {
      showToast("Couldn't delete this entry. Please try again.", 'error');
    }
  };

  const visible = (logs ?? []).filter(
    (log) => !filter || filter === 'all' || log.status === filter,
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PRISMHeader
        title="Medication log"
        leading={
          <PRISMIconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.text.primary} />
          </PRISMIconButton>
        }
      />
      <View style={styles.filterRow}>
        <ChipField
          label="Filter"
          options={MEDICATION_LOG_FILTER_OPTIONS}
          value={filter}
          onChange={(v) => setFilter(v ?? 'all')}
        />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {isLoading ? (
          <PRISMSkeleton height={56} />
        ) : isError ? (
          <PRISMErrorState onRetry={() => refetch()} />
        ) : visible.length === 0 ? (
          <PRISMEmptyState title="Nothing logged yet." subtitle="Entries will show up here." />
        ) : (
          <View style={styles.list}>
            {visible.map((log) => (
              <PRISMListItem
                key={log.id}
                title={
                  MEDICATION_LOG_STATUS_OPTIONS.find((o) => o.value === log.status)?.label ??
                  log.status
                }
                subtitle={new Date(log.scheduled_at).toLocaleString()}
                showChevron={false}
                trailing={
                  <PRISMIconButton
                    accessibilityLabel="Delete entry"
                    onPress={() => setDeleteTarget(log.id)}
                  >
                    <Trash2 size={20} color={theme.colors.text.tertiary} />
                  </PRISMIconButton>
                }
              />
            ))}
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
  filterRow: {
    paddingHorizontal: spacing.lg,
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
