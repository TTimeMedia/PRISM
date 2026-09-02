import React from 'react';
import { router, type Href } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import {
  PRISMEmptyState,
  PRISMErrorState,
  PRISMHeader,
  PRISMIconButton,
  PRISMSkeleton,
  PRISMTimeline,
  spacing,
  useTheme,
} from '@prism/ui';
import type { ModuleKey } from '@prism/types';
import { useTimelineEvents } from '../../../lib/journey/timelineQuery';
import { eventColor } from '../eventDisplay';

/**
 * Screen 42 — Timeline. Tapping an event opens its original record
 * (Screen 43) — Timeline never duplicates data, it's a view. There is no
 * dedicated Injection Detail screen in the P0 screen inventory (only
 * Injection History/Log Injection), so an injection event routes to
 * Injection History — the closest real view of that record. See
 * docs/DECISIONS.md § JOURNEY.
 */
export function TimelineScreen() {
  const theme = useTheme();
  const { data: events, isLoading, isError, refetch } = useTimelineEvents();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PRISMHeader
        title="Timeline"
        leading={
          <PRISMIconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.text.primary} />
          </PRISMIconButton>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        {isLoading ? (
          <View style={styles.skeletons}>
            <PRISMSkeleton height={56} />
            <PRISMSkeleton height={56} />
            <PRISMSkeleton height={56} />
          </View>
        ) : isError ? (
          <PRISMErrorState onRetry={() => refetch()} />
        ) : events && events.length > 0 ? (
          <PRISMTimeline
            events={events.map((event) => ({
              id: event.id,
              color: eventColor(theme, event.moduleKey),
              title: event.title,
              subtitle: event.subtitle,
              date: formatEventDate(event.at),
              onPress: () => router.push(recordHref(event.moduleKey, event.sourceId)),
            }))}
          />
        ) : (
          <PRISMEmptyState
            title="Your story starts wherever you decide."
            subtitle="Nothing recorded yet."
          />
        )}
      </ScrollView>
    </View>
  );
}

function formatEventDate(at: string): string {
  return new Date(at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function recordHref(moduleKey: ModuleKey, sourceId: string): Href {
  switch (moduleKey) {
    case 'medications':
      return `/care/medications/${sourceId}/history`;
    case 'injections':
      return '/care/injections';
    case 'appointments':
      return `/care/appointments/${sourceId}`;
    case 'milestones':
      return `/journey/milestones/${sourceId}`;
    case 'journal':
      return `/journey/journal/${sourceId}`;
    default:
      return '/journey';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  skeletons: {
    gap: spacing.sm,
  },
});
