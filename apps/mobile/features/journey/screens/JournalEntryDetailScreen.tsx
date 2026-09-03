import React, { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import {
  PRISMButton,
  PRISMChip,
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
import { useJournalEntry } from '../../../lib/journey/queries';
import { useDeleteJournalEntry } from '../../../lib/journey/mutations';

/** Screen 49 — Journal Entry Detail. Journal content must remain private — never sent to analytics. */
export function JournalEntryDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: entry, isLoading, isError, refetch } = useJournalEntry(id);
  const deleteJournalEntry = useDeleteJournalEntry();
  const { showToast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    setConfirmDelete(false);
    try {
      await deleteJournalEntry.mutateAsync(id);
      router.back();
    } catch {
      showToast("Couldn't delete this entry. Please try again.", 'error');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PRISMHeader
        title={entry?.title?.trim() || 'Journal entry'}
        leading={
          <PRISMIconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.text.primary} />
          </PRISMIconButton>
        }
      />
      {isLoading ? (
        <PRISMSkeleton height={56} />
      ) : isError || !entry ? (
        <PRISMErrorState onRetry={() => refetch()} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <PRISMSection>
            <Text style={[styles.date, { color: theme.colors.text.tertiary }]}>
              {formatDate(entry.date)}
            </Text>
            {entry.mood ? (
              <Text style={[styles.mood, { color: theme.colors.text.secondary }]}>
                {entry.mood}
              </Text>
            ) : null}
            <Text style={[styles.body, { color: theme.colors.text.primary }]}>{entry.content}</Text>
            {entry.tags.length > 0 ? (
              <View style={styles.tags}>
                {entry.tags.map((tag) => (
                  <PRISMChip key={tag} label={tag} />
                ))}
              </View>
            ) : null}
          </PRISMSection>
          <View style={styles.actions}>
            <PRISMButton
              label="Edit"
              variant="secondary"
              onPress={() => router.push(`/journey/journal/${id}/edit`)}
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
        title="Delete this entry?"
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  date: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
    marginBottom: spacing.xs,
  },
  mood: {
    fontSize: type.bodyM.fontSize,
    lineHeight: type.bodyM.lineHeight,
    marginBottom: spacing.md,
  },
  body: {
    fontSize: type.bodyL.fontSize,
    lineHeight: type.bodyL.lineHeight,
    marginBottom: spacing.md,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
});
