import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useReducedMotion, useTheme } from '@prizm/ui';

const PRIZM_IMAGE = require('../../assets/images/prism-mark.png');

/** The cut-out prism is 720 x 591. */
const IMAGE_ASPECT = 591 / 720;

const DEFAULT_SIZE = 220;

export interface PrizmMarkProps {
  /** Rendered width in points; the height follows the logo's proportions. */
  size?: number;
}

/**
 * The Prizm logo (the crystal prism from the app icon, cut out on its own),
 * easing in with a soft spring and then floating and breathing gently over a
 * faint spectrum halo. Static under Reduce Motion. Decorative — hidden from
 * screen readers.
 */
export function PrizmMark({ size = DEFAULT_SIZE }: PrizmMarkProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const appear = useSharedValue(reducedMotion ? 1 : 0);
  const float = useSharedValue(0);
  const halo = useSharedValue(1);

  useEffect(() => {
    if (reducedMotion) {
      appear.value = 1;
      float.value = 0;
      halo.value = 1;
      return;
    }
    appear.value = withDelay(120, withSpring(1, { damping: 14, stiffness: 90 }));
    float.value = withDelay(
      900,
      withRepeat(withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.sin) }), -1, true),
    );
    halo.value = withRepeat(
      withSequence(
        withTiming(0.55, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
    return () => {
      cancelAnimation(appear);
      cancelAnimation(float);
      cancelAnimation(halo);
    };
  }, [reducedMotion, appear, float, halo]);

  const prizmStyle = useAnimatedStyle(() => ({
    opacity: Math.min(appear.value, 1),
    transform: [
      { translateY: (float.value - 0.5) * -10 },
      { scale: 0.7 + 0.3 * appear.value + float.value * 0.02 },
    ],
  }));
  const haloStyle = useAnimatedStyle(() => ({
    opacity: halo.value * Math.min(appear.value, 1),
  }));

  const height = size * IMAGE_ASPECT;
  const haloSize = size * 1.5;
  const isDark = theme.scheme === 'dark';
  const haloColor = isDark ? theme.spectrum.violet : theme.spectrum.cyan;

  return (
    <View
      style={{ width: size, height }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Animated.View
        pointerEvents="none"
        shouldRasterizeIOS
        renderToHardwareTextureAndroid
        style={[
          styles.halo,
          {
            width: haloSize,
            height: haloSize,
            left: (size - haloSize) / 2,
            top: (height - haloSize) / 2,
          },
          haloStyle,
        ]}
      >
        <Svg width={haloSize} height={haloSize}>
          <Defs>
            <RadialGradient id="prizm-halo">
              <Stop offset="0" stopColor={haloColor} stopOpacity={0.45} />
              <Stop offset="1" stopColor={haloColor} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={haloSize / 2} cy={haloSize / 2} r={haloSize / 2} fill="url(#prizm-halo)" />
        </Svg>
      </Animated.View>
      <Animated.Image
        source={PRIZM_IMAGE}
        resizeMode="contain"
        style={[{ width: size, height: height }, prizmStyle]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  halo: {
    position: 'absolute',
  },
});
