import React from 'react';
import { router } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';
import { ArrowLeft, Plus } from 'lucide-react-native';
import {
  PRIZMEmptyState,
  PRIZMErrorState,
  PRIZMHeader,
  PRIZMIconButton,
  PRIZMListItem,
  PRIZMSkeleton,
  spacing,
  useTheme,
} from '@prizm/ui';
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
      <PRIZMHeader
        title="Journal"
        leading={
          <PRIZMIconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.text.primary} />
          </PRIZMIconButton>
        }
        trailing={
          <PRIZMIconButton
            accessibilityLabel="Write something"
            onPress={() => router.push('/journey/journal/add')}
          >
            <Plus size={22} color={theme.colors.text.primary} />
          </PRIZMIconButton>
        }
      />
      {isLoading ? (
        <View style={styles.content}>
          <View style={styles.skeletons}>
            <PRIZMSkeleton height={72} />
            <PRIZMSkeleton height={72} />
          </View>
        </View>
      ) : isError ? (
        <View style={styles.content}>
          <PRIZMErrorState onRetry={() => refetch()} />
        </View>
      ) : (entries ?? []).length === 0 ? (
        <View style={styles.content}>
          <PRIZMEmptyState
            title="Nothing written yet."
            subtitle="Write whenever you have something to say."
            action={{
              label: 'Write something',
              onPress: () => router.push('/journey/journal/add'),
            }}
          />
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(entry) => entry.id}
          contentContainerStyle={styles.content}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item: entry }) => (
            <PRIZMListItem
              title={entry.title?.trim() || formatDate(entry.date)}
              subtitle={journalPreview(entry)}
              onPress={() => router.push(`/journey/journal/${entry.id}`)}
            />
          )}
        />
      )}
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
  separator: {
    height: spacing.xs,
  },
});
