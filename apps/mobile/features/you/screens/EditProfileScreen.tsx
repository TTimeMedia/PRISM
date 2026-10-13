import React from 'react';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import {
  PRIZMErrorState,
  PRIZMHeader,
  PRIZMIconButton,
  PRIZMSkeleton,
  spacing,
  useTheme,
  useToast,
} from '@prizm/ui';
import type { ProfileUpdateInput } from '@prizm/validation';
import { useProfile, useUpdateProfile } from '../../../lib/profile/queries';
import { KeyboardAwareScreen } from '../../../components/KeyboardAwareScreen';
import { ProfileForm } from '../components/ProfileForm';

/** Screen 55 — Edit Profile. Every field is optional; saving updates only what changed. */
export function EditProfileScreen() {
  const theme = useTheme();
  const { data: profile, isLoading, isError, refetch } = useProfile();
  const updateProfile = useUpdateProfile();
  const { showToast } = useToast();

  const submit = async (values: ProfileUpdateInput) => {
    try {
      await updateProfile.mutateAsync(values);
      router.back();
    } catch {
      showToast("Couldn't save your changes. Please try again.", 'error');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PRIZMHeader
        title="Edit profile."
        leading={
          <PRIZMIconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.text.primary} />
          </PRIZMIconButton>
        }
      />
      {isLoading ? (
        <PRIZMSkeleton height={56} />
      ) : isError || !profile ? (
        <PRIZMErrorState onRetry={() => refetch()} />
      ) : (
        <KeyboardAwareScreen>
          <View style={styles.content}>
            <ProfileForm
              defaultValues={{
                display_name: profile.display_name ?? '',
                pronouns: profile.pronouns ?? '',
                gender: profile.gender ?? '',
                // null, not '': an empty date must never block saving.
                birthday: profile.birthday ?? null,
                profile_photo_url: profile.profile_photo_url ?? null,
              }}
              submitting={updateProfile.isPending}
              onSubmit={submit}
            />
          </View>
        </KeyboardAwareScreen>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
