import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PRISMButton, fontFamily, fontWeight, spacing, type, useTheme } from '@prism/ui';
import { KeyboardAwareScreen } from '../../../components/KeyboardAwareScreen';

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
}: OnboardingScreenLayoutProps) {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <KeyboardAwareScreen>
        <View style={styles.content}>
          <Text
            accessibilityRole="header"
            style={[styles.title, { color: theme.colors.text.primary }]}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
              {subtitle}
            </Text>
          ) : null}
          {children ? <View style={styles.body}>{children}</View> : null}
        </View>
      </KeyboardAwareScreen>
      <View style={styles.actions}>
        <PRISMButton
          label={primaryLabel}
          loading={primaryLoading}
          disabled={primaryDisabled}
          onPress={onPrimaryPress}
        />
        {onSkip ? <PRISMButton label={skipLabel} variant="tertiary" onPress={onSkip} /> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: type.displayM.fontSize,
    lineHeight: type.displayM.lineHeight,
    fontWeight: fontWeight.semibold as '600',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: type.bodyM.fontSize,
    lineHeight: type.bodyM.lineHeight,
    marginBottom: spacing.lg,
  },
  body: {
    gap: spacing.xs,
  },
  actions: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
});
