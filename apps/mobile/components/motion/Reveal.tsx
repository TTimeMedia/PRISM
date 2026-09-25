import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { Easing, FadeIn, FadeInDown } from 'react-native-reanimated';
import { useReducedMotion } from '@prism/ui';

const BASE_DELAY_MS = 120;
const STEP_MS = 120;

export interface RevealProps {
  /** Position in the entrance sequence — higher indexes arrive slightly later. */
  index?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

/**
 * Eases its content in (a soft rise and fade), staggered by `index` so a
 * screen's title, text, and choices arrive one after another. Under Reduce
 * Motion it's just a quick fade — see docs/DESIGN_SYSTEM.md §23.
 */
export function Reveal({ index = 0, style, children }: RevealProps) {
  const reducedMotion = useReducedMotion();
  const entering = reducedMotion
    ? FadeIn.duration(150)
    : FadeInDown.delay(BASE_DELAY_MS + index * STEP_MS)
        .duration(520)
        .easing(Easing.out(Easing.cubic));

  return (
    <Animated.View entering={entering} style={style}>
      {children}
    </Animated.View>
  );
}
