import React, { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
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
import { useMedicationLogs } from '../../../lib/care/queries';
import { ChipField } from '../components/ChipField';
import { MEDICATION_LOG_FILTER_OPTIONS, MEDICATION_LOG_STATUS_OPTIONS } from '../optionLabels';

/** Screen 28 — Medication Log. Chronological entries, filterable by status. */
export function MedicationLogScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: logs, isLoading, isError, refetch } = useMedicationLogs(id);
  const [filter, setFilter] = useState<string | null>('all');

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
              />
            ))}
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
