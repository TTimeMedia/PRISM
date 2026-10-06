import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { radius, spacing, useTheme } from '@prism/ui';
import { useSignedEntryImageUrl } from '../../../lib/journey/useSignedEntryImageUrl';

/**
 * All the photos on a journal entry or milestone: swipe between them, with
 * a dot for each when there's more than one. A single photo shows plainly.
 */
export function EntryGallery({
  paths,
  label,
  height = 240,
}: {
  paths: string[];
  label: string;
  height?: number;
}) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);
  const [page, setPage] = useState(0);
  if (paths.length === 0) return null;

  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);
  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (width > 0) setPage(Math.round(event.nativeEvent.contentOffset.x / width));
  };

  return (
    <View onLayout={onLayout}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        style={[styles.frame, { height, backgroundColor: theme.colors.surfaceElevated }]}
      >
        {paths.map((path, index) => (
          <Photo
            key={path}
            path={path}
            width={width}
            height={height}
            label={
              paths.length > 1
                ? `Photo ${index + 1} of ${paths.length} for ${label}`
                : `Photo for ${label}`
            }
          />
        ))}
      </ScrollView>
      {paths.length > 1 ? (
        <View style={styles.dots} accessibilityElementsHidden>
          {paths.map((path, index) => (
            <View
              key={path}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === page ? theme.colors.text.primary : theme.colors.border.default,
                },
              ]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function Photo({
  path,
  width,
  height,
  label,
}: {
  path: string;
  width: number;
  height: number;
  label: string;
}) {
  const { data: uri } = useSignedEntryImageUrl(path);
  return (
    <View style={{ width, height }}>
      {uri ? (
        <Image
          source={{ uri }}
          style={styles.image}
          resizeMode="cover"
          accessibilityLabel={label}
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
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
