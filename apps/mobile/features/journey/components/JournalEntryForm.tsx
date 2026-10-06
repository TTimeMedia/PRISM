import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { journalEntryCreateSchema, type JournalEntryCreateInput } from '@prism/validation';
import {
  PRISMButton,
  PRISMChip,
  PRISMDateInput,
  PRISMInput,
  PRISMTextArea,
  spacing,
} from '@prism/ui';
import { KeyboardAwareScreen } from '../../../components/KeyboardAwareScreen';
import { TagInput } from './TagInput';
import { SUGGESTED_JOURNAL_MOODS } from '../optionLabels';
import type { EntryPhotoChange } from '../../../lib/journey/entryImage';
import { EntryPhotoField } from './EntryPhotoField';
import { useEntryPhotos } from './useEntryPhotos';

export interface JournalEntryFormProps {
  defaultValues?: Partial<JournalEntryCreateInput>;
  /** The photos already saved on the entry being edited, in order. */
  existingImagePaths?: string[];
  submitLabel: string;
  submitting?: boolean;
  /** From modules.journal.configuration.mood_tracking_enabled — Screen 57. */
  showMood?: boolean;
  onSubmit: (values: JournalEntryCreateInput, photos: EntryPhotoChange) => void;
}

/**
 * Shared fields for New Journal Entry (Screen 48) and its Edit
 * counterpart, with up to five photos (lib/journey/entryImage.ts). Mood
 * stays a free-text field, not a
 * rating scale — docs/DESIGN_SYSTEM.md §17 explicitly warns against
 * "clinical mood trackers... aggressive mood charts" and requires mood
 * to "never be a forced rating." The suggested-mood chips below are
 * optional tap-to-fill shortcuts into that same free-text field, not a
 * replacement for it.
 */
export function JournalEntryForm({
  defaultValues,
  existingImagePaths,
  submitLabel,
  submitting = false,
  showMood = true,
  onSubmit,
}: JournalEntryFormProps) {
  const photos = useEntryPhotos(existingImagePaths);

  const { control, handleSubmit } = useForm<JournalEntryCreateInput>({
    resolver: zodResolver(journalEntryCreateSchema),
    defaultValues: {
      title: '',
      content: '',
      mood: '',
      date: new Date().toISOString().slice(0, 10),
      tags: [],
      ...defaultValues,
    },
  });

  return (
    <KeyboardAwareScreen>
      <View style={styles.content}>
        <Controller
          control={control}
          name="title"
          render={({ field }) => (
            <PRISMInput
              label="Title"
              value={field.value ?? ''}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        <Controller
          control={control}
          name="content"
          render={({ field, fieldState }) => (
            <PRISMTextArea
              label="What's on your mind?"
              minLines={10}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
            />
          )}
        />
        {showMood ? (
          <Controller
            control={control}
            name="mood"
            render={({ field }) => (
              <View>
                <View style={styles.chips}>
                  {SUGGESTED_JOURNAL_MOODS.map((mood) => (
                    <PRISMChip
                      key={mood}
                      label={mood}
                      selected={field.value === mood}
                      onPress={() => field.onChange(field.value === mood ? '' : mood)}
                    />
                  ))}
                </View>
                <PRISMInput
                  label="Mood"
                  value={field.value ?? ''}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                />
              </View>
            )}
          />
        ) : null}
        <Controller
          control={control}
          name="date"
          render={({ field, fieldState }) => (
            <PRISMDateInput
              label="Date"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="tags"
          render={({ field }) => <TagInput value={field.value} onChange={field.onChange} />}
        />
        <EntryPhotoField {...photos.field} />
        <View style={styles.submit}>
          <PRISMButton
            label={submitLabel}
            onPress={handleSubmit((values) => onSubmit(values, photos.change))}
            loading={submitting}
          />
        </View>
      </View>
    </KeyboardAwareScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  submit: {
    marginTop: spacing.md,
  },
});
