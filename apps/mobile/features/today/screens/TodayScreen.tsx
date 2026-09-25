import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, type Href } from 'expo-router';
import { Bell, Sparkles } from 'lucide-react-native';
import type { P0ModuleKey, TodayItem } from '@prism/types';
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
import { useCreateMedicationLog } from '../../../lib/care/mutations';
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
} from '../../../components/home';
import { TopBar } from '../../../components/home/TopBar';
import { MODULE_STYLE, moduleStyle } from '../../../components/home/moduleStyle';
import { formatTodayDate, timeOfDayGreeting } from '../greeting';

interface AddAction {
  module: P0ModuleKey;
  label: string;
  href: Href;
}

/** What each feature offers to start from Today, in the order they appear. */
const ADD_ACTIONS: AddAction[] = [
  { module: 'medications', label: 'Log a dose', href: '/care/medications' },
  { module: 'injections', label: 'Log an injection', href: '/care/injections/add' },
  { module: 'appointments', label: 'Add an appointment', href: '/care/appointments/add' },
  { module: 'journal', label: 'Write in my journal', href: '/journey/journal/add' },
  { module: 'milestones', label: 'Add a milestone', href: '/journey/milestones/add' },
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
  const [marking, setMarking] = useState(false);

  const name = profile?.display_name?.trim();
  const greeting = name ? `${timeOfDayGreeting()}, ${name}.` : `${timeOfDayGreeting()}.`;
  const enabled = new Set(modules?.filter((m) => m.enabled).map((m) => m.module_key));
  const actions = ADD_ACTIONS.filter((action) => enabled.has(action.module));

  const comingUp = selectComingUpItems(items ?? [], 5);
  const [next, ...after] = comingUp;
  const recent = (items ?? []).filter(
    (item) => item.moduleKey !== 'medications' && !comingUp.some((c) => c.id === item.id),
  );

  const markDone = async (item: TodayItem) => {
    setMarking(true);
    try {
      await createLog.mutateAsync({
        medication_id: item.sourceId,
        scheduled_at: item.at,
        completed_at: new Date().toISOString(),
        status: 'completed',
      });
      showToast('Marked as done.');
    } catch {
      showToast("Couldn't mark that as done. Open it to log it.", 'error');
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
            style={[styles.greeting, { color: theme.colors.text.primary }]}
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
            {next ? (
              <NextUpCard item={next} marking={marking} onMarkDone={() => markDone(next)} />
            ) : (
              <HeroCard tint="mint" accentTint="cyan">
                <Text style={[styles.heroTitle, { color: theme.colors.text.primary }]}>
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
                    const style = MODULE_STYLE[action.module];
                    return (
                      <ActionTile
                        key={action.module}
                        icon={style.icon}
                        tint={style.tint}
                        label={action.label}
                        onPress={() => router.push(action.href)}
                      />
                    );
                  })}
                </View>
              </>
            ) : null}

            {after.length > 0 ? (
              <>
                <SectionTitle
                  title="Coming up"
                  actionLabel="Timeline"
                  onAction={() => router.push('/journey/timeline')}
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
                    return (
                      <ItemRow
                        key={item.id}
                        icon={style.icon}
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

            <SectionTitle title="Make it yours" />
            <View style={styles.list}>
              <ItemRow
                icon={Sparkles}
                tint="violet"
                title="Choose what Prism shows"
                subtitle="Turn parts of Prism on or off."
                onPress={() => router.push('/you/customize')}
              />
              <ItemRow
                icon={Bell}
                tint="yellow"
                title="Set up reminders"
                subtitle="Doses and appointments, when you want them."
                onPress={() => router.push('/you/notifications')}
              />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/** The single most important thing right now, with the one button that does it. */
function NextUpCard({
  item,
  marking,
  onMarkDone,
}: {
  item: TodayItem;
  marking: boolean;
  onMarkDone: () => void;
}) {
  const theme = useTheme();
  const style = moduleStyle(item.moduleKey);
  const colors = useTint(style.tint);
  const Icon = style.icon;
  const isDose = item.moduleKey === 'medications';
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
      <Text style={[styles.heroTitle, { color: theme.colors.text.primary }]} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={[styles.heroBody, { color: theme.colors.text.secondary }]}>
        {formatComingUpWhen(item.at)}
        {item.subtitle ? ` · ${item.subtitle}` : ''}
      </Text>
      <View style={styles.heroActions}>
        {isDose ? (
          <>
            <View style={styles.heroPrimary}>
              <PRISMButton label="Mark done" loading={marking} onPress={onMarkDone} />
            </View>
            <PRISMButton
              label="Details"
              variant="secondary"
              onPress={() => router.push(comingUpItemHref(item))}
            />
          </>
        ) : (
          <View style={styles.heroPrimary}>
            <PRISMButton label="Open" onPress={() => router.push(comingUpItemHref(item))} />
          </View>
        )}
      </View>
    </HeroCard>
  );
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
});
