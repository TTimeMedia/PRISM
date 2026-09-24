import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fontFamily, fontWeight, spacing, type, useTheme } from '@prism/ui';
import { KeyboardAwareScreen } from '../../../components/KeyboardAwareScreen';
import { AmbientBackground, Reveal } from '../../../components/motion';

export interface AuthScreenLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  /** e.g. a "Sign in" link under a Sign Up form's primary action. */
  footer?: React.ReactNode;
  /** Shown above the title, e.g. the animated PRISM mark on Welcome. */
  hero?: React.ReactNode;
}

/**
 * Shared structure for the seven Authentication screens (Welcome through
 * Email Verification) — see docs/SCREEN_BIBLE.md §4. Centered content,
 * keyboard-aware, respects safe areas; each screen supplies its own
 * fields/actions as children. Content eases in over a soft drifting
 * spectrum background.
 */
export function AuthScreenLayout({
  title,
  subtitle,
  children,
  footer,
  hero,
}: AuthScreenLayoutProps) {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <AmbientBackground phase={0} />
      <KeyboardAwareScreen>
        <View style={styles.content}>
          {hero ? <View style={styles.hero}>{hero}</View> : null}
          <Reveal index={0}>
            <Text
              accessibilityRole="header"
              style={[styles.title, { color: theme.colors.text.primary }]}
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
          <Reveal index={2} style={styles.body}>
            {children}
          </Reveal>
        </View>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </KeyboardAwareScreen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  hero: {
    alignItems: 'center',
    marginBottom: spacing.lg,
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
    marginBottom: spacing.xl,
  },
  body: {
    gap: spacing.xs,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
});
