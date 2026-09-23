import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { ImagePickerAsset } from 'expo-image-picker';
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
  useToast,
} from '@prism/ui';
import { KeyboardAwareScreen } from '../../../components/KeyboardAwareScreen';
import { SUGGESTED_MILESTONE_TITLES } from '../optionLabels';
import { MILESTONE_ICON_OPTIONS } from '../milestoneIcons';
import { pickEntryImage, type EntryImageChange } from '../../../lib/journey/entryImage';
import { EntryPhotoField } from './EntryPhotoField';

export interface MilestoneFormProps {
  defaultValues?: Partial<MilestoneCreateInput>;
  /** The photo already saved on the milestone being edited, if any. */
  existingImagePath?: string | null;
  submitLabel: string;
  submitting?: boolean;
  onSubmit: (values: MilestoneCreateInput, image: EntryImageChange) => void;
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
  existingImagePath,
  submitLabel,
  submitting = false,
  onSubmit,
}: MilestoneFormProps) {
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
    <KeyboardAwareScreen>
      <View style={styles.content}>
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
