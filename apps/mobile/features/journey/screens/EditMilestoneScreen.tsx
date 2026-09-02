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
import type { MilestoneCreateInput } from '@prism/validation';
import { useMilestone } from '../../../lib/journey/queries';
import { useUpdateMilestone } from '../../../lib/journey/mutations';
import { MilestoneForm } from '../components/MilestoneForm';

/** Edit Milestone — same fields as Add, per docs/SCREEN_BIBLE.md Screen 46's Edit action. */
export function EditMilestoneScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: milestone, isLoading, isError, refetch } = useMilestone(id);
  const updateMilestone = useUpdateMilestone(id);
  const { showToast } = useToast();

  const submit = async (values: MilestoneCreateInput) => {
    try {
      await updateMilestone.mutateAsync(values);
      router.back();
    } catch {
      showToast("Couldn't save your changes. Please try again.", 'error');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <PRISMHeader
        title="Edit milestone."
        leading={
          <PRISMIconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.text.primary} />
          </PRISMIconButton>
        }
      />
      {isLoading ? (
        <PRISMSkeleton height={56} />
      ) : isError || !milestone ? (
        <PRISMErrorState onRetry={() => refetch()} />
      ) : (
        <MilestoneForm
          defaultValues={{
            title: milestone.title,
            description: milestone.description ?? '',
            date: milestone.date,
            category: milestone.category,
            icon: milestone.icon ?? 'sparkles',
          }}
          submitLabel="Save changes"
          submitting={updateMilestone.isPending}
          onSubmit={submit}
        />
      )}
    </View>
  );
}
