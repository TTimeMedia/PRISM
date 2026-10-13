import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import {
  PRIZMErrorState,
  PRIZMHeader,
  PRIZMIconButton,
  PRIZMSkeleton,
  useTheme,
  useToast,
} from '@prizm/ui';
import type { MedicationCreateInput } from '@prizm/validation';
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
      <PRIZMHeader
        title="Edit medication."
        leading={
          <PRIZMIconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.text.primary} />
          </PRIZMIconButton>
        }
      />
      {isLoading ? (
        <PRIZMSkeleton height={56} />
      ) : isError || !medication ? (
        <PRIZMErrorState onRetry={() => refetch()} />
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
