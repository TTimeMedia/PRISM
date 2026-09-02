import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import {
  PRISMErrorState,
  PRISMHeader,
  PRISMIconButton,
  PRISMSkeleton,
  useTheme,
  useToast,
} from '@prism/ui';
import { useAppointment } from '../../../lib/care/queries';
import { useUpdateAppointment } from '../../../lib/care/mutations';
import { splitISODateTime } from '../../../lib/care/dateTime';
import { AppointmentForm, type AppointmentFormSubmitValues } from '../components/AppointmentForm';

/** Screen 34 — Edit Appointment. Editable version of Appointment Detail. */
export function EditAppointmentScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: appointment, isLoading, isError, refetch } = useAppointment(id);
  const updateAppointment = useUpdateAppointment(id);
  const { showToast } = useToast();

  const submit = async (values: AppointmentFormSubmitValues) => {
    try {
      await updateAppointment.mutateAsync(values);
      router.back();
    } catch {
      showToast("Couldn't save your changes. Please try again.", 'error');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <PRISMHeader
        title="Edit appointment."
        leading={
          <PRISMIconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.text.primary} />
          </PRISMIconButton>
        }
      />
      {isLoading ? (
        <PRISMSkeleton height={56} />
      ) : isError || !appointment ? (
        <PRISMErrorState onRetry={() => refetch()} />
      ) : (
        <AppointmentForm
          defaultValues={{
            title: appointment.title,
            provider: appointment.provider,
            category: appointment.category,
            ...splitISODateTime(appointment.starts_at),
            location: appointment.location,
            notes: appointment.notes,
            reminder_enabled: appointment.reminder_enabled,
          }}
          submitLabel="Save changes"
          submitting={updateAppointment.isPending}
          onSubmit={submit}
        />
      )}
    </View>
  );
}
