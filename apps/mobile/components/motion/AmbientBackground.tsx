import React, { useEffect } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { spectrum, useReducedMotion, useTheme } from '@prism/ui';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Orb {
  id: string;
  color: string;
  /** Resting position as a fraction of the screen. */
  x: number;
  y: number;
  /** Radius as a fraction of the screen width. */
  radius: number;
  /** Idle drift in px. */
  drift: number;
}

const ORBS: Orb[] = [
  { id: 'prism-orb-cyan', color: spectrum.cyan, x: 0.15, y: 0.18, radius: 0.85, drift: 34 },
  { id: 'prism-orb-violet', color: spectrum.violet, x: 0.9, y: 0.5, radius: 0.8, drift: 42 },
  { id: 'prism-orb-pink', color: spectrum.pink, x: 0.25, y: 0.92, radius: 0.75, drift: 38 },
];

// Where the previous screen left the background, so it keeps travelling
// instead of restarting on every screen.
let lastPhase = 0;

export interface AmbientBackgroundProps {
  /**
   * How far along the setup flow this screen is (0-1). The colored light
   * shifts a little further with each screen. Omit to keep the current
   * position.
   */
  phase?: number;
}

/**
 * Soft spectrum light drifting slowly behind the first screens — PRISM's
 * "light moving, refracting, settling" (docs/DESIGN_SYSTEM.md §23). Purely
 * decorative and low-contrast so text stays readable; static under Reduce
 * Motion.
 */
export function AmbientBackground({ phase }: AmbientBackgroundProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const { width, height } = useWindowDimensions();
  const drift = useSharedValue(0);
  const shift = useSharedValue(lastPhase);
  const glow = theme.scheme === 'dark' ? 0.34 : 0.26;

  useEffect(() => {
    if (reducedMotion) {
      cancelAnimation(drift);
      drift.value = 0.5;
      return;
    }
    drift.value = withRepeat(
      withTiming(1, { duration: 13000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    return () => cancelAnimation(drift);
  }, [reducedMotion, drift]);

  useEffect(() => {
    if (phase === undefined) return;
    lastPhase = phase;
    shift.value = reducedMotion
      ? phase
      : withTiming(phase, { duration: 1100, easing: Easing.inOut(Easing.cubic) });
  }, [phase, reducedMotion, shift]);

  const animated = ORBS.map((orb, index) =>
    // The list is fixed-length, so hook order never changes.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedProps(() => {
      const sway = (drift.value - 0.5) * 2 * orb.drift;
      return {
        cx: width * (orb.x + 0.16 * Math.sin(shift.value * 3.1 + index * 2.1)) + sway,
        cy: height * (orb.y + 0.12 * Math.cos(shift.value * 2.4 + index * 1.7)) - sway * 0.6,
      };
    }),
  );

  return (
    <Svg
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      width={width}
      height={height}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Defs>
        {ORBS.map((orb) => (
          <RadialGradient key={orb.id} id={orb.id}>
            <Stop offset="0" stopColor={orb.color} stopOpacity={1} />
            <Stop offset="1" stopColor={orb.color} stopOpacity={0} />
          </RadialGradient>
        ))}
      </Defs>
      {ORBS.map((orb, index) => (
        <AnimatedCircle
          key={orb.id}
          r={width * orb.radius}
          fill={`url(#${orb.id})`}
          opacity={glow}
          animatedProps={animated[index]}
        />
      ))}
    </Svg>
  );
}
