import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { BookOpen, CalendarDays, Flag, Pill, type LucideIcon } from 'lucide-react-native';
import type { ModuleKey } from '@prism/types';
import { fontFamily, fontWeight, radius, spacing, type, useTheme } from '@prism/ui';
import { useModules } from '../../../lib/profile/queries';
import { useTint, type Tint } from '../../../components/home/tint';

interface Prompt {
  module: ModuleKey;
  label: string;
  hint: string;
  icon: LucideIcon;
  tint: Tint;
  href: Href;
}

const PROMPTS: Prompt[] = [
  {
    module: 'milestones',
    label: 'Add a milestone',
    hint: 'A moment worth remembering, with a photo if you like.',
    icon: Flag,
    tint: 'pink',
    href: '/journey/milestones/add',
  },
  {
    module: 'journal',
    label: 'Write a journal entry',
    hint: 'How today felt, in your own words.',
    icon: BookOpen,
    tint: 'mint',
    href: '/journey/journal/add',
  },
  {
    module: 'appointments',
    label: 'Add an appointment',
    hint: 'Visits show up here on the day they happen.',
    icon: CalendarDays,
    tint: 'yellow',
    href: '/care/appointments/add',
  },
  {
    module: 'medications',
    label: 'Log a dose',
    hint: 'Each dose you log lands on your timeline.',
    icon: Pill,
    tint: 'cyan',
    href: '/care/medications',
  },
];

/** Only offers the features the person has turned on under Customize. */
function useEnabledPrompts(): Prompt[] {
  const { data: modules } = useModules();
  if (!modules) return PROMPTS;
  return PROMPTS.filter((prompt) => modules.find((m) => m.module_key === prompt.module)?.enabled);
}

function PromptCard({ prompt }: { prompt: Prompt }) {
  const theme = useTheme();
  const colors = useTint(prompt.tint);
  const Icon = prompt.icon;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={prompt.label}
      onPress={() => router.push(prompt.href)}
      style={[
        styles.card,
        { backgroundColor: colors.soft, borderColor: colors.border },
        theme.scheme === 'light' && theme.shadow,
      ]}
    >
      <View style={[styles.iconTile, { backgroundColor: colors.tile }]}>
        <Icon size={22} color={theme.colors.text.primary} strokeWidth={2} />
      </View>
      <View style={styles.cardText}>
        <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>{prompt.label}</Text>
        <Text style={[styles.cardHint, { color: theme.colors.text.secondary }]}>{prompt.hint}</Text>
      </View>
    </Pressable>
  );
}

function PromptChip({ prompt }: { prompt: Prompt }) {
  const theme = useTheme();
  const colors = useTint(prompt.tint);
  const Icon = prompt.icon;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={prompt.label}
      onPress={() => router.push(prompt.href)}
      style={[styles.chip, { backgroundColor: colors.soft, borderColor: colors.border }]}
    >
      <Icon size={16} color={theme.colors.text.primary} strokeWidth={2.2} />
      <Text style={[styles.chipLabel, { color: theme.colors.text.primary }]}>{prompt.label}</Text>
    </Pressable>
  );
}

/**
 * Nudges people to fill their timeline by using the rest of Prism. The
 * timeline is a view over milestones, journal entries, appointments and
 * doses, so each prompt opens the screen that adds one.
 *
 * `list` is the empty-state version (big tappable cards); `strip` is a
 * compact scrolling row shown above an existing timeline.
 */
export function TimelinePrompts({ variant }: { variant: 'list' | 'strip' }) {
  const theme = useTheme();
  const prompts = useEnabledPrompts();
  if (prompts.length === 0) return null;

  if (variant === 'strip') {
    return (
      <View style={styles.strip}>
        <Text style={[styles.stripTitle, { color: theme.colors.text.secondary }]}>
          Add to your timeline
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.stripRow}
        >
          {prompts.map((prompt) => (
            <PromptChip key={prompt.module} prompt={prompt} />
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {prompts.map((prompt) => (
        <PromptCard key={prompt.module} prompt={prompt} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    gap: spacing.xs,
    paddingBottom: spacing.sm,
  },
  stripTitle: {
    fontSize: type.caption.fontSize,
    lineHeight: type.caption.lineHeight,
    fontWeight: fontWeight.semibold as '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  stripRow: {
    gap: spacing.xs,
    paddingRight: spacing.lg,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  chipLabel: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
    fontWeight: fontWeight.medium as '500',
  },
  list: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    minHeight: 72,
  },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontFamily: fontFamily.display,
    fontSize: type.bodyL.fontSize,
    lineHeight: type.bodyL.lineHeight,
    fontWeight: fontWeight.semibold as '600',
  },
  cardHint: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
  },
});
