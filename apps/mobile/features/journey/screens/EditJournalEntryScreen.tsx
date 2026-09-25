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
import {
  removeEntryImage,
  uploadEntryImage,
  type EntryImageChange,
} from '../../../lib/journey/entryImage';
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

  const submit = async (values: JournalEntryCreateInput, image: EntryImageChange) => {
    // undefined = photo unchanged; string = replaced; null = removed.
    let newPath: string | null | undefined;
    let uploadedPath: string | null = null;
    try {
      if (image.asset && session?.user.id) {
        setUploading(true);
        uploadedPath = await uploadEntryImage(session.user.id, image.asset, 'journal');
        newPath = uploadedPath;
      } else if (image.removed) {
        newPath = null;
      }
      await updateJournalEntry.mutateAsync(
        newPath === undefined ? values : { ...values, image_path: newPath },
      );
      if (newPath !== undefined) await removeEntryImage(entry?.image_path);
      router.back();
    } catch {
      await removeEntryImage(uploadedPath);
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
          existingImagePath={entry.image_path}
          submitLabel="Save changes"
          submitting={updateJournalEntry.isPending || uploading}
          showMood={showMood}
          onSubmit={submit}
        />
      )}
    </View>
  );
}
