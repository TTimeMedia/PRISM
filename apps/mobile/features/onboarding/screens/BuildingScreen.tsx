import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useReducedMotion, spacing, spectrumGradient, type, useTheme } from '@prism/ui';
import { getNextOnboardingStep } from '@prism/types';
import { onboardingStepHref } from '../../../lib/onboarding/routes';
import { useProfile, useUpdateProfile } from '../../../lib/profile/queries';

const BUILD_DURATION_MS = 1500;

/**
 * Screen 18 — Building PRISM. A brief (~1-2s) light/prism visual, never
 * artificially delayed beyond that — see docs/SCREEN_BIBLE.md Screen 18.
 * Falls back to an instant static display under Reduce Motion.
 */
export function BuildingScreen() {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();

  useEffect(() => {
    const advance = async () => {
      const next = getNextOnboardingStep('building', { careSetup: null, intent: profile?.intent });
      await updateProfile.mutateAsync({ onboarding_step: next });
      router.replace(onboardingStepHref(next));
    };
    const timer = setTimeout(advance, reducedMotion ? 200 : BUILD_DURATION_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.dots}>
        {spectrumGradient.map((color, index) => (
          <Animated.View
            key={color}
            entering={reducedMotion ? undefined : FadeIn.delay(index * 150).duration(300)}
            style={[styles.dot, { backgroundColor: color }]}
          />
        ))}
      </View>
      <Text style={[styles.text, { color: theme.colors.text.secondary }]}>
        Building your PRISM…
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  text: {
    fontSize: type.bodyM.fontSize,
    lineHeight: type.bodyM.lineHeight,
  },
});
