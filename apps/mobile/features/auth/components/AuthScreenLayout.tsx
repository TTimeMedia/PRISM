import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fontFamily, fontWeight, spacing, type, useTheme } from '@prism/ui';
import { KeyboardAwareScreen } from '../../../components/KeyboardAwareScreen';

export interface AuthScreenLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  /** e.g. a "Sign in" link under a Sign Up form's primary action. */
  footer?: React.ReactNode;
}

/**
 * Shared structure for the seven Authentication screens (Welcome through
 * Email Verification) — see docs/SCREEN_BIBLE.md §4. Centered content,
 * keyboard-aware, respects safe areas; each screen supplies its own
 * fields/actions as children.
 */
export function AuthScreenLayout({ title, subtitle, children, footer }: AuthScreenLayoutProps) {
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
          <View style={styles.body}>{children}</View>
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
