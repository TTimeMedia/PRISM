import React, { useState } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { PRISMHeader, PRISMIconButton, useTheme, useToast } from '@prism/ui';
import type { JournalEntryCreateInput } from '@prism/validation';
import { useSession } from '../../../lib/auth/AuthProvider';
import { useModules } from '../../../lib/profile/queries';
import { useCreateJournalEntry } from '../../../lib/journey/mutations';
import {
  removeEntryImage,
  uploadEntryImage,
  type EntryImageChange,
} from '../../../lib/journey/entryImage';
import { JournalEntryForm } from '../components/JournalEntryForm';

/** Screen 48 — New Journal Entry. */
export function NewJournalEntryScreen() {
  const theme = useTheme();
  const createJournalEntry = useCreateJournalEntry();
  const { session } = useSession();
  const { showToast } = useToast();
  const [uploading, setUploading] = useState(false);
  const { data: modules } = useModules();
  const journalModule = modules?.find((m) => m.module_key === 'journal');
  const showMood = journalModule?.configuration.mood_tracking_enabled !== false;

  const submit = async (values: JournalEntryCreateInput, image: EntryImageChange) => {
    let imagePath: string | null = null;
    try {
      if (image.asset && session?.user.id) {
        setUploading(true);
        imagePath = await uploadEntryImage(session.user.id, image.asset, 'journal');
      }
      await createJournalEntry.mutateAsync({ ...values, image_path: imagePath });
      router.back();
    } catch {
      await removeEntryImage(imagePath);
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
        onSubmit={submit}
      />
    </View>
  );
}
