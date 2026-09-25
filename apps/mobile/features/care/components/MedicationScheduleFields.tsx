import React from 'react';
import { Controller, useWatch, type Control } from 'react-hook-form';
import type { MedicationCreateInput } from '@prism/validation';
import { PRISMInput, PRISMTimeInput } from '@prism/ui';
import { ChipField } from './ChipField';
import { DaysOfWeekSelect } from './DaysOfWeekSelect';
import { FREQUENCY_TYPE_OPTIONS } from '../optionLabels';

export interface MedicationScheduleFieldsProps {
  control: Control<MedicationCreateInput>;
  /** Heading above the frequency choices. */
  frequencyLabel?: string;
}

/**
 * How often, on which days, and at what time — everything a medication
 * needs for its doses to show up on TODAY and for reminders to be set.
 * Shared by Add/Edit Medication and onboarding's Medication Setup so both
 * collect the same schedule.
 */
export function MedicationScheduleFields({
  control,
  frequencyLabel = 'Frequency',
}: MedicationScheduleFieldsProps) {
  const frequencyType = useWatch({ control, name: 'frequency_type' });

  return (
    <>
      <Controller
        control={control}
        name="frequency_type"
        render={({ field }) => (
          <ChipField
            label={frequencyLabel}
            options={FREQUENCY_TYPE_OPTIONS}
            value={field.value ?? null}
            onChange={(v) => field.onChange(v)}
          />
        )}
      />
      {frequencyType === 'weekly' || frequencyType === 'custom' ? (
        <Controller
          control={control}
          name="frequency_config.days_of_week"
          render={({ field, fieldState }) => (
            <DaysOfWeekSelect
              value={field.value ?? []}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
      ) : null}
      {frequencyType === 'every_x_days' ? (
        <Controller
          control={control}
          name="frequency_config.interval_days"
          render={({ field, fieldState }) => (
            <PRISMInput
              label="Every how many days"
              keyboardType="number-pad"
              value={field.value ? String(field.value) : ''}
              onChangeText={(text) => field.onChange(text ? Number(text) : undefined)}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
            />
          )}
        />
      ) : null}
      {frequencyType ? (
        <Controller
          control={control}
          name="frequency_config.time_of_day"
          render={({ field, fieldState }) => (
            <PRISMTimeInput
              label="Time of day"
              value={field.value ?? ''}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
            />
          )}
        />
      ) : null}
    </>
  );
}
