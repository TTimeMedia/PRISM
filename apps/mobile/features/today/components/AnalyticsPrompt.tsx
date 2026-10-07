import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PRISMButton, fontWeight, radius, spacing, type, useTheme } from '@prism/ui';
import { useAppStore } from '../../../lib/store/appStore';

/**
 * The one-time question on Today: may Prism count anonymous usage? Nothing
 * is sent before a yes. Either answer hides the card for good; the choice
 * can be changed in Privacy & security.
 */
export function AnalyticsPrompt() {
  const theme = useTheme();
  const consent = useAppStore((state) => state.analyticsConsent);
  const setConsent = useAppStore((state) => state.setAnalyticsConsent);
  if (consent !== 'unasked') return null;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border.subtle },
      ]}
    >
      <Text style={[styles.title, { color: theme.colors.text.primary }]}>Help improve Prism?</Text>
      <Text style={[styles.body, { color: theme.colors.text.secondary }]}>
        Share anonymous usage: which screens and features get used, so we know what to make better.
        Never your name, your health details, or anything you write. You can change this any time in
        Privacy & security.
      </Text>
      <PRISMButton label="Share anonymous usage" onPress={() => setConsent('granted')} />
      <PRISMButton label="No thanks" variant="tertiary" onPress={() => setConsent('declined')} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  title: {
    fontSize: type.bodyL.fontSize,
    lineHeight: type.bodyL.lineHeight,
    fontWeight: fontWeight.semibold as '600',
  },
  body: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
  },
});
