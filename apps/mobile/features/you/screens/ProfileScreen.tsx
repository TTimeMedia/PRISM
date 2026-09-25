import React from 'react';
import { router } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, UserRound } from 'lucide-react-native';
import {
  PRISMButton,
  PRISMErrorState,
  PRISMHeader,
  PRISMIconButton,
  PRISMSection,
  PRISMSkeleton,
  spacing,
  type,
  useTheme,
} from '@prism/ui';
import { useProfile } from '../../../lib/profile/queries';
import { useSignedProfilePhotoUrl } from '../../../lib/you/useSignedProfilePhotoUrl';

/** Screen 54 — Profile. Every field is optional and shown only as entered. */
export function ProfileScreen() {
  const theme = useTheme();
  const { data: profile, isLoading, isError, refetch } = useProfile();
  const { data: photoUrl } = useSignedProfilePhotoUrl(profile?.profile_photo_url);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PRISMHeader
        title="Profile."
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
          <View style={styles.avatarRow}>
            <View style={[styles.avatar, { backgroundColor: theme.colors.surfaceElevated }]}>
              {photoUrl ? (
                <Image source={{ uri: photoUrl }} style={styles.avatarImage} />
              ) : (
                <UserRound size={32} color={theme.colors.text.tertiary} />
              )}
            </View>
          </View>
          <PRISMSection>
            <DetailRow label="Name" value={profile.display_name} />
            <DetailRow label="Pronouns" value={profile.pronouns} />
            <DetailRow label="Gender" value={profile.gender} />
            <DetailRow label="Birthday" value={profile.birthday} />
            <DetailRow label="Journey start date" value={profile.journey_start_date} />
          </PRISMSection>
          <PRISMButton label="Edit profile" onPress={() => router.push('/you/profile/edit')} />
        </ScrollView>
      )}
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: theme.colors.text.tertiary }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: theme.colors.text.primary }]}>
        {value || 'Not set'}
      </Text>
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
  avatarRow: {
    alignItems: 'center',
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
  row: {
    marginBottom: spacing.sm,
  },
  rowLabel: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
  },
  rowValue: {
    fontSize: type.bodyL.fontSize,
    lineHeight: type.bodyL.lineHeight,
  },
});
