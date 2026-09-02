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
import type { MedicationCreateInput } from '@prism/validation';
import { useMedication } from '../../../lib/care/queries';
import { useUpdateMedication } from '../../../lib/care/mutations';
import { MedicationForm } from '../components/MedicationForm';

/** Screen 27 — Edit Medication. Same fields as Add; editing must never rewrite historical logs (logs live in their own table). */
export function EditMedicationScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: medication, isLoading, isError, refetch } = useMedication(id);
  const updateMedication = useUpdateMedication(id);
  const { showToast } = useToast();

  const submit = async (values: MedicationCreateInput) => {
    try {
      await updateMedication.mutateAsync(values);
      router.back();
    } catch {
      showToast("Couldn't save your changes. Please try again.", 'error');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <PRISMHeader
        title="Edit medication."
        leading={
          <PRISMIconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.text.primary} />
          </PRISMIconButton>
        }
      />
      {isLoading ? (
        <PRISMSkeleton height={56} />
      ) : isError || !medication ? (
        <PRISMErrorState onRetry={() => refetch()} />
      ) : (
        <MedicationForm
          defaultValues={{
            name: medication.name,
            form: medication.form,
            dosage_text: medication.dosage_text ?? '',
            frequency_type: medication.frequency_type,
            frequency_config: medication.frequency_config,
            start_date: medication.start_date,
            end_date: medication.end_date,
            reminder_enabled: medication.reminder_enabled,
            notes: medication.notes ?? '',
          }}
          submitLabel="Save changes"
          submitting={updateMedication.isPending}
          onSubmit={submit}
        />
      )}
    </View>
  );
}
