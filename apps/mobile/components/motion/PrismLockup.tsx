import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { fontFamily, fontWeight, spacing, useTheme } from '@prism/ui';
import { PrismMark } from './PrismMark';
import { Reveal } from './Reveal';

/**
 * The logo stacked over the Prism wordmark — the app's calm signature on
 * Welcome. The mark animates in; the wordmark follows it.
 */
export function PrismLockup() {
  const theme = useTheme();
  return (
    <View style={styles.column}>
      <PrismMark size={120} />
      <Reveal index={2}>
        <Text
          accessibilityRole="header"
          accessibilityLabel="Prism"
          style={[styles.wordmark, { color: theme.colors.text.primary }]}
        >
          Prism
        </Text>
      </Reveal>
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    alignItems: 'center',
    gap: spacing.md,
  },
  wordmark: {
    fontFamily: fontFamily.display,
    fontSize: 36,
    lineHeight: 42,
    fontWeight: fontWeight.bold as '700',
    letterSpacing: 1.5,
  },
});
