import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { X } from 'lucide-react-native';
import type { ImagePickerAsset } from 'expo-image-picker';
import { PRISMButton, radius, spacing, type, useTheme } from '@prism/ui';
import { MAX_ENTRY_PHOTOS } from '../../../lib/journey/entryPhotos';
import { useSignedEntryImageUrl } from '../../../lib/journey/useSignedEntryImageUrl';

export interface EntryPhotoFieldProps {
  /** Saved photos still on the entry (private-bucket paths), in order. */
  kept: string[];
  /** Photos just picked, not yet uploaded; shown after the saved ones. */
  added: ImagePickerAsset[];
  onAdd: () => void;
  onRemoveKept: (path: string) => void;
  onRemoveAdded: (asset: ImagePickerAsset) => void;
}

/**
 * Up to five photos on a journal entry or milestone, as a row of
 * thumbnails with a remove button on each. Nothing uploads until the form
 * is saved.
 */
export function EntryPhotoField({
  kept,
  added,
  onAdd,
  onRemoveKept,
  onRemoveAdded,
}: EntryPhotoFieldProps) {
  const theme = useTheme();
  const count = kept.length + added.length;
  const room = MAX_ENTRY_PHOTOS - count;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.text.secondary }]}>
        Photos {count > 0 ? `(${count} of ${MAX_ENTRY_PHOTOS})` : ''}
      </Text>
      {count > 0 ? (
        <View style={styles.grid}>
          {kept.map((path, index) => (
            <SavedThumb key={path} path={path} index={index} onRemove={() => onRemoveKept(path)} />
          ))}
          {added.map((asset, index) => (
            <Thumb
              key={asset.uri}
              uri={asset.uri}
              index={kept.length + index}
              onRemove={() => onRemoveAdded(asset)}
            />
          ))}
        </View>
      ) : null}
      {room > 0 ? (
        <PRISMButton
          label={count === 0 ? 'Add photos' : `Add more (up to ${room})`}
          variant="secondary"
          onPress={onAdd}
        />
      ) : (
        <Text style={[styles.full, { color: theme.colors.text.tertiary }]}>
          That&apos;s the most for one entry. Remove one to add another.
        </Text>
      )}
    </View>
  );
}

function SavedThumb({
  path,
  index,
  onRemove,
}: {
  path: string;
  index: number;
  onRemove: () => void;
}) {
  const { data: uri } = useSignedEntryImageUrl(path);
  return <Thumb uri={uri ?? null} index={index} onRemove={onRemove} />;
}

function Thumb({
  uri,
  index,
  onRemove,
}: {
  uri: string | null;
  index: number;
  onRemove: () => void;
}) {
  const theme = useTheme();
  return (
    <View
      style={[styles.thumb, { backgroundColor: theme.colors.surfaceElevated }]}
      accessibilityLabel={`Photo ${index + 1}`}
    >
      {uri ? <Image source={{ uri }} style={styles.image} resizeMode="cover" /> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Remove photo ${index + 1}`}
        onPress={onRemove}
        hitSlop={8}
        style={[styles.remove, { backgroundColor: theme.colors.background }]}
      >
        <X size={14} color={theme.colors.text.primary} strokeWidth={2.6} />
      </Pressable>
    </View>
  );
}

const THUMB = 96;

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  label: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  remove: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.9,
  },
  full: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
  },
});
