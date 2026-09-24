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
import { EntryImage } from '../components/EntryImage';
import { TimelinePrompts } from '../components/TimelinePrompts';

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
      {isLoading ? (
        <View style={styles.content}>
          <View style={styles.skeletons}>
            <PRISMSkeleton height={56} />
            <PRISMSkeleton height={56} />
            <PRISMSkeleton height={56} />
          </View>
        </View>
      ) : isError ? (
        <View style={styles.content}>
          <PRISMErrorState onRetry={() => refetch()} />
        </View>
      ) : events && events.length > 0 ? (
        <View style={styles.content}>
          <TimelinePrompts variant="strip" />
          <PRISMTimeline
            events={events.map((event) => ({
              id: event.id,
              color: eventColor(theme, event.moduleKey),
              title: event.title,
              subtitle: event.subtitle,
              date: formatEventDate(event.at),
              media: event.imagePath ? (
                <EntryImage path={event.imagePath} label={event.title} />
              ) : undefined,
              onPress: () => router.push(recordHref(event.moduleKey, event.sourceId)),
            }))}
          />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <PRISMEmptyState
            title="Your story builds itself."
            subtitle="Milestones, journal entries, appointments, doses and injections all land here, in order. Add one to begin."
          />
          <TimelinePrompts variant="list" />
        </ScrollView>
      )}
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
