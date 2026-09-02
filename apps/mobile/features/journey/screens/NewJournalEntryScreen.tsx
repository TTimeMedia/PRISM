import React from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { PRISMHeader, PRISMIconButton, useTheme, useToast } from '@prism/ui';
import type { JournalEntryCreateInput } from '@prism/validation';
import { useCreateJournalEntry } from '../../../lib/journey/mutations';
import { JournalEntryForm } from '../components/JournalEntryForm';

/** Screen 48 — New Journal Entry. */
export function NewJournalEntryScreen() {
  const theme = useTheme();
  const createJournalEntry = useCreateJournalEntry();
  const { showToast } = useToast();

  const submit = async (values: JournalEntryCreateInput) => {
    try {
      await createJournalEntry.mutateAsync(values);
      router.back();
    } catch {
      showToast("Couldn't save this entry. Please try again.", 'error');
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
        submitting={createJournalEntry.isPending}
        onSubmit={submit}
      />
    </View>
  );
}
