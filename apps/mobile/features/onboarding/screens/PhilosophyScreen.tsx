import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Lock, Repeat, SlidersHorizontal, type LucideIcon } from 'lucide-react-native';
import { getNextOnboardingStep } from '@prism/types';
import {
  fontFamily,
  fontWeight,
  radius,
  spacing,
  spectrumGradient,
  type,
  useTheme,
} from '@prism/ui';
import { OnboardingScreenLayout } from '../components/OnboardingScreenLayout';
import { PrismMark, Reveal } from '../../../components/motion';
import { onboardingStepHref } from '../../../lib/onboarding/routes';
import { useUpdateProfile } from '../../../lib/profile/queries';

interface Pillar {
  icon: LucideIcon;
  tint: string;
  heading: string;
  body: string;
}

const PILLARS: Pillar[] = [
  {
    icon: SlidersHorizontal,
    tint: spectrumGradient[0] as string,
    heading: 'You choose',
    body: 'Add only what you want to keep. Leave the rest out.',
  },
  {
    icon: Repeat,
    tint: spectrumGradient[2] as string,
    heading: 'Change anytime',
    body: 'Everything is optional, and you can change any of it later.',
  },
  {
    icon: Lock,
    tint: spectrumGradient[3] as string,
    heading: 'Private by design',
    body: 'What you write here stays in your private space.',
  },
];

/** Screen 08 — Philosophy. A short, calm intro to how Prism works: optional, private, yours. */
export function PhilosophyScreen() {
  const theme = useTheme();
  const updateProfile = useUpdateProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onContinue = async () => {
    setIsSubmitting(true);
    const next = getNextOnboardingStep('philosophy', { careSetup: null, intent: null });
    await updateProfile.mutateAsync({ onboarding_step: next });
    setIsSubmitting(false);
    router.replace(onboardingStepHref(next));
  };

  return (
    <OnboardingScreenLayout
      hero={<PrismMark size={210} />}
      phase={0.25}
      title="Set it up your way."
      primaryLabel="Continue"
      onPrimaryPress={onContinue}
      primaryLoading={isSubmitting}
    >
      <View style={styles.pillars}>
        {PILLARS.map((pillar, index) => {
          const Icon = pillar.icon;
          return (
            <Reveal key={pillar.heading} index={3 + index} style={styles.pillar}>
              <View style={[styles.iconTile, { backgroundColor: `${pillar.tint}55` }]}>
                <Icon size={24} color={theme.colors.text.primary} strokeWidth={2} />
              </View>
              <View style={styles.pillarText}>
                <Text style={[styles.heading, { color: theme.colors.text.primary }]}>
                  {pillar.heading}
                </Text>
                <Text style={[styles.body, { color: theme.colors.text.secondary }]}>
                  {pillar.body}
                </Text>
              </View>
            </Reveal>
          );
        })}
      </View>
      <Reveal index={7} style={styles.closing}>
        <View style={styles.spectrumBar}>
          {spectrumGradient.map((color) => (
            <View key={color} style={[styles.spectrumSegment, { backgroundColor: color }]} />
          ))}
        </View>
        <Text style={[styles.emphasis, { color: theme.colors.text.primary }]}>
          Prism fits around you.
        </Text>
      </Reveal>
    </OnboardingScreenLayout>
  );
}

const styles = StyleSheet.create({
  pillars: {
    gap: spacing.md,
  },
  pillar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconTile: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillarText: {
    flex: 1,
    gap: 2,
  },
  heading: {
    fontFamily: fontFamily.display,
    fontSize: type.headingL.fontSize,
    lineHeight: type.headingL.lineHeight,
    fontWeight: fontWeight.semibold as '600',
  },
  body: {
    fontFamily: fontFamily.primary,
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
  },
  closing: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  spectrumBar: {
    flexDirection: 'row',
    height: 5,
    width: 96,
    borderRadius: 3,
    overflow: 'hidden',
  },
  spectrumSegment: {
    flex: 1,
  },
  emphasis: {
    fontFamily: fontFamily.display,
    fontSize: type.displayM.fontSize,
    lineHeight: type.displayM.lineHeight,
    fontWeight: fontWeight.bold as '700',
  },
});
