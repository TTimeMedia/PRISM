import React, { useEffect } from 'react';
import Svg, { Line, Polygon } from 'react-native-svg';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { spectrum, useReducedMotion, useTheme } from '@prism/ui';

const AnimatedLine = Animated.createAnimatedComponent(Line);

const WIDTH = 240;
const HEIGHT = 150;
const APEX = { x: 108, y: 30 };
const LEFT = { x: 84, y: 112 };
const RIGHT = { x: 132, y: 112 };
const BEAM_FROM = { x: 8, y: 84 };
const BEAM_TO = { x: 100, y: 78 };
const RAY_FROM_X = 122;
const RAY_FROM_Y = 76;
const RAY_LENGTH = 130;
const RAY_COLORS = [spectrum.cyan, spectrum.mint, spectrum.yellow, spectrum.pink, spectrum.violet];
const RAY_ANGLES = [-26, -13, 0, 13, 26];

interface RayProps {
  color: string;
  angleDeg: number;
  index: number;
  reducedMotion: boolean;
}

function Ray({ color, angleDeg, index, reducedMotion }: RayProps) {
  const draw = useSharedValue(reducedMotion ? 1 : 0);
  const shimmer = useSharedValue(1);
  const rad = (angleDeg * Math.PI) / 180;
  const x2 = RAY_FROM_X + Math.cos(rad) * RAY_LENGTH;
  const y2 = RAY_FROM_Y + Math.sin(rad) * RAY_LENGTH;

  useEffect(() => {
    if (reducedMotion) {
      draw.value = 1;
      shimmer.value = 1;
      return;
    }
    draw.value = withDelay(
      700 + index * 140,
      withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) }),
    );
    shimmer.value = withDelay(
      2200 + index * 260,
      withRepeat(
        withSequence(
          withTiming(0.55, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
      ),
    );
    return () => {
      cancelAnimation(draw);
      cancelAnimation(shimmer);
    };
  }, [reducedMotion, index, draw, shimmer]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: RAY_LENGTH * (1 - draw.value),
    strokeOpacity: shimmer.value,
  }));

  return (
    <AnimatedLine
      x1={RAY_FROM_X}
      y1={RAY_FROM_Y}
      x2={x2}
      y2={y2}
      stroke={color}
      strokeWidth={5}
      strokeLinecap="round"
      strokeDasharray={`${RAY_LENGTH} ${RAY_LENGTH}`}
      animatedProps={animatedProps}
    />
  );
}

/**
 * The PRISM mark, drawn in: a beam of light meets the prism and fans out
 * into the five spectrum colors, which then shimmer gently. Static under
 * Reduce Motion. Decorative — hidden from screen readers.
 */
export function PrismMark() {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const beam = useSharedValue(reducedMotion ? 1 : 0);

  useEffect(() => {
    if (reducedMotion) {
      beam.value = 1;
      return;
    }
    beam.value = withDelay(150, withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }));
    return () => cancelAnimation(beam);
  }, [reducedMotion, beam]);

  const beamProps = useAnimatedProps(() => ({
    strokeDashoffset: 100 * (1 - beam.value),
  }));

  const edge = theme.colors.text.primary;

  return (
    <Svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <AnimatedLine
        x1={BEAM_FROM.x}
        y1={BEAM_FROM.y}
        x2={BEAM_TO.x}
        y2={BEAM_TO.y}
        stroke={edge}
        strokeOpacity={0.85}
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray="100 100"
        animatedProps={beamProps}
      />
      {RAY_COLORS.map((color, index) => (
        <Ray
          key={color}
          color={color}
          angleDeg={RAY_ANGLES[index] as number}
          index={index}
          reducedMotion={reducedMotion}
        />
      ))}
      <Polygon
        points={`${APEX.x},${APEX.y} ${RIGHT.x},${RIGHT.y} ${LEFT.x},${LEFT.y}`}
        fill={theme.colors.background}
        fillOpacity={0.55}
        stroke={edge}
        strokeWidth={3}
        strokeLinejoin="round"
      />
    </Svg>
  );
}
