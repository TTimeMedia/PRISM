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
import { useMilestone } from '../../../lib/journey/queries';
import { useDeleteMilestone } from '../../../lib/journey/mutations';

/** Screen 46 — Milestone Detail. */
export function MilestoneDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: milestone, isLoading, isError, refetch } = useMilestone(id);
  const deleteMilestone = useDeleteMilestone();
  const { showToast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    setConfirmDelete(false);
    try {
      await deleteMilestone.mutateAsync(id);
      router.back();
    } catch {
      showToast("Couldn't delete this milestone. Please try again.", 'error');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PRISMHeader
        title={milestone?.title ?? 'Milestone'}
        leading={
          <PRISMIconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.text.primary} />
          </PRISMIconButton>
        }
      />
      {isLoading ? (
        <PRISMSkeleton height={56} />
      ) : isError || !milestone ? (
        <PRISMErrorState onRetry={() => refetch()} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <PRISMSection>
            <DetailRow label="Date" value={formatDate(milestone.date)} />
            <DetailRow label="Category" value={milestone.category} />
            <DetailRow label="Description" value={milestone.description} />
          </PRISMSection>
          <View style={styles.actions}>
            <PRISMButton
              label="Edit"
              variant="secondary"
              onPress={() => router.push(`/journey/milestones/${id}/edit`)}
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
        title="Delete this milestone?"
        onRequestClose={() => setConfirmDelete(false)}
        actions={[
          { label: 'Cancel', onPress: () => setConfirmDelete(false), variant: 'secondary' },
          { label: 'Delete', onPress: handleDelete, variant: 'destructive' },
        ]}
      />
    </View>
  );
}

function formatDate(date: string): string {
  return new Date(`${date}T12:00:00.000Z`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
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
