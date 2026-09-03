import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  PRISMButton,
  PRISMDateInput,
  PRISMInput,
  PRISMSwitch,
  PRISMTextArea,
  spacing,
} from '@prism/ui';
import { appointmentFormSchema, type AppointmentFormInput } from '@prism/validation';
import { ChipField } from './ChipField';
import { SUGGESTED_APPOINTMENT_CATEGORY_OPTIONS } from '../optionLabels';
import { toISODateTime } from '../../../lib/care/dateTime';

export type AppointmentFormValues = AppointmentFormInput;

export interface AppointmentFormSubmitValues {
  title: string;
  provider: string | null;
  category: string | null;
  starts_at: string;
  location: string | null;
  notes: string | null;
  reminder_enabled: boolean;
}

export interface AppointmentFormProps {
  defaultValues?: Partial<AppointmentFormValues>;
  submitLabel: string;
  submitting?: boolean;
  onSubmit: (values: AppointmentFormSubmitValues) => void;
}

/** Shared fields for Add Appointment (Screen 32) and Edit Appointment (Screen 34) — same fields, per spec. */
export function AppointmentForm({
  defaultValues,
  submitLabel,
  submitting = false,
  onSubmit,
}: AppointmentFormProps) {
  const { control, handleSubmit } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      title: '',
      provider: '',
      category: null,
      date: '',
      time: '',
      location: '',
      notes: '',
      reminder_enabled: false,
      ...defaultValues,
    },
  });

  const submit = (values: AppointmentFormValues) => {
    onSubmit({
      title: values.title,
      provider: values.provider ?? null,
      category: values.category ?? null,
      starts_at: toISODateTime(values.date, values.time),
      location: values.location ?? null,
      notes: values.notes ?? null,
      reminder_enabled: values.reminder_enabled,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
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
        name="provider"
        render={({ field }) => (
          <PRISMInput
            label="Provider"
            value={field.value ?? ''}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />
      <Controller
        control={control}
        name="category"
        render={({ field }) => (
          <ChipField
            label="Category"
            options={SUGGESTED_APPOINTMENT_CATEGORY_OPTIONS}
            value={field.value ?? null}
            onChange={field.onChange}
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
        name="time"
        render={({ field }) => (
          <PRISMInput
            label="Time"
            placeholder="HH:mm"
            value={field.value ?? ''}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />
      <Controller
        control={control}
        name="location"
        render={({ field }) => (
          <PRISMInput
            label="Location"
            value={field.value ?? ''}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
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
          <PRISMTextArea label="Notes" value={field.value ?? ''} onChangeText={field.onChange} />
        )}
      />
      <View style={styles.submit}>
        <PRISMButton label={submitLabel} onPress={handleSubmit(submit)} loading={submitting} />
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
