import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { spacing } from '../tokens/spacing';
import { fontWeight, type } from '../tokens/typography';
import { PRIZMButton } from './PRIZMButton';

export interface PRIZMErrorStateProps {
  /** Defaults to the approved generic copy — never a raw backend error. See docs/SECURITY.md. */
  message?: string;
  onRetry?: () => void;
  onGoBack?: () => void;
}

const DEFAULT_MESSAGE = "Something went wrong. Your information wasn't changed.";

export function PRIZMErrorState({
  message = DEFAULT_MESSAGE,
  onRetry,
  onGoBack,
}: PRIZMErrorStateProps) {
  const theme = useTheme();

  return (
    <View style={styles.container} accessibilityRole="alert">
      <Text style={[styles.message, { color: theme.colors.text.primary }]}>{message}</Text>
      <View style={styles.actions}>
        {onRetry ? <PRIZMButton label="Try again" variant="primary" onPress={onRetry} /> : null}
        {onGoBack ? <PRIZMButton label="Go back" variant="tertiary" onPress={onGoBack} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  message: {
    fontSize: type.bodyL.fontSize,
    lineHeight: type.bodyL.lineHeight,
    fontWeight: fontWeight.medium as '500',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  actions: {
    gap: spacing.sm,
    width: '100%',
    maxWidth: 280,
  },
});
