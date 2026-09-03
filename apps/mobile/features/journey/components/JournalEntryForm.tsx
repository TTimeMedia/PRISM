import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { journalEntryCreateSchema, type JournalEntryCreateInput } from '@prism/validation';
import { PRISMButton, PRISMDateInput, PRISMInput, PRISMTextArea, spacing } from '@prism/ui';
import { TagInput } from './TagInput';

export interface JournalEntryFormProps {
  defaultValues?: Partial<JournalEntryCreateInput>;
  submitLabel: string;
  submitting?: boolean;
  /** From modules.journal.configuration.mood_tracking_enabled — Screen 57. */
  showMood?: boolean;
  onSubmit: (values: JournalEntryCreateInput) => void;
}

/**
 * Shared fields for New Journal Entry (Screen 48) and its Edit
 * counterpart. No Photo field — the canonical `journal_entries` schema
 * (docs/MASTER_BUILD_SPEC.md §09) has no column for one; see
 * docs/DECISIONS.md § JOURNEY. Mood is free text, not a chip-select
 * mood-tracker — docs/DESIGN_SYSTEM.md §14 explicitly warns against
 * "clinical mood trackers... aggressive mood charts."
 */
export function JournalEntryForm({
  defaultValues,
  submitLabel,
  submitting = false,
  showMood = true,
  onSubmit,
}: JournalEntryFormProps) {
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
    <ScrollView contentContainerStyle={styles.content}>
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
            <PRISMInput
              label="Mood"
              value={field.value ?? ''}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
            />
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
      <View style={styles.submit}>
        <PRISMButton label={submitLabel} onPress={handleSubmit(onSubmit)} loading={submitting} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  submit: {
    marginTop: spacing.md,
  },
});
