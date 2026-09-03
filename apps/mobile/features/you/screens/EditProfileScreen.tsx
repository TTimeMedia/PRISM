import React from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import {
  PRISMErrorState,
  PRISMHeader,
  PRISMIconButton,
  PRISMSkeleton,
  spacing,
  useTheme,
  useToast,
} from '@prism/ui';
import type { ProfileUpdateInput } from '@prism/validation';
import { useProfile, useUpdateProfile } from '../../../lib/profile/queries';
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
      <PRISMHeader
        title="Edit profile."
        leading={
          <PRISMIconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.text.primary} />
          </PRISMIconButton>
        }
      />
      {isLoading ? (
        <PRISMSkeleton height={56} />
      ) : isError || !profile ? (
        <PRISMErrorState onRetry={() => refetch()} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <ProfileForm
            defaultValues={{
              display_name: profile.display_name ?? '',
              pronouns: profile.pronouns ?? '',
              gender: profile.gender ?? '',
              birthday: profile.birthday ?? '',
              journey_start_date: profile.journey_start_date ?? '',
              profile_photo_url: profile.profile_photo_url ?? null,
            }}
            submitting={updateProfile.isPending}
            onSubmit={submit}
          />
        </ScrollView>
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
