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
import { useJournalEntries } from '../../../lib/journey/queries';

/**
 * Screen 47 — Journal. Content previews are computed client-side from
 * data already fetched for the user — journal content is never sent
 * anywhere else (no analytics integration exists in this build; see
 * docs/SECURITY.md).
 */
export function JournalScreen() {
  const theme = useTheme();
  const { data: entries, isLoading, isError, refetch } = useJournalEntries();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PRISMHeader
        title="Journal"
        leading={
          <PRISMIconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.text.primary} />
          </PRISMIconButton>
        }
        trailing={
          <PRISMIconButton
            accessibilityLabel="Write something"
            onPress={() => router.push('/journey/journal/add')}
          >
            <Plus size={22} color={theme.colors.text.primary} />
          </PRISMIconButton>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        {isLoading ? (
          <View style={styles.skeletons}>
            <PRISMSkeleton height={72} />
            <PRISMSkeleton height={72} />
          </View>
        ) : isError ? (
          <PRISMErrorState onRetry={() => refetch()} />
        ) : (entries ?? []).length === 0 ? (
          <PRISMEmptyState
            title="Nothing written yet."
            subtitle="Write whenever you have something to say."
            action={{
              label: 'Write something',
              onPress: () => router.push('/journey/journal/add'),
            }}
          />
        ) : (
          <View style={styles.list}>
            {(entries ?? []).map((entry) => (
              <PRISMListItem
                key={entry.id}
                title={entry.title?.trim() || formatDate(entry.date)}
                subtitle={journalPreview(entry)}
                onPress={() => router.push(`/journey/journal/${entry.id}`)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function journalPreview(entry: { content: string; mood: string | null }): string {
  const preview = entry.content.trim().slice(0, 100);
  const truncated = entry.content.trim().length > 100 ? `${preview}…` : preview;
  return entry.mood ? `${entry.mood} · ${truncated}` : truncated;
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
  skeletons: {
    gap: spacing.sm,
  },
  list: {
    gap: spacing.xs,
  },
});
