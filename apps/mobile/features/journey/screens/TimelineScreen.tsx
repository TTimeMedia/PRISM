import React, { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  PRISMButton,
  PRISMChipGroup,
  PRISMErrorState,
  PRISMSkeleton,
  PRISMTimeline,
  fontFamily,
  fontWeight,
  spacing,
  type,
  useTheme,
} from '@prism/ui';
import type { TimelineEvent } from '@prism/types';
import { useProfile } from '../../../lib/profile/queries';
import { useSignedProfilePhotoUrl } from '../../../lib/you/useSignedProfilePhotoUrl';
import { useTimelineEvents } from '../../../lib/journey/timelineQuery';
import { recordHref } from '../../../lib/journey/recordHref';
import { ScreenGlow, StatChip, useTint } from '../../../components/home';
import { TopBar } from '../../../components/home/TopBar';
import { eventColor } from '../eventDisplay';
import { EntryImage } from '../components/EntryImage';
import { TimelinePrompts } from '../components/TimelinePrompts';

type Filter = 'all' | 'doses' | 'appointments' | 'moments';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'doses', label: 'Doses' },
  { value: 'appointments', label: 'Appointments' },
  { value: 'moments', label: 'Moments' },
];

function matchesFilter(event: TimelineEvent, filter: Filter): boolean {
  switch (filter) {
    case 'doses':
      return event.moduleKey === 'medications';
    case 'appointments':
      return event.moduleKey === 'appointments';
    case 'moments':
      return event.moduleKey === 'milestones' || event.moduleKey === 'journal';
    default:
      return true;
  }
}

/** Counts for the current month: what happened, never how well. */
export function monthSummary(events: readonly TimelineEvent[], now: Date = new Date()) {
  const inMonth = events.filter((event) => {
    const at = new Date(event.at);
    return at.getFullYear() === now.getFullYear() && at.getMonth() === now.getMonth();
  });
  return {
    doses: inMonth.filter((e) => e.moduleKey === 'medications').length,
    appointments: inMonth.filter((e) => e.moduleKey === 'appointments').length,
    moments: inMonth.filter((e) => e.moduleKey === 'milestones' || e.moduleKey === 'journal')
      .length,
  };
}

function initialsOf(name: string | null | undefined): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'P';
  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

/**
 * The YOU tab: you, and your record. Who you are (photo, name, how long
 * you've been here), what this month held in plain counts, and the whole
 * Timeline of everything you've kept, filterable. Journey is where you
 * write and reflect; this is where it all adds up. Tapping an event opens
 * its original record: the Timeline never duplicates data, it's a view.
 */
export function TimelineScreen() {
  const theme = useTheme();
  const tint = useTint('violet');
  const { data: profile } = useProfile();
  const { data: photoUrl } = useSignedProfilePhotoUrl(profile?.profile_photo_url);
  const { data: events, isLoading, isError, refetch } = useTimelineEvents();
  const [filter, setFilter] = useState<Filter>('all');

  const all = useMemo(() => events ?? [], [events]);
  const summary = useMemo(() => monthSummary(all), [all]);
  const visible = useMemo(() => all.filter((event) => matchesFilter(event, filter)), [all, filter]);
  const name = profile?.display_name?.trim();
  const since = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : null;

  const header = (
    <View style={styles.header}>
      <View style={styles.profile}>
        <View style={[styles.avatar, { backgroundColor: tint.tile }]}>
          {photoUrl ? (
            <Image
              source={{ uri: photoUrl }}
              style={styles.avatarImage}
              accessibilityLabel="Your photo"
            />
          ) : (
            <Text style={[styles.avatarText, { color: theme.colors.text.primary }]}>
              {initialsOf(name)}
            </Text>
          )}
        </View>
        <View style={styles.profileText}>
          <Text
            accessibilityRole="header"
            style={[styles.name, { color: theme.colors.text.primary }]}
            numberOfLines={1}
          >
            {name || 'You'}
          </Text>
          {since ? (
            <Text style={[styles.since, { color: theme.colors.text.secondary }]}>
              With Prism since {since}
            </Text>
          ) : null}
        </View>
      </View>
      <View style={styles.profileButtons}>
        <View style={styles.profileButton}>
          <PRISMButton
            label="Profile"
            variant="secondary"
            onPress={() => router.push('/you/profile')}
          />
        </View>
        <View style={styles.profileButton}>
          <PRISMButton
            label="Settings"
            variant="secondary"
            onPress={() => router.push('/you/settings')}
          />
        </View>
      </View>

      <Text style={[styles.sectionLabel, { color: theme.colors.text.secondary }]}>This month</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsScroll}
        contentContainerStyle={styles.chips}
      >
        <StatChip value={String(summary.doses)} label="doses logged" tint="cyan" />
        <StatChip value={String(summary.appointments)} label="appointments" tint="yellow" />
        <StatChip value={String(summary.moments)} label="moments kept" tint="pink" />
      </ScrollView>

      <Text style={[styles.title, { color: theme.colors.text.primary }]}>Your timeline</Text>
      <PRISMChipGroup
        options={FILTERS}
        value={[filter]}
        onChange={(next) => setFilter((next[0] as Filter | undefined) ?? 'all')}
      />
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <ScreenGlow colors={['violet', 'pink']} />
      <TopBar title="You" />
      {isLoading ? (
        <ScrollView contentContainerStyle={styles.content}>
          {header}
          <View style={styles.skeletons}>
            <PRISMSkeleton height={56} />
            <PRISMSkeleton height={56} />
          </View>
        </ScrollView>
      ) : isError ? (
        <ScrollView contentContainerStyle={styles.content}>
          {header}
          <PRISMErrorState onRetry={() => refetch()} />
        </ScrollView>
      ) : (
        <PRISMTimeline
          contentContainerStyle={styles.content}
          header={header}
          empty={
            all.length === 0 ? (
              <View>
                <Text style={[styles.emptyBody, { color: theme.colors.text.secondary }]}>
                  Milestones, journal entries, appointments and doses all land here, in order. Add
                  one to begin.
                </Text>
                <TimelinePrompts variant="list" />
              </View>
            ) : (
              <Text style={[styles.emptyBody, { color: theme.colors.text.secondary }]}>
                Nothing here for this filter yet.
              </Text>
            )
          }
          events={visible.map((event) => ({
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
      )}
    </SafeAreaView>
  );
}

function formatEventDate(at: string): string {
  return new Date(at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.smd,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 68,
    height: 68,
  },
  avatarText: {
    fontFamily: fontFamily.display,
    fontSize: type.headingXL.fontSize,
    fontWeight: fontWeight.bold as '700',
  },
  profileText: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: fontFamily.display,
    fontSize: type.displayM.fontSize,
    lineHeight: type.displayM.lineHeight,
    fontWeight: fontWeight.bold as '700',
  },
  since: {
    fontSize: type.bodyM.fontSize,
    lineHeight: type.bodyM.lineHeight,
  },
  profileButtons: {
    flexDirection: 'row',
    gap: spacing.smd,
  },
  profileButton: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: type.caption.fontSize,
    lineHeight: type.caption.lineHeight,
    fontWeight: fontWeight.semibold as '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: spacing.sm,
  },
  chipsScroll: {
    flexGrow: 0,
  },
  chips: {
    alignItems: 'flex-start',
    gap: spacing.smd,
    paddingRight: spacing.lg,
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: type.headingL.fontSize,
    lineHeight: type.headingL.lineHeight,
    fontWeight: fontWeight.semibold as '600',
    marginTop: spacing.md,
  },
  skeletons: {
    gap: spacing.sm,
  },
  emptyBody: {
    fontSize: type.bodyM.fontSize,
    lineHeight: type.bodyM.lineHeight,
    marginTop: spacing.sm,
  },
});
