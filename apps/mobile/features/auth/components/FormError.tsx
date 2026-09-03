import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { spacing, type, useTheme } from '@prism/ui';

/** A calm, non-technical submit-level error — see docs/SCREEN_BIBLE.md §3 (Error state). */
export function FormError({ message }: { message: string }) {
  const theme = useTheme();
  return (
    <Text accessibilityLiveRegion="assertive" style={[styles.text, { color: theme.destructive }]}>
      {message}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
    marginBottom: spacing.md,
  },
});
