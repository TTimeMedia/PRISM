import React, { useState } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { PRISMHeader, PRISMIconButton, useTheme, useToast } from '@prism/ui';
import type { MilestoneCreateInput } from '@prism/validation';
import { useSession } from '../../../lib/auth/AuthProvider';
import { useCreateMilestone } from '../../../lib/journey/mutations';
import {
  removeEntryImage,
  uploadEntryImage,
  type EntryImageChange,
} from '../../../lib/journey/entryImage';
import { MilestoneForm } from '../components/MilestoneForm';

/** Screen 45 — Add Milestone. */
export function AddMilestoneScreen() {
  const theme = useTheme();
  const createMilestone = useCreateMilestone();
  const { session } = useSession();
  const { showToast } = useToast();
  const [uploading, setUploading] = useState(false);

  const submit = async (values: MilestoneCreateInput, image: EntryImageChange) => {
    let imagePath: string | null = null;
    try {
      if (image.asset && session?.user.id) {
        setUploading(true);
        imagePath = await uploadEntryImage(session.user.id, image.asset, 'milestones');
      }
      await createMilestone.mutateAsync({ ...values, image_path: imagePath });
      showToast('Saved to your journey.', 'success');
      router.back();
    } catch {
      await removeEntryImage(imagePath);
      showToast("Couldn't save this milestone. Please try again.", 'error');
    } finally {
      setUploading(false);
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
        submitting={createMilestone.isPending || uploading}
        onSubmit={submit}
      />
    </View>
  );
}
