import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PRISMButton, fontFamily, fontWeight, spacing, type, useTheme } from '@prism/ui';
import { KeyboardAwareScreen } from '../../../components/KeyboardAwareScreen';
import { AmbientBackground, Reveal } from '../../../components/motion';

export interface OnboardingScreenLayoutProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  primaryLabel: string;
  onPrimaryPress: () => void;
  primaryLoading?: boolean;
  primaryDisabled?: boolean;
  /** e.g. "I'll do this later" / "Not right now" / "Skip" — every non-essential step is skippable. */
  onSkip?: () => void;
  skipLabel?: string;
  /** 0-1 position in the setup flow; the background light shifts with it. */
  phase?: number;
  /** Shown above the title, centered — used for the finale on the Ready screen. */
  hero?: React.ReactNode;
}

/**
 * Shared structure for the 12 Onboarding screens (docs/SCREEN_BIBLE.md
 * §5). Sequential but never a numbered progress meter — see
 * docs/MASTER_BUILD_SPEC.md §06.
 */
export function OnboardingScreenLayout({
  title,
  subtitle,
  children,
  primaryLabel,
  onPrimaryPress,
  primaryLoading = false,
  primaryDisabled = false,
  onSkip,
  skipLabel = 'Skip',
  phase,
  hero,
}: OnboardingScreenLayoutProps) {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <AmbientBackground phase={phase} />
      <KeyboardAwareScreen
        footer={
          <View style={styles.actions}>
            <PRISMButton
              label={primaryLabel}
              loading={primaryLoading}
              disabled={primaryDisabled}
              onPress={onPrimaryPress}
            />
            {onSkip ? <PRISMButton label={skipLabel} variant="tertiary" onPress={onSkip} /> : null}
          </View>
        }
      >
        <View style={styles.content}>
          {hero ? <View style={styles.hero}>{hero}</View> : null}
          <Reveal index={0}>
            <Text
              accessibilityRole="header"
              style={[
                styles.title,
                { color: theme.colors.text.primary },
                !subtitle && styles.titleAlone,
              ]}
            >
              {title}
            </Text>
          </Reveal>
          {subtitle ? (
            <Reveal index={1}>
              <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
                {subtitle}
              </Text>
            </Reveal>
          ) : null}
          {children ? (
            <Reveal index={2} style={styles.body}>
              {children}
            </Reveal>
          ) : null}
        </View>
      </KeyboardAwareScreen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    // Leaves room for the floating Back arrow (OnboardingBackButton).
    paddingTop: spacing.huge,
  },
  hero: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: type.displayM.fontSize,
    lineHeight: type.displayM.lineHeight,
    fontWeight: fontWeight.semibold as '600',
    marginBottom: spacing.sm,
  },
  titleAlone: {
    marginBottom: spacing.xl,
  },
  subtitle: {
    fontSize: type.bodyM.fontSize,
    lineHeight: type.bodyM.lineHeight,
    marginBottom: spacing.lg,
  },
  body: {
    gap: spacing.smd,
  },
  actions: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
});
