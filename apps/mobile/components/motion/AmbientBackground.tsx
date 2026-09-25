import React, { useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { spectrum, useReducedMotion, useTheme } from '@prism/ui';

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

interface OrbViewProps {
  orb: Orb;
  index: number;
  width: number;
  height: number;
  glow: number;
  drift: SharedValue<number>;
  shift: SharedValue<number>;
}

/**
 * One soft blob of color. The gradient is drawn once and never changes;
 * only the wrapper's position is animated, which the GPU handles without
 * asking the JavaScript thread to redraw anything each frame.
 */
function OrbView({ orb, index, width, height, glow, drift, shift }: OrbViewProps) {
  const size = width * orb.radius * 2;
  const style = useAnimatedStyle(() => {
    const sway = (drift.value - 0.5) * 2 * orb.drift;
    const cx = width * (orb.x + 0.16 * Math.sin(shift.value * 3.1 + index * 2.1)) + sway;
    const cy = height * (orb.y + 0.12 * Math.cos(shift.value * 2.4 + index * 1.7)) - sway * 0.6;
    return { transform: [{ translateX: cx - size / 2 }, { translateY: cy - size / 2 }] };
  });

  return (
    <Animated.View
      pointerEvents="none"
      shouldRasterizeIOS
      renderToHardwareTextureAndroid
      style={[styles.orb, { width: size, height: size, opacity: glow }, style]}
    >
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={orb.id}>
            <Stop offset="0" stopColor={orb.color} stopOpacity={1} />
            <Stop offset="1" stopColor={orb.color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${orb.id})`} />
      </Svg>
    </Animated.View>
  );
}

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

  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {ORBS.map((orb, index) => (
        <OrbView
          key={orb.id}
          orb={orb}
          index={index}
          width={width}
          height={height}
          glow={glow}
          drift={drift}
          shift={shift}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  orb: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
