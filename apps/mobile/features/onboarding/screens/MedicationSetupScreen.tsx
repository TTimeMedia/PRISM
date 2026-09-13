import React, { useState } from 'react';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FREQUENCY_TYPES, MEDICATION_FORMS, getNextOnboardingStep } from '@prism/types';
import { medicationCreateSchema, type MedicationCreateInput } from '@prism/validation';
import { PRISMDateInput, PRISMInput, PRISMSwitch, spacing } from '@prism/ui';
import { StyleSheet, View } from 'react-native';
import { OnboardingScreenLayout } from '../components/OnboardingScreenLayout';
import { ChipSelect } from '../components/ChipSelect';
import { onboardingStepHref } from '../../../lib/onboarding/routes';
import { careSetupSignalFromModules } from '../../../lib/onboarding/careSetupSignal';
import { useModules, useProfile, useUpdateProfile } from '../../../lib/profile/queries';
import { useCreateMedication } from '../../../lib/care/mutations';

const FORM_OPTIONS = MEDICATION_FORMS.map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));
const FREQUENCY_OPTIONS = FREQUENCY_TYPES.map((value) => ({
  value,
  label: value.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase()),
}));

/**
 * Screen 13 — Medication Setup. Only shown when Care Setup implied
 * medication tracking. "Save medication" creates a real record (Rule C);
 * frequency_config's full recurrence builder is CARE-milestone work — see
 * docs/DECISIONS.md — so only frequency_type is collected here.
 */
export function MedicationSetupScreen() {
  const { data: profile } = useProfile();
  const { data: modules } = useModules();
  const updateProfile = useUpdateProfile();
  const createMedication = useCreateMedication();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting: isFormSubmitting },
  } = useForm<MedicationCreateInput>({
    resolver: zodResolver(medicationCreateSchema),
    defaultValues: {
      name: '',
      form: null,
      dosage_text: '',
      frequency_type: null,
      start_date: null,
      reminder_enabled: false,
      notes: '',
    },
  });

  const goNext = async () => {
    const careSetup = careSetupSignalFromModules(modules);
    const next = getNextOnboardingStep('medication_setup', { careSetup, intent: profile?.intent });
    await updateProfile.mutateAsync({ onboarding_step: next });
    router.replace(onboardingStepHref(next));
  };

  const submit = async (values: MedicationCreateInput) => {
    setIsSubmitting(true);
    await createMedication.mutateAsync(values);
    await goNext();
    setIsSubmitting(false);
  };

  const skip = async () => {
    setIsSubmitting(true);
    await goNext();
    setIsSubmitting(false);
  };

  return (
    <OnboardingScreenLayout
      title="Add a medication."
      primaryLabel="Save medication"
      onPrimaryPress={handleSubmit(submit)}
      primaryLoading={isSubmitting || isFormSubmitting}
      onSkip={skip}
      skipLabel="I'll do this later"
    >
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
      <View style={styles.field}>
        <Controller
          control={control}
          name="form"
          render={({ field }) => (
            <ChipSelect
              options={FORM_OPTIONS}
              selected={field.value ? [field.value] : []}
              onChange={(next) => field.onChange(next[0] ?? null)}
              multiple={false}
            />
          )}
        />
      </View>
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
      <View style={styles.field}>
        <Controller
          control={control}
          name="frequency_type"
          render={({ field }) => (
            <ChipSelect
              options={FREQUENCY_OPTIONS}
              selected={field.value ? [field.value] : []}
              onChange={(next) => field.onChange(next[0] ?? null)}
              multiple={false}
            />
          )}
        />
      </View>
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
    </OnboardingScreenLayout>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: spacing.md,
  },
});
