import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PRISMEmptyState, PRISMHeader, useTheme } from '@prism/ui';

export interface PlaceholderScreenProps {
  title: string;
  subtitle: string;
  emptyTitle: string;
  emptySubtitle?: string;
  /** e.g. YOU's "Sign out" — a real, working action on an otherwise-placeholder screen. */
  action?: { label: string; onPress: () => void };
}

/**
 * A structural placeholder for one of the four primary destinations.
 * Milestone 01 (Foundation) establishes navigation and the design
 * language; the real TODAY/CARE/JOURNEY/YOU experiences are built in
 * their own milestones — see docs/BUILD_STATUS.md. This is not meant
 * to look "unfinished" — PRISM's own empty-state language already
 * describes a screen with nothing in it yet, which is exactly what
 * this is.
 */
export function PlaceholderScreen({
  title,
  subtitle,
  emptyTitle,
  emptySubtitle,
  action,
}: PlaceholderScreenProps) {
  const theme = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <PRISMHeader title={title} subtitle={subtitle} />
      <ScrollView contentContainerStyle={styles.content}>
        <PRISMEmptyState title={emptyTitle} subtitle={emptySubtitle} action={action} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});
