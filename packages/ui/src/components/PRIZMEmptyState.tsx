import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { spacing } from '../tokens/spacing';
import { fontWeight, type } from '../tokens/typography';
import { PRIZMButton } from './PRIZMButton';

export interface PRIZMEmptyStateProps {
  /** Approved, human copy — see docs/DESIGN_SYSTEM.md §25 and @prizm/config EMPTY_STATE_COPY. */
  title: string;
  subtitle?: string;
  action?: { label: string; onPress: () => void };
}

/** Every collection needs a human, non-clinical empty state. Never a bare "No records found." */
export function PRIZMEmptyState({ title, subtitle, action }: PRIZMEmptyStateProps) {
  const theme = useTheme();

  return (
    <View style={styles.container} accessibilityRole="text">
      <Text style={[styles.title, { color: theme.colors.text.primary }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>{subtitle}</Text>
      ) : null}
      {action ? (
        <View style={styles.action}>
          <PRIZMButton label={action.label} variant="secondary" onPress={action.onPress} />
        </View>
      ) : null}
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
  title: {
    fontSize: type.headingM.fontSize,
    lineHeight: type.headingM.lineHeight,
    fontWeight: fontWeight.semibold as '600',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: type.bodyM.fontSize,
    lineHeight: type.bodyM.lineHeight,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  action: {
    marginTop: spacing.lg,
  },
});
