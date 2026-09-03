import React, { useState } from 'react';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getNextOnboardingStep } from '@prism/types';
import {
  appointmentSetupSchema,
  deriveAppointmentTitle,
  type AppointmentSetupInput,
} from '@prism/validation';
import { PRISMDateInput, PRISMInput, PRISMSwitch } from '@prism/ui';
import { OnboardingScreenLayout } from '../components/OnboardingScreenLayout';
import { onboardingStepHref } from '../../../lib/onboarding/routes';
import { useProfile, useSetModuleEnabled, useUpdateProfile } from '../../../lib/profile/queries';
import { useCreateAppointment } from '../../../lib/care/mutations';

/**
 * Screen 15 — Appointment Setup. Only shown when intent included
 * appointments. All fields optional/skippable — a real appointment is
 * only created if the user provided at least a date; a title is derived
 * from category since this screen never asks for one directly.
 */
export function AppointmentSetupScreen() {
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const setModuleEnabled = useSetModuleEnabled();
  const createAppointment = useCreateAppointment();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting: isFormSubmitting },
  } = useForm<AppointmentSetupInput>({
    resolver: zodResolver(appointmentSetupSchema),
    defaultValues: {
      provider: '',
      category: '',
      date: null,
      time: null,
      location: '',
      reminder_enabled: false,
    },
  });

  const goNext = async () => {
    const next = getNextOnboardingStep('appointment_setup', {
      careSetup: null,
      intent: profile?.intent,
    });
    await updateProfile.mutateAsync({ onboarding_step: next });
    router.replace(onboardingStepHref(next));
  };

  const submit = async (values: AppointmentSetupInput) => {
    setIsSubmitting(true);
    if (values.date) {
      const time = values.time ?? '09:00';
      await Promise.all([
        createAppointment.mutateAsync({
          title: deriveAppointmentTitle(values.category),
          provider: values.provider,
          category: values.category,
          starts_at: `${values.date}T${time}:00Z`,
          location: values.location,
          reminder_enabled: values.reminder_enabled,
        }),
        setModuleEnabled.mutateAsync({ moduleKey: 'appointments', enabled: true }),
      ]);
    }
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
      title="Add an appointment."
      primaryLabel="Continue"
      onPrimaryPress={handleSubmit(submit)}
      primaryLoading={isSubmitting || isFormSubmitting}
      onSkip={skip}
    >
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
          <PRISMInput
            label="Appointment type"
            value={field.value ?? ''}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />
      <Controller
        control={control}
        name="date"
        render={({ field, fieldState }) => (
          <PRISMDateInput
            label="Date"
            value={field.value ?? ''}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="time"
        render={({ field, fieldState }) => (
          <PRISMInput
            label="Time"
            placeholder="HH:mm"
            value={field.value ?? ''}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
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
    </OnboardingScreenLayout>
  );
}
