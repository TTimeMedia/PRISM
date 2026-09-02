import React from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { PRISMHeader, PRISMIconButton, useTheme, useToast } from '@prism/ui';
import { useCreateAppointment } from '../../../lib/care/mutations';
import { AppointmentForm, type AppointmentFormSubmitValues } from '../components/AppointmentForm';

/** Screen 32 — Add Appointment. */
export function AddAppointmentScreen() {
  const theme = useTheme();
  const createAppointment = useCreateAppointment();
  const { showToast } = useToast();

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
      <AppointmentForm
        submitLabel="Save appointment"
        submitting={createAppointment.isPending}
        onSubmit={submit}
      />
    </View>
  );
}
