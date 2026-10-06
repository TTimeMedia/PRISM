import React, { useState } from 'react';
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
import { useSession } from '../../../lib/auth/AuthProvider';
import { useModules } from '../../../lib/profile/queries';
import { useJournalEntry } from '../../../lib/journey/queries';
import { useUpdateJournalEntry } from '../../../lib/journey/mutations';
import { saveWithPhotos, type EntryPhotoChange } from '../../../lib/journey/entryImage';
import { entryPhotos } from '../../../lib/journey/entryPhotos';
import { JournalEntryForm } from '../components/JournalEntryForm';

/** Edit Journal Entry — same fields as New, per docs/SCREEN_BIBLE.md Screen 49's Edit action. */
export function EditJournalEntryScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: entry, isLoading, isError, refetch } = useJournalEntry(id);
  const updateJournalEntry = useUpdateJournalEntry(id);
  const { session } = useSession();
  const { showToast } = useToast();
  const [uploading, setUploading] = useState(false);
  const { data: modules } = useModules();
  const journalModule = modules?.find((m) => m.module_key === 'journal');
  const showMood = journalModule?.configuration.mood_tracking_enabled !== false;

  const submit = async (values: JournalEntryCreateInput, photos: EntryPhotoChange) => {
    setUploading(true);
    try {
      await saveWithPhotos({
        userId: session?.user.id,
        folder: 'journal',
        change: photos,
        previous: entry ? entryPhotos(entry) : [],
        save: (columns) => updateJournalEntry.mutateAsync({ ...values, ...columns }),
      });
      router.back();
    } catch {
      showToast("Couldn't save your changes. Please try again.", 'error');
    } finally {
      setUploading(false);
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
          existingImagePaths={entryPhotos(entry)}
          submitLabel="Save changes"
          submitting={updateJournalEntry.isPending || uploading}
          showMood={showMood}
          onSubmit={submit}
        />
      )}
    </View>
  );
}
