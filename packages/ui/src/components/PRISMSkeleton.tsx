import React, { useEffect } from 'react';
import { StyleSheet, type DimensionValue } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { radius } from '../tokens/radius';
import { duration } from '../tokens/motion';

export interface PRISMSkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
}

/**
 * A subtle shimmer placeholder — avoid generic spinners where possible.
 * See docs/DESIGN_SYSTEM.md §26. Falls back to a static block when
 * Reduce Motion is enabled.
 */
export function PRISMSkeleton({
  width = '100%',
  height = 16,
  borderRadius = radius.xs,
}: PRISMSkeletonProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    if (reducedMotion) {
      opacity.value = 0.5;
      return;
    }
    opacity.value = withRepeat(withTiming(1, { duration: duration.large * 2 }), -1, true);
  }, [reducedMotion, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.base,
        { width, height, borderRadius, backgroundColor: theme.colors.surfaceElevated },
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});
