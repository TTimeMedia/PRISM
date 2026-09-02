import React from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { PRISMHeader, PRISMIconButton, useTheme, useToast } from '@prism/ui';
import type { MilestoneCreateInput } from '@prism/validation';
import { useCreateMilestone } from '../../../lib/journey/mutations';
import { MilestoneForm } from '../components/MilestoneForm';

/** Screen 45 — Add Milestone. */
export function AddMilestoneScreen() {
  const theme = useTheme();
  const createMilestone = useCreateMilestone();
  const { showToast } = useToast();

  const submit = async (values: MilestoneCreateInput) => {
    try {
      await createMilestone.mutateAsync(values);
      showToast('Saved to your journey.', 'success');
      router.back();
    } catch {
      showToast("Couldn't save this milestone. Please try again.", 'error');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <PRISMHeader
        title="Add a milestone."
        leading={
          <PRISMIconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.text.primary} />
          </PRISMIconButton>
        }
      />
      <MilestoneForm
        submitLabel="Save milestone"
        submitting={createMilestone.isPending}
        onSubmit={submit}
      />
    </View>
  );
}
