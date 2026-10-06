import React, { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { PRISMHeader, PRISMIconButton, useTheme, useToast } from '@prism/ui';
import type { JournalEntryCreateInput } from '@prism/validation';
import { useSession } from '../../../lib/auth/AuthProvider';
import { useModules } from '../../../lib/profile/queries';
import { useCreateJournalEntry } from '../../../lib/journey/mutations';
import { saveWithPhotos, type EntryPhotoChange } from '../../../lib/journey/entryImage';
import { JournalEntryForm } from '../components/JournalEntryForm';

/** Screen 48 — New Journal Entry. */
export function NewJournalEntryScreen() {
  const theme = useTheme();
  const createJournalEntry = useCreateJournalEntry();
  // Tapping a mood on the Journey screen starts an entry with it already filled in.
  const { mood } = useLocalSearchParams<{ mood?: string }>();
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
        previous: [],
        save: (columns) => createJournalEntry.mutateAsync({ ...values, ...columns }),
      });
      router.back();
    } catch {
      showToast("Couldn't save this entry. Please try again.", 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <PRISMHeader
        title="Write something."
        leading={
          <PRISMIconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.text.primary} />
          </PRISMIconButton>
        }
      />
      <JournalEntryForm
        submitLabel="Save entry"
        submitting={createJournalEntry.isPending || uploading}
        showMood={showMood}
        defaultValues={mood ? { mood } : undefined}
        onSubmit={submit}
      />
    </View>
  );
}
