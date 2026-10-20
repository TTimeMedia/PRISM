import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, type Href } from 'expo-router';
import type { P0ModuleKey, TodayItem } from '@prism/types';
import { Check, type LucideIcon } from 'lucide-react-native';
import {
  PRISMButton,
  PRISMErrorState,
  PRISMSkeleton,
  fontFamily,
  fontWeight,
  radius,
  spacing,
  type,
  useTheme,
  useToast,
} from '@prism/ui';
import { useModules, useProfile } from '../../../lib/profile/queries';
import { useTodayItems } from '../../../lib/today/queries';
import { useCreateMedicationLog, useUndoMedicationLog } from '../../../lib/care/mutations';
import { useSignedEntryImageUrl } from '../../../lib/journey/useSignedEntryImageUrl';
import { milestoneIconFor } from '../../journey/milestoneIcons';
import { useCalendarSuggestions } from '../../../lib/calendar/useCalendarSuggestions';
import { CalendarSuggestions } from '../components/CalendarSuggestions';
import { AnalyticsPrompt } from '../components/AnalyticsPrompt';
import {
  comingUpItemHref,
  formatComingUpWhen,
  formatRelativeTime,
  selectComingUpItems,
} from '../../../lib/today/comingUp';
import {
  ActionTile,
  HeroCard,
  ItemRow,
  ScreenGlow,
  SectionTitle,
  useTint,
  type Tint,
} from '../../../components/home';
import { CustomizeTip } from '../../../components/home/CustomizeTip';
import { TopBar } from '../../../components/home/TopBar';
import { MODULE_STYLE, moduleStyle } from '../../../components/home/moduleStyle';
import { formatTodayDate, timeOfDayGreeting } from '../greeting';

interface AddAction {
  key: string;
  /** Shown only while this feature is on; actions without one always show. */
  module?: P0ModuleKey;
  label: string;
  href: Href;
  /** Defaults to the feature's own look. */
  icon?: LucideIcon;
  tint?: Tint;
}

/** What each feature offers to start from Today, in the order they appear. */
const ADD_ACTIONS: AddAction[] = [
  { key: 'journal', module: 'journal', label: 'Write in my journal', href: '/journey/journal/add' },
  {
    key: 'milestone',
    module: 'milestones',
    label: 'Add a milestone',
    href: '/journey/milestones/add',
  },
];

/**
 * TODAY — Screen 20. One clear next step on top (what's coming up, with the
 * one button that does it), the ways to add something below, then what's
 * coming after that. Built from the personalization engine's real data,
 * never invented content — see docs/SCREEN_BIBLE.md Screen 20 and
 * docs/TECHNICAL_BIBLE.md §10.
 */
export function TodayScreen() {
  const theme = useTheme();
  const { showToast } = useToast();
  const { data: profile } = useProfile();
  const { data: modules } = useModules();
  const { data: items, isLoading, isError, refetch } = useTodayItems();
  const createLog = useCreateMedicationLog();
  const undoLog = useUndoMedicationLog();
  // Which dose is being logged right now, so only its button spins.
  const [loggingId, setLoggingId] = useState<string | null>(null);

  const name = profile?.display_name?.trim();
  const greeting = name ? `${timeOfDayGreeting()}, ${name}.` : `${timeOfDayGreeting()}.`;
  const enabled = new Set(modules?.filter((m) => m.enabled).map((m) => m.module_key));
  const actions = ADD_ACTIONS.filter((action) => !action.module || enabled.has(action.module));
  const calendar = useCalendarSuggestions(enabled.has('appointments'));

  // Every medication due today, done or not: with two or more, or once one is
  // logged, they all go in the top card as today's checklist.
  const dueMeds = (items ?? []).filter(
    (item) => item.moduleKey === 'medications' && item.bucket === 'due_today',
  );
  const showDueList = dueMeds.length > 1 || dueMeds.some((item) => item.doneAt);
  const comingUp = selectComingUpItems(
    showDueList ? (items ?? []).filter((item) => !dueMeds.includes(item)) : (items ?? []),
    5,
  );
  const next = showDueList ? undefined : comingUp[0];
  const after = showDueList ? comingUp : comingUp.slice(1);
  const recent = (items ?? []).filter(
    (item) =>
      item.moduleKey !== 'medications' &&
      !comingUp.some((c) => c.id === item.id) &&
      !dueMeds.some((d) => d.id === item.id),
  );

  // Logging from Today is one tap, so a mis-tap is one tap to reverse: Undo on the toast.
  const logDose = async (item: TodayItem) => {
    setLoggingId(item.id);
    try {
      const log = await createLog.mutateAsync({
        medication_id: item.sourceId,
        scheduled_at: item.at,
        completed_at: new Date().toISOString(),
        status: 'completed',
      });
      showToast('Logged.', 'success', {
        label: 'Undo',
        onPress: () => {
          undoLog.mutate(log.id, {
            onSuccess: () => showToast('Removed.'),
            onError: () => showToast("Couldn't undo that. Open the medication to fix it.", 'error'),
          });
        },
      });
    } catch {
      showToast("Couldn't log that. Open it to log it.", 'error');
    } finally {
      setLoggingId(null);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <ScreenGlow colors={['cyan', 'violet']} />
      <TopBar title="Today" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text
            accessibilityRole="header"
            style={[
              styles.greeting,
              { fontFamily: theme.fonts.display },
              { color: theme.colors.text.primary },
            ]}
          >
            {greeting}
          </Text>
          <Text style={[styles.date, { color: theme.colors.text.secondary }]}>
            {formatTodayDate()}
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.skeletons}>
            <PRISMSkeleton height={168} />
            <PRISMSkeleton height={72} />
          </View>
        ) : isError ? (
          <PRISMErrorState onRetry={() => refetch()} />
        ) : (
          <>
            {showDueList ? (
              <DueMedicationsCard items={dueMeds} loggingId={loggingId} onLogDose={logDose} />
            ) : next ? (
              <NextUpCard
                item={next}
                logging={loggingId === next.id}
                onLogDose={() => logDose(next)}
              />
            ) : (
              <HeroCard tint="mint" accentTint="cyan">
                <Text
                  style={[
                    styles.heroTitle,
                    { fontFamily: theme.fonts.display },
                    { color: theme.colors.text.primary },
                  ]}
                >
                  You&apos;re all caught up.
                </Text>
                <Text style={[styles.heroBody, { color: theme.colors.text.secondary }]}>
                  Nothing is due right now. Add something below, or come back later.
                </Text>
              </HeroCard>
            )}

            {actions.length > 0 ? (
              <>
                <SectionTitle title="Add something" />
                <View style={styles.tiles}>
                  {actions.map((action) => {
                    const style = action.module ? MODULE_STYLE[action.module] : null;
                    return (
                      <ActionTile
                        key={action.key}
                        icon={action.icon ?? style!.icon}
                        tint={action.tint ?? style!.tint}
                        label={action.label}
                        onPress={() => router.push(action.href)}
                      />
                    );
                  })}
                </View>
              </>
            ) : null}

            <CalendarSuggestions
              suggestions={calendar.suggestions}
              onAdd={calendar.add}
              onDismiss={calendar.dismiss}
            />

            {after.length > 0 ? (
              <>
                <SectionTitle
                  title="Coming up"
                  actionLabel="Timeline"
                  onAction={() => router.push('/you')}
                />
                <View style={styles.list}>
                  {after.map((item) => {
                    const style = moduleStyle(item.moduleKey);
                    return (
                      <ItemRow
                        key={item.id}
                        icon={style.icon}
                        tint={style.tint}
                        title={item.title}
                        subtitle={formatComingUpWhen(item.at)}
                        onPress={() => router.push(comingUpItemHref(item))}
                      />
                    );
                  })}
                </View>
              </>
            ) : null}

            {recent.length > 0 ? (
              <>
                <SectionTitle title="Lately" />
                <View style={styles.list}>
                  {recent.slice(0, 3).map((item) => {
                    const style = moduleStyle(item.moduleKey);
                    const milestone = item.moduleKey === 'milestones';
                    return (
                      <ItemRow
                        key={item.id}
                        // A milestone shows its first photo, or the icon that fits it.
                        icon={milestone ? milestoneIconFor(item.icon, item.subtitle) : style.icon}
                        media={
                          milestone && item.imagePath ? (
                            <TilePhoto path={item.imagePath} label={item.title} />
                          ) : undefined
                        }
                        tint={style.tint}
                        title={item.title}
                        subtitle={item.subtitle}
                        onPress={() => router.push(comingUpItemHref(item))}
                      />
                    );
                  })}
                </View>
              </>
            ) : null}

            <AnalyticsPrompt />
            <CustomizeTip />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/** A milestone's photo, filling a list row's icon tile. */
function TilePhoto({ path, label }: { path: string; label: string }) {
  const { data: uri } = useSignedEntryImageUrl(path);
  return uri ? (
    <Image
      source={{ uri }}
      style={styles.tilePhoto}
      resizeMode="cover"
      accessibilityLabel={`Photo for ${label}`}
    />
  ) : null;
}

/**
 * Today's checklist of doses: every medication due today, soonest first. One
 * still to take has its own Log button; one already logged (here, on its
 * page or on the Apple Watch) stays with a tick and the time it was logged,
 * so the day's progress is plain at a glance.
 */
function DueMedicationsCard({
  items,
  loggingId,
  onLogDose,
}: {
  items: TodayItem[];
  loggingId: string | null;
  onLogDose: (item: TodayItem) => void;
}) {
  const theme = useTheme();
  const style = moduleStyle('medications');
  const colors = useTint(style.tint);
  const Icon = style.icon;
  const done = items.filter((item) => item.doneAt).length;
  const left = items.length - done;
  // Worded around the day, not "doses": it fits pills, patches, gels and shots alike.
  const title = left === 0 ? 'All done for today' : `${left} left for today`;
  const timeOf = (iso: string) =>
    new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

  return (
    <HeroCard tint={style.tint} accentTint="violet">
      <View style={styles.heroTop}>
        <View style={[styles.badge, { backgroundColor: colors.tile }]}>
          <Icon size={16} color={theme.colors.text.primary} strokeWidth={2.4} />
          <Text style={[styles.badgeText, { color: theme.colors.text.primary }]}>Today</Text>
        </View>
        <Text style={[styles.relative, { color: theme.colors.text.secondary }]}>
          {done} of {items.length} done
        </Text>
      </View>
      <Text
        style={[
          styles.heroTitle,
          { fontFamily: theme.fonts.display },
          { color: theme.colors.text.primary },
        ]}
      >
        {title}
      </Text>
      <View
        style={[styles.progressTrack, { backgroundColor: theme.colors.border.subtle }]}
        accessibilityRole="progressbar"
        accessibilityLabel={`${done} of ${items.length} done today`}
        accessibilityValue={{ min: 0, max: items.length, now: done }}
      >
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: theme.spectrum.mint,
              width: `${Math.round((done / items.length) * 100)}%`,
            },
          ]}
        />
      </View>
      <View style={styles.dueList}>
        {items.map((item) => {
          const detail = item.doneAt
            ? [item.subtitle, `logged ${timeOf(item.doneAt)}`].filter(Boolean).join(' · ')
            : item.subtitle
              ? `${timeOf(item.at)} · ${item.subtitle}`
              : timeOf(item.at);
          return (
            <View
              key={item.id}
              style={[styles.dueRow, { borderTopColor: theme.colors.border.subtle }]}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${item.title}, ${item.doneAt ? 'done, ' : ''}${detail}`}
                accessibilityHint="Opens this medication"
                onPress={() => router.push(comingUpItemHref(item))}
                style={({ pressed }) => [styles.dueText, { opacity: pressed ? 0.7 : 1 }]}
              >
                <Text
                  style={[
                    styles.dueTitle,
                    {
                      color: item.doneAt ? theme.colors.text.secondary : theme.colors.text.primary,
                    },
                  ]}
                  numberOfLines={2}
                >
                  {item.title}
                </Text>
                <Text style={[styles.dueDetail, { color: theme.colors.text.secondary }]}>
                  {detail}
                </Text>
              </Pressable>
              {item.doneAt ? (
                <View
                  style={[styles.doneTick, { backgroundColor: theme.spectrum.mint }]}
                  accessible={false}
                >
                  <Check size={18} color="#10302A" strokeWidth={3} />
                </View>
              ) : (
                <PRISMButton
                  label="Log"
                  variant="secondary"
                  accessibilityLabel={`Log ${item.title}`}
                  loading={loggingId === item.id}
                  disabled={loggingId !== null && loggingId !== item.id}
                  onPress={() => onLogDose(item)}
                />
              )}
            </View>
          );
        })}
      </View>
    </HeroCard>
  );
}

/**
 * The single most important thing right now. View opens it; a dose due today
 * also offers Log dose, as the smaller button so it isn't tapped by accident.
 * A dose that isn't due today can't be logged from here.
 */
function NextUpCard({
  item,
  logging,
  onLogDose,
}: {
  item: TodayItem;
  logging: boolean;
  onLogDose: () => void;
}) {
  const theme = useTheme();
  const style = moduleStyle(item.moduleKey);
  const colors = useTint(style.tint);
  const Icon = style.icon;
  const canLog = item.moduleKey === 'medications' && item.bucket === 'due_today';
  const label = item.bucket === 'due_today' ? 'Due today' : 'Up next';

  return (
    <HeroCard tint={style.tint} accentTint="violet">
      <View style={styles.heroTop}>
        <View style={[styles.badge, { backgroundColor: colors.tile }]}>
          <Icon size={16} color={theme.colors.text.primary} strokeWidth={2.4} />
          <Text style={[styles.badgeText, { color: theme.colors.text.primary }]}>{label}</Text>
        </View>
        <Text style={[styles.relative, { color: theme.colors.text.secondary }]}>
          {formatRelativeTime(item.at)}
        </Text>
      </View>
      <Text
        style={[
          styles.heroTitle,
          { fontFamily: theme.fonts.display },
          { color: theme.colors.text.primary },
        ]}
        numberOfLines={2}
      >
        {item.title}
      </Text>
      <Text style={[styles.heroBody, { color: theme.colors.text.secondary }]}>
        {formatComingUpWhen(item.at)}
        {item.subtitle ? ` · ${item.subtitle}` : ''}
      </Text>
      <View style={styles.heroActions}>
        <View style={styles.heroPrimary}>
          <PRISMButton label="View" onPress={() => router.push(comingUpItemHref(item))} />
        </View>
        {canLog ? (
          <PRISMButton
            label="Log"
            variant="secondary"
            accessibilityLabel={`Log ${item.title}`}
            loading={logging}
            onPress={onLogDose}
          />
        ) : null}
      </View>
    </HeroCard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tilePhoto: {
    width: '100%',
    height: '100%',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  greeting: {
    fontFamily: fontFamily.display,
    fontSize: type.displayM.fontSize,
    lineHeight: type.displayM.lineHeight,
    fontWeight: fontWeight.bold as '700',
  },
  date: {
    fontSize: type.bodyM.fontSize,
    lineHeight: type.bodyM.lineHeight,
    marginTop: spacing.xs,
  },
  skeletons: {
    gap: spacing.sm,
  },
  tiles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.smd,
  },
  list: {
    gap: spacing.sm,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.smd,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: type.caption.fontSize,
    lineHeight: type.caption.lineHeight,
    fontWeight: fontWeight.bold as '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  relative: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
    fontWeight: fontWeight.semibold as '600',
  },
  heroTitle: {
    fontFamily: fontFamily.display,
    fontSize: type.headingXL.fontSize + 2,
    lineHeight: type.headingXL.lineHeight + 4,
    fontWeight: fontWeight.bold as '700',
  },
  heroBody: {
    fontSize: type.bodyM.fontSize,
    lineHeight: type.bodyM.lineHeight,
  },
  heroActions: {
    flexDirection: 'row',
    gap: spacing.smd,
    marginTop: spacing.sm,
  },
  heroPrimary: {
    flex: 1,
  },
  dueList: {
    marginTop: spacing.xs,
  },
  progressTrack: {
    height: 6,
    borderRadius: radius.pill,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  doneTick: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.smd,
    paddingVertical: spacing.smd,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  dueText: {
    flex: 1,
  },
  dueTitle: {
    fontSize: type.bodyL.fontSize,
    lineHeight: type.bodyL.lineHeight,
    fontWeight: fontWeight.semibold as '600',
  },
  dueDetail: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
    marginTop: 2,
  },
});
