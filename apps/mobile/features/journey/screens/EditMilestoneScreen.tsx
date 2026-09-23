import React, { useState } from 'react';
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
import { useSession } from '../../../lib/auth/AuthProvider';
import { useMilestone } from '../../../lib/journey/queries';
import { useUpdateMilestone } from '../../../lib/journey/mutations';
import { removeMilestoneImage, uploadMilestoneImage } from '../../../lib/journey/milestoneImage';
import { MilestoneForm, type MilestoneImageChange } from '../components/MilestoneForm';

/** Edit Milestone — same fields as Add, per docs/SCREEN_BIBLE.md Screen 46's Edit action. */
export function EditMilestoneScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: milestone, isLoading, isError, refetch } = useMilestone(id);
  const updateMilestone = useUpdateMilestone(id);
  const { session } = useSession();
  const { showToast } = useToast();
  const [uploading, setUploading] = useState(false);

  const submit = async (values: MilestoneCreateInput, image: MilestoneImageChange) => {
    // undefined = photo unchanged; string = replaced; null = removed.
    let newPath: string | null | undefined;
    let uploadedPath: string | null = null;
    try {
      if (image.asset && session?.user.id) {
        setUploading(true);
        uploadedPath = await uploadMilestoneImage(session.user.id, image.asset);
        newPath = uploadedPath;
      } else if (image.removed) {
        newPath = null;
      }
      await updateMilestone.mutateAsync(
        newPath === undefined ? values : { ...values, image_path: newPath },
      );
      if (newPath !== undefined) await removeMilestoneImage(milestone?.image_path);
      router.back();
    } catch {
      await removeMilestoneImage(uploadedPath);
      showToast("Couldn't save your changes. Please try again.", 'error');
    } finally {
      setUploading(false);
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
          existingImagePath={milestone.image_path}
          submitLabel="Save changes"
          submitting={updateMilestone.isPending || uploading}
          onSubmit={submit}
        />
      )}
    </View>
  );
}
