import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { ImagePickerAsset } from 'expo-image-picker';
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
  useToast,
} from '@prism/ui';
import { KeyboardAwareScreen } from '../../../components/KeyboardAwareScreen';
import { TagInput } from './TagInput';
import { SUGGESTED_JOURNAL_MOODS } from '../optionLabels';
import { pickEntryImage, type EntryImageChange } from '../../../lib/journey/entryImage';
import { EntryPhotoField } from './EntryPhotoField';

export interface JournalEntryFormProps {
  defaultValues?: Partial<JournalEntryCreateInput>;
  /** The photo already saved on the entry being edited, if any. */
  existingImagePath?: string | null;
  submitLabel: string;
  submitting?: boolean;
  /** From modules.journal.configuration.mood_tracking_enabled — Screen 57. */
  showMood?: boolean;
  onSubmit: (values: JournalEntryCreateInput, image: EntryImageChange) => void;
}

/**
 * Shared fields for New Journal Entry (Screen 48) and its Edit
 * counterpart. No Photo field — the canonical `journal_entries` schema
 * (docs/MASTER_BUILD_SPEC.md §09) has no column for one; see
 * docs/DECISIONS.md § JOURNEY (photos were later added as an image_path
 * column — see lib/journey/entryImage.ts). Mood stays a free-text field, not a
 * rating scale — docs/DESIGN_SYSTEM.md §17 explicitly warns against
 * "clinical mood trackers... aggressive mood charts" and requires mood
 * to "never be a forced rating." The suggested-mood chips below are
 * optional tap-to-fill shortcuts into that same free-text field, not a
 * replacement for it.
 */
export function JournalEntryForm({
  defaultValues,
  existingImagePath,
  submitLabel,
  submitting = false,
  showMood = true,
  onSubmit,
}: JournalEntryFormProps) {
  const { showToast } = useToast();
  const [pendingAsset, setPendingAsset] = useState<ImagePickerAsset | null>(null);
  const [removed, setRemoved] = useState(false);

  const pickPhoto = async () => {
    try {
      const result = await pickEntryImage();
      if (result.status === 'picked') {
        setPendingAsset(result.asset);
        setRemoved(false);
      } else if (result.status === 'denied') {
        showToast('Allow photo access in Settings to add a photo.', 'error');
      }
    } catch {
      showToast("Couldn't open your photos. Please try again.", 'error');
    }
  };

  const removePhoto = () => {
    setPendingAsset(null);
    setRemoved(true);
  };

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
        <EntryPhotoField
          existingPath={existingImagePath}
          pendingUri={pendingAsset?.uri ?? null}
          removed={removed}
          onPick={pickPhoto}
          onRemove={removePhoto}
        />
        <View style={styles.submit}>
          <PRISMButton
            label={submitLabel}
            onPress={handleSubmit((values) => onSubmit(values, { asset: pendingAsset, removed }))}
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
