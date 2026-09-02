import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { medicationCreateSchema, type MedicationCreateInput } from '@prism/validation';
import {
  PRISMButton,
  PRISMDateInput,
  PRISMInput,
  PRISMSwitch,
  PRISMTextArea,
  spacing,
} from '@prism/ui';
import { ChipField } from './ChipField';
import { DaysOfWeekSelect } from './DaysOfWeekSelect';
import { FREQUENCY_TYPE_OPTIONS, MEDICATION_FORM_OPTIONS } from '../optionLabels';

export interface MedicationFormProps {
  defaultValues?: Partial<MedicationCreateInput>;
  submitLabel: string;
  submitting?: boolean;
  onSubmit: (values: MedicationCreateInput) => void;
}

/** Shared fields for Add Medication (Screen 25) and Edit Medication (Screen 27) — same fields, per spec. */
export function MedicationForm({
  defaultValues,
  submitLabel,
  submitting = false,
  onSubmit,
}: MedicationFormProps) {
  const { control, handleSubmit, watch } = useForm<MedicationCreateInput>({
    resolver: zodResolver(medicationCreateSchema),
    defaultValues: {
      name: '',
      form: null,
      dosage_text: '',
      frequency_type: null,
      frequency_config: null,
      start_date: null,
      end_date: null,
      reminder_enabled: false,
      notes: '',
      ...defaultValues,
    },
  });
  const frequencyType = watch('frequency_type');

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Controller
        control={control}
        name="name"
        render={({ field, fieldState }) => (
          <PRISMInput
            label="Medication name"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="form"
        render={({ field }) => (
          <ChipField
            label="Form"
            options={MEDICATION_FORM_OPTIONS}
            value={field.value ?? null}
            onChange={(v) => field.onChange(v)}
          />
        )}
      />
      <Controller
        control={control}
        name="dosage_text"
        render={({ field }) => (
          <PRISMInput
            label="Dosage"
            value={field.value ?? ''}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />
      <Controller
        control={control}
        name="frequency_type"
        render={({ field }) => (
          <ChipField
            label="Frequency"
            options={FREQUENCY_TYPE_OPTIONS}
            value={field.value ?? null}
            onChange={(v) => field.onChange(v)}
          />
        )}
      />
      {frequencyType === 'weekly' ? (
        <Controller
          control={control}
          name="frequency_config.days_of_week"
          render={({ field }) => (
            <DaysOfWeekSelect value={field.value ?? []} onChange={field.onChange} />
          )}
        />
      ) : null}
      {frequencyType === 'every_x_days' ? (
        <Controller
          control={control}
          name="frequency_config.interval_days"
          render={({ field }) => (
            <PRISMInput
              label="Every how many days"
              keyboardType="number-pad"
              value={field.value ? String(field.value) : ''}
              onChangeText={(text) => field.onChange(text ? Number(text) : undefined)}
              onBlur={field.onBlur}
            />
          )}
        />
      ) : null}
      {frequencyType ? (
        <Controller
          control={control}
          name="frequency_config.time_of_day"
          render={({ field, fieldState }) => (
            <PRISMInput
              label="Time of day"
              placeholder="HH:mm"
              value={field.value ?? ''}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
            />
          )}
        />
      ) : null}
      <Controller
        control={control}
        name="start_date"
        render={({ field, fieldState }) => (
          <PRISMDateInput
            label="Start date"
            value={field.value ?? ''}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="end_date"
        render={({ field, fieldState }) => (
          <PRISMDateInput
            label="End date"
            value={field.value ?? ''}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="reminder_enabled"
        render={({ field }) => (
          <PRISMSwitch label="Remind me" value={field.value} onValueChange={field.onChange} />
        )}
      />
      <Controller
        control={control}
        name="notes"
        render={({ field }) => (
          <PRISMTextArea
            label="Notes"
            value={field.value ?? ''}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
          />
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
  submit: {
    marginTop: spacing.md,
  },
});
