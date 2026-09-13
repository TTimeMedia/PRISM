import React from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { PRISMHeader, PRISMIconButton, PRISMSkeleton, useTheme, useToast } from '@prism/ui';
import { useModules } from '../../../lib/profile/queries';
import { useCreateAppointment } from '../../../lib/care/mutations';
import { AppointmentForm, type AppointmentFormSubmitValues } from '../components/AppointmentForm';

/** Screen 32 — Add Appointment. */
export function AddAppointmentScreen() {
  const theme = useTheme();
  const createAppointment = useCreateAppointment();
  const { showToast } = useToast();
  const { data: modules, isLoading: modulesLoading } = useModules();
  const appointmentsModule = modules?.find((m) => m.module_key === 'appointments');
  const defaultReminderEnabled = Boolean(
    appointmentsModule?.configuration.default_reminder_enabled,
  );

  const submit = async (values: AppointmentFormSubmitValues) => {
    try {
      await createAppointment.mutateAsync(values);
      router.back();
    } catch {
      showToast("Couldn't save this appointment. Please try again.", 'error');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <PRISMHeader
        title="Add an appointment."
        leading={
          <PRISMIconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.text.primary} />
          </PRISMIconButton>
        }
      />
      {modulesLoading ? (
        <PRISMSkeleton height={56} />
      ) : (
        // If useModules() itself failed, defaultReminderEnabled is
        // already false (its own pre-Milestone-06 default) — the form
        // still renders rather than blocking Add Appointment entirely
        // over a non-essential seed-value lookup. See docs/DECISIONS.md § YOU.
        <AppointmentForm
          defaultValues={{ reminder_enabled: defaultReminderEnabled }}
          submitLabel="Save appointment"
          submitting={createAppointment.isPending}
          onSubmit={submit}
        />
      )}
    </View>
  );
}
