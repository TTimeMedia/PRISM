import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, type Href } from 'expo-router';
import type { P0ModuleKey, TodayItem } from '@prism/types';
import type { LucideIcon } from 'lucide-react-native';
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
import { useAppStore } from '../../../lib/store/appStore';
import { formatTodayDate, timeOfDayGreeting } from '../greeting';
import { observanceFor } from '../observances';

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
  const [marking, setMarking] = useState(false);

  const name = profile?.display_name?.trim();
  const greeting = name ? `${timeOfDayGreeting()}, ${name}.` : `${timeOfDayGreeting()}.`;
  const celebrationDays = useAppStore((state) => state.celebrationDays);
  const observance = celebrationDays ? observanceFor() : null;
  const enabled = new Set(modules?.filter((m) => m.enabled).map((m) => m.module_key));
  const actions = ADD_ACTIONS.filter((action) => !action.module || enabled.has(action.module));
  const calendar = useCalendarSuggestions(enabled.has('appointments'));

  const comingUp = selectComingUpItems(items ?? [], 5);
  const [next, ...after] = comingUp;
  const recent = (items ?? []).filter(
    (item) => item.moduleKey !== 'medications' && !comingUp.some((c) => c.id === item.id),
  );

  // Logging from Today is one tap, so a mis-tap is one tap to reverse: Undo on the toast.
  const logDose = async (item: TodayItem) => {
    setMarking(true);
    try {
      const log = await createLog.mutateAsync({
        medication_id: item.sourceId,
        scheduled_at: item.at,
        completed_at: new Date().toISOString(),
        status: 'completed',
      });
      showToast('Dose logged.', 'success', {
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
      setMarking(false);
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
          {observance ? (
            <Text style={[styles.observance, { color: theme.accent }]}>{observance}</Text>
          ) : null}
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
            {next ? (
              <NextUpCard item={next} logging={marking} onLogDose={() => logDose(next)} />
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
          <PRISMButton label="Log dose" variant="secondary" loading={logging} onPress={onLogDose} />
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
  observance: {
    fontSize: type.bodyL.fontSize,
    lineHeight: type.bodyL.lineHeight,
    fontWeight: fontWeight.semibold as '600',
    marginTop: spacing.sm,
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
});
