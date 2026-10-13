import React, { useState } from 'react';
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
import type { MilestoneCreateInput } from '@prizm/validation';
import { useSession } from '../../../lib/auth/AuthProvider';
import { useMilestone } from '../../../lib/journey/queries';
import { useUpdateMilestone } from '../../../lib/journey/mutations';
import { saveWithPhotos, type EntryPhotoChange } from '../../../lib/journey/entryImage';
import { entryPhotos } from '../../../lib/journey/entryPhotos';
import { MilestoneForm } from '../components/MilestoneForm';

/** Edit Milestone — same fields as Add, per docs/SCREEN_BIBLE.md Screen 46's Edit action. */
export function EditMilestoneScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: milestone, isLoading, isError, refetch } = useMilestone(id);
  const updateMilestone = useUpdateMilestone(id);
  const { session } = useSession();
  const { showToast } = useToast();
  const [uploading, setUploading] = useState(false);

  const submit = async (values: MilestoneCreateInput, photos: EntryPhotoChange) => {
    setUploading(true);
    try {
      await saveWithPhotos({
        userId: session?.user.id,
        folder: 'milestones',
        change: photos,
        previous: milestone ? entryPhotos(milestone) : [],
        save: (columns) => updateMilestone.mutateAsync({ ...values, ...columns }),
      });
      router.back();
    } catch {
      showToast("Couldn't save your changes. Please try again.", 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <PRIZMHeader
        title="Edit milestone."
        leading={
          <PRIZMIconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.text.primary} />
          </PRIZMIconButton>
        }
      />
      {isLoading ? (
        <PRIZMSkeleton height={56} />
      ) : isError || !milestone ? (
        <PRIZMErrorState onRetry={() => refetch()} />
      ) : (
        <MilestoneForm
          defaultValues={{
            title: milestone.title,
            description: milestone.description ?? '',
            date: milestone.date,
            category: milestone.category,
            icon: milestone.icon ?? 'sparkles',
          }}
          existingImagePaths={entryPhotos(milestone)}
          submitLabel="Save changes"
          submitting={updateMilestone.isPending || uploading}
          onSubmit={submit}
        />
      )}
    </View>
  );
}
