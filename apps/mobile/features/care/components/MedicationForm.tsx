import React from 'react';
import { StyleSheet, View } from 'react-native';
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
import { ListPickerField } from '../../../components/ListPickerField';
import { MEDICATION_OPTIONS } from '../../../lib/pickerOptions';
import { KeyboardAwareScreen } from '../../../components/KeyboardAwareScreen';
import { ChipField } from './ChipField';
import { MedicationScheduleFields } from './MedicationScheduleFields';
import { scheduleProblem, withScheduleDefaults } from '../medicationSchedule';
import { MEDICATION_FORM_OPTIONS } from '../optionLabels';

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
  const { control, handleSubmit, setError } = useForm<MedicationCreateInput>({
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
  const submitChecked = (values: MedicationCreateInput) => {
    const problem = scheduleProblem(values);
    if (problem) {
      setError(problem.path, { type: 'validate', message: problem.message });
      return;
    }
    onSubmit(withScheduleDefaults(values));
  };

  return (
    <KeyboardAwareScreen>
      <View style={styles.content}>
        <Controller
          control={control}
          name="name"
          render={({ field, fieldState }) => (
            <ListPickerField
              label="Medication name"
              value={field.value}
              onChange={field.onChange}
              options={MEDICATION_OPTIONS}
              placeholder="Choose or search"
              searchable
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
        <MedicationScheduleFields control={control} />
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
          <PRISMButton
            label={submitLabel}
            onPress={handleSubmit(submitChecked)}
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
  submit: {
    marginTop: spacing.md,
  },
});
