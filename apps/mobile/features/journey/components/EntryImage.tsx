import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { radius, spacing, useTheme } from '@prism/ui';
import { useSignedEntryImageUrl } from '../../../lib/journey/useSignedEntryImageUrl';

/** A milestone's photo, shown inside its Timeline entry. */
export function EntryImage({
  path,
  label,
  height = 160,
}: {
  path: string;
  label: string;
  height?: number;
}) {
  const theme = useTheme();
  const { data: uri } = useSignedEntryImageUrl(path);

  return (
    <View style={[styles.frame, { height, backgroundColor: theme.colors.surfaceElevated }]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={styles.image}
          resizeMode="cover"
          accessibilityLabel={`Photo for ${label}`}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: radius.md,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
