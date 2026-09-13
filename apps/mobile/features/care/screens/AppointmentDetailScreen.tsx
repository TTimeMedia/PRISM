import React, { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import {
  PRISMButton,
  PRISMErrorState,
  PRISMHeader,
  PRISMIconButton,
  PRISMModal,
  PRISMSection,
  PRISMSkeleton,
  spacing,
  type,
  useTheme,
  useToast,
} from '@prism/ui';
import { useAppointment } from '../../../lib/care/queries';
import { useDeleteAppointment } from '../../../lib/care/mutations';

/** Screen 33 — Appointment Detail. */
export function AppointmentDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: appointment, isLoading, isError, refetch } = useAppointment(id);
  const deleteAppointment = useDeleteAppointment();
  const { showToast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    setConfirmDelete(false);
    try {
      await deleteAppointment.mutateAsync(id);
      router.back();
    } catch {
      showToast("Couldn't delete this appointment. Please try again.", 'error');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PRISMHeader
        title={appointment?.title ?? 'Appointment'}
        leading={
          <PRISMIconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.text.primary} />
          </PRISMIconButton>
        }
      />
      {isLoading ? (
        <PRISMSkeleton height={56} />
      ) : isError || !appointment ? (
        <PRISMErrorState onRetry={() => refetch()} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <PRISMSection>
            <DetailRow label="Provider" value={appointment.provider} />
            <DetailRow label="Category" value={appointment.category} />
            <DetailRow
              label="Date & time"
              value={new Date(appointment.starts_at).toLocaleString()}
            />
            <DetailRow label="Location" value={appointment.location} />
            <DetailRow label="Reminder" value={appointment.reminder_enabled ? 'On' : 'Off'} />
            <DetailRow label="Notes" value={appointment.notes} />
          </PRISMSection>
          <View style={styles.actions}>
            <PRISMButton
              label="Edit"
              variant="secondary"
              onPress={() => router.push(`/care/appointments/${id}/edit`)}
            />
            <PRISMButton
              label="Delete"
              variant="destructive"
              onPress={() => setConfirmDelete(true)}
            />
          </View>
        </ScrollView>
      )}
      <PRISMModal
        visible={confirmDelete}
        title="Delete this appointment?"
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
  },
});
