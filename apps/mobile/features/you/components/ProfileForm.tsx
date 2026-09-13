import React, { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserRound } from 'lucide-react-native';
import { profileUpdateSchema, type ProfileUpdateInput } from '@prism/validation';
import { PRISMButton, PRISMDateInput, PRISMInput, spacing, useTheme, useToast } from '@prism/ui';
import { useSession } from '../../../lib/auth/AuthProvider';
import { pickProfilePhoto, uploadProfilePhoto } from '../../../lib/you/profilePhoto';
import { useSignedProfilePhotoUrl } from '../../../lib/you/useSignedProfilePhotoUrl';

export interface ProfileFormProps {
  defaultValues: ProfileUpdateInput;
  submitting?: boolean;
  onSubmit: (values: ProfileUpdateInput) => void;
}

/** Screen 55 — Edit Profile fields, including the real profile-photo upload (see lib/you/profilePhoto.ts). */
export function ProfileForm({ defaultValues, submitting = false, onSubmit }: ProfileFormProps) {
  const theme = useTheme();
  const { session } = useSession();
  const { showToast } = useToast();
  const { data: existingPhotoUrl } = useSignedProfilePhotoUrl(defaultValues.profile_photo_url);
  const [uploading, setUploading] = useState(false);
  const [localPhotoUri, setLocalPhotoUri] = useState<string | null>(null);

  const { control, handleSubmit, setValue } = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues,
  });

  const changePhoto = async () => {
    if (!session?.user.id) return;
    const asset = await pickProfilePhoto();
    if (!asset) return;
    setLocalPhotoUri(asset.uri);
    setUploading(true);
    try {
      const path = await uploadProfilePhoto(session.user.id, asset);
      setValue('profile_photo_url', path, { shouldDirty: true });
    } catch {
      setLocalPhotoUri(null);
      showToast("Couldn't upload that photo. Please try again.", 'error');
    } finally {
      setUploading(false);
    }
  };

  const displayedPhoto = localPhotoUri ?? existingPhotoUrl;

  return (
    <View>
      <View style={styles.avatarRow}>
        <View style={[styles.avatar, { backgroundColor: theme.colors.surfaceElevated }]}>
          {displayedPhoto ? (
            <Image source={{ uri: displayedPhoto }} style={styles.avatarImage} />
          ) : (
            <UserRound size={32} color={theme.colors.text.tertiary} />
          )}
        </View>
        <PRISMButton
          label="Change photo"
          variant="tertiary"
          loading={uploading}
          onPress={changePhoto}
        />
      </View>
      <Controller
        control={control}
        name="display_name"
        render={({ field }) => (
          <PRISMInput
            label="Name"
            value={field.value ?? ''}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />
      <Controller
        control={control}
        name="pronouns"
        render={({ field }) => (
          <PRISMInput
            label="Pronouns"
            value={field.value ?? ''}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />
      <Controller
        control={control}
        name="gender"
        render={({ field }) => (
          <PRISMInput
            label="Gender"
            value={field.value ?? ''}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />
      <Controller
        control={control}
        name="birthday"
        render={({ field, fieldState }) => (
          <PRISMDateInput
            label="Birthday"
            value={field.value ?? ''}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="journey_start_date"
        render={({ field, fieldState }) => (
          <PRISMDateInput
            label="Journey start date"
            value={field.value ?? ''}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />
      <View style={styles.submit}>
        <PRISMButton label="Save changes" onPress={handleSubmit(onSubmit)} loading={submitting} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarRow: {
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 88,
    height: 88,
  },
  submit: {
    marginTop: spacing.md,
  },
});
