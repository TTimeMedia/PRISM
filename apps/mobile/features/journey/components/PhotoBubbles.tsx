import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { spacing, useReducedMotion, useTheme } from '@prism/ui';
import { useSignedEntryImageUrl } from '../../../lib/journey/useSignedEntryImageUrl';

const SIZE = 44;
const OVERLAP = 12;

/**
 * The photos on a Timeline entry as a row of small round bubbles that
 * slightly overlap, each popping in with a little spring as it loads.
 * Still for anyone who has turned on reduced motion.
 */
export function PhotoBubbles({ paths, label }: { paths: string[]; label: string }) {
  const reducedMotion = useReducedMotion();
  if (paths.length === 0) return null;
  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`${paths.length} ${paths.length === 1 ? 'photo' : 'photos'} for ${label}`}
    >
      {paths.map((path, index) => (
        <Bubble key={path} path={path} index={index} animate={!reducedMotion} />
      ))}
    </View>
  );
}

function Bubble({ path, index, animate }: { path: string; index: number; animate: boolean }) {
  const theme = useTheme();
  const { data: uri } = useSignedEntryImageUrl(path);
  // The slot keeps its place in the row; the bubble itself pops in once its photo is ready.
  return (
    <View style={[styles.slot, { marginLeft: index === 0 ? 0 : -OVERLAP, zIndex: 10 - index }]}>
      {uri ? (
        <Animated.View
          entering={
            animate
              ? ZoomIn.springify()
                  .damping(12)
                  .delay(index * 70)
              : undefined
          }
          style={[
            styles.bubble,
            {
              backgroundColor: theme.colors.surfaceElevated,
              borderColor: theme.colors.background,
            },
          ]}
        >
          <Image source={{ uri }} style={styles.image} resizeMode="cover" />
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  slot: {
    width: SIZE,
    height: SIZE,
  },
  bubble: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 2,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
