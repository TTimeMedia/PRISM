import React, { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import {
  PRISMButton,
  PRISMErrorState,
  PRISMHeader,
  PRISMIconButton,
  PRISMListItem,
  PRISMModal,
  PRISMSection,
  PRISMSkeleton,
  spacing,
  type,
  useTheme,
  useToast,
} from '@prism/ui';
import { useMedication, useMedicationLogs } from '../../../lib/care/queries';
import { useDeleteMedication, usePauseMedication } from '../../../lib/care/mutations';
import { describeFrequency, isMedicationActive } from '../medicationDisplay';
import { MEDICATION_FORM_OPTIONS, MEDICATION_LOG_STATUS_OPTIONS } from '../optionLabels';

/** Screen 26 — Medication Detail. Pause preserves history — it never deletes past logs. */
export function MedicationDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: medication, isLoading, isError, refetch } = useMedication(id);
  const { data: logs } = useMedicationLogs(id);
  const { pause, resume, isPending: pausing } = usePauseMedication(id);
  const deleteMedication = useDeleteMedication();
  const { showToast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const active = medication ? isMedicationActive(medication.end_date) : true;

  const handlePauseToggle = async () => {
    try {
      await (active ? pause() : resume());
    } catch {
      showToast("Couldn't update this medication. Please try again.", 'error');
    }
  };

  const handleDelete = async () => {
    setConfirmDelete(false);
    try {
      await deleteMedication.mutateAsync(id);
      router.back();
    } catch {
      showToast("Couldn't delete this medication. Please try again.", 'error');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PRISMHeader
        title={medication?.name ?? 'Medication'}
        leading={
          <PRISMIconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.text.primary} />
          </PRISMIconButton>
        }
      />
      {isLoading ? (
        <PRISMSkeleton height={56} />
      ) : isError || !medication ? (
        <PRISMErrorState onRetry={() => refetch()} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <PRISMSection>
            <DetailRow
              label="Form"
              value={MEDICATION_FORM_OPTIONS.find((o) => o.value === medication.form)?.label}
            />
            <DetailRow label="Dosage" value={medication.dosage_text} />
            <DetailRow
              label="Schedule"
              value={describeFrequency(medication.frequency_type, medication.frequency_config)}
            />
            <DetailRow label="Start date" value={medication.start_date} />
            <DetailRow label="End date" value={medication.end_date} />
            <DetailRow label="Reminder" value={medication.reminder_enabled ? 'On' : 'Off'} />
            <DetailRow label="Notes" value={medication.notes} />
            <DetailRow label="Status" value={active ? 'Active' : 'Paused'} />
          </PRISMSection>

          <View style={styles.actions}>
            <PRISMButton label="Log" onPress={() => router.push(`/care/medications/${id}/log`)} />
            <PRISMButton
              label="Edit"
              variant="secondary"
              onPress={() => router.push(`/care/medications/${id}/edit`)}
            />
            <PRISMButton
              label={active ? 'Pause' : 'Resume'}
              variant="secondary"
              loading={pausing}
              onPress={handlePauseToggle}
            />
            <PRISMButton
              label="Delete"
              variant="destructive"
              onPress={() => setConfirmDelete(true)}
            />
          </View>

          <PRISMSection title="Recent activity">
            {logs && logs.length > 0 ? (
              <View style={styles.list}>
                {logs.slice(0, 3).map((log) => (
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
                <PRISMButton
                  label="View all"
                  variant="tertiary"
                  onPress={() => router.push(`/care/medications/${id}/history`)}
                />
              </View>
            ) : (
              <Text style={[styles.empty, { color: theme.colors.text.tertiary }]}>
                No activity logged yet.
              </Text>
            )}
          </PRISMSection>
        </ScrollView>
      )}
      <PRISMModal
        visible={confirmDelete}
        title="Delete this medication?"
        message="This removes the medication itself. Its past logs stay in your history."
        onRequestClose={() => setConfirmDelete(false)}
        actions={[
          { label: 'Cancel', onPress: () => setConfirmDelete(false), variant: 'secondary' },
          { label: 'Delete', onPress: handleDelete, variant: 'destructive' },
        ]}
      />
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  const theme = useTheme();
  if (!value) return null;
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: theme.colors.text.tertiary }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: theme.colors.text.primary }]}>{value}</Text>
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
  row: {
    marginBottom: spacing.sm,
  },
  rowLabel: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
  },
  rowValue: {
    fontSize: type.bodyL.fontSize,
    lineHeight: type.bodyL.lineHeight,
  },
  actions: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  list: {
    gap: spacing.xs,
  },
  empty: {
    fontSize: type.bodyM.fontSize,
    lineHeight: type.bodyM.lineHeight,
  },
});
