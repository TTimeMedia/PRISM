import React from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { PRISMHeader, PRISMIconButton, useTheme, useToast } from '@prism/ui';
import type { MedicationCreateInput } from '@prism/validation';
import { useCreateMedication } from '../../../lib/care/mutations';
import { MedicationForm } from '../components/MedicationForm';

/** Screen 25 — Add Medication. */
export function AddMedicationScreen() {
  const theme = useTheme();
  const createMedication = useCreateMedication();
  const { showToast } = useToast();

  const submit = async (values: MedicationCreateInput) => {
    try {
      await createMedication.mutateAsync(values);
      router.back();
    } catch {
      showToast("Couldn't save this medication. Please try again.", 'error');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <PRISMHeader
        title="Add a medication."
        leading={
          <PRISMIconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.text.primary} />
          </PRISMIconButton>
        }
      />
      <MedicationForm
        submitLabel="Save medication"
        submitting={createMedication.isPending}
        onSubmit={submit}
      />
    </View>
  );
}
