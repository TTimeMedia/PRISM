import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import {
  PRISMErrorState,
  PRISMHeader,
  PRISMIconButton,
  PRISMSkeleton,
  useTheme,
  useToast,
} from '@prism/ui';
import type { JournalEntryCreateInput } from '@prism/validation';
import { useJournalEntry } from '../../../lib/journey/queries';
import { useUpdateJournalEntry } from '../../../lib/journey/mutations';
import { JournalEntryForm } from '../components/JournalEntryForm';

/** Edit Journal Entry — same fields as New, per docs/SCREEN_BIBLE.md Screen 49's Edit action. */
export function EditJournalEntryScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: entry, isLoading, isError, refetch } = useJournalEntry(id);
  const updateJournalEntry = useUpdateJournalEntry(id);
  const { showToast } = useToast();

  const submit = async (values: JournalEntryCreateInput) => {
    try {
      await updateJournalEntry.mutateAsync(values);
      router.back();
    } catch {
      showToast("Couldn't save your changes. Please try again.", 'error');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <PRISMHeader
        title="Edit entry."
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
        <JournalEntryForm
          defaultValues={{
            title: entry.title ?? '',
            content: entry.content,
            mood: entry.mood ?? '',
            date: entry.date,
            tags: entry.tags,
          }}
          submitLabel="Save changes"
          submitting={updateJournalEntry.isPending}
          onSubmit={submit}
        />
      )}
    </View>
  );
}
