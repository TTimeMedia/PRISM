import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { PRISMButton, radius, spacing, type, useTheme } from '@prism/ui';
import { useSignedMilestoneImageUrl } from '../../../lib/journey/useSignedMilestoneImageUrl';

export interface MilestonePhotoFieldProps {
  /** The photo already saved on this milestone, if any (a private-bucket path). */
  existingPath?: string | null;
  /** A photo just picked but not yet uploaded — shown instead of the saved one. */
  pendingUri?: string | null;
  /** The saved photo was removed in this session. */
  removed?: boolean;
  onPick: () => void;
  onRemove: () => void;
}

/** Add / change / remove a photo on a milestone — nothing uploads until the form is saved. */
export function MilestonePhotoField({
  existingPath,
  pendingUri,
  removed = false,
  onPick,
  onRemove,
}: MilestonePhotoFieldProps) {
  const theme = useTheme();
  const showExisting = !pendingUri && !removed && !!existingPath;
  const { data: signedUrl } = useSignedMilestoneImageUrl(showExisting ? existingPath : null);
  const uri = pendingUri ?? (showExisting ? signedUrl : null);
  const hasPhoto = !!pendingUri || showExisting;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.text.secondary }]}>Photo</Text>
      {hasPhoto ? (
        <View
          style={[styles.preview, { backgroundColor: theme.colors.surfaceElevated }]}
          accessibilityLabel="Milestone photo preview"
        >
          {uri ? <Image source={{ uri }} style={styles.image} resizeMode="cover" /> : null}
        </View>
      ) : null}
      <View style={styles.actions}>
        <PRISMButton
          label={hasPhoto ? 'Change photo' : 'Add a photo'}
          variant="secondary"
          onPress={onPick}
        />
        {hasPhoto ? <PRISMButton label="Remove photo" variant="tertiary" onPress={onRemove} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
    marginBottom: spacing.xs,
  },
  preview: {
    height: 200,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  actions: {
    gap: spacing.xs,
  },
});
