import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { milestoneCreateSchema, type MilestoneCreateInput } from '@prism/validation';
import {
  PRISMButton,
  PRISMChip,
  PRISMDateInput,
  PRISMInput,
  PRISMTextArea,
  spacing,
} from '@prism/ui';
import { SUGGESTED_MILESTONE_TITLES } from '../optionLabels';
import { MILESTONE_ICON_OPTIONS } from '../milestoneIcons';

export interface MilestoneFormProps {
  defaultValues?: Partial<MilestoneCreateInput>;
  submitLabel: string;
  submitting?: boolean;
  onSubmit: (values: MilestoneCreateInput) => void;
}

/**
 * Shared fields for Add Milestone (Screen 45) and its Edit counterpart —
 * same fields, per the pattern already established for CARE's
 * Add/Edit-share-a-form screens. Suggested titles are always paired with
 * "Create your own" (a plain text field) — see docs/SCREEN_BIBLE.md
 * Screen 45.
 */
export function MilestoneForm({
  defaultValues,
  submitLabel,
  submitting = false,
  onSubmit,
}: MilestoneFormProps) {
  const { control, handleSubmit, setValue } = useForm<MilestoneCreateInput>({
    resolver: zodResolver(milestoneCreateSchema),
    defaultValues: {
      title: '',
      description: '',
      date: '',
      category: null,
      icon: 'sparkles',
      ...defaultValues,
    },
  });

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.suggested}>
        {SUGGESTED_MILESTONE_TITLES.map((suggestion) => (
          <PRISMChip
            key={suggestion}
            label={suggestion}
            onPress={() => setValue('title', suggestion, { shouldValidate: true })}
          />
        ))}
      </View>
      <Controller
        control={control}
        name="title"
        render={({ field, fieldState }) => (
          <PRISMInput
            label="Title"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="description"
        render={({ field }) => (
          <PRISMTextArea
            label="Description"
            value={field.value ?? ''}
            onChangeText={field.onChange}
          />
        )}
      />
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
        name="category"
        render={({ field }) => (
          <PRISMInput
            label="Category"
            value={field.value ?? ''}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />
      <Controller
        control={control}
        name="icon"
        render={({ field }) => (
          <View style={styles.iconField}>
            {MILESTONE_ICON_OPTIONS.map((option) => (
              <PRISMChip
                key={option.value}
                label={option.label}
                selected={field.value === option.value}
                onPress={() => field.onChange(option.value)}
              />
            ))}
          </View>
        )}
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
  suggested: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  iconField: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  submit: {
    marginTop: spacing.md,
  },
});
