import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { fontWeight, radius, spacing, type, useTheme } from '@prism/ui';

export function formatEventWhen(startsAt: string, allDay: boolean): string {
  const date = new Date(startsAt);
  return allDay
    ? date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
    : date.toLocaleString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
}

export interface ImportableEventRowProps {
  title: string;
  startsAt: string;
  allDay: boolean;
  location: string | null;
  /** Which calendar it comes from, so two accounts are easy to tell apart. */
  calendarLabel?: string;
  selected: boolean;
  /** Already in Prism: shown, but can't be picked again. */
  alreadyAdded?: boolean;
  onPress: () => void;
}

/** One calendar event a person can tick to bring into Prism. */
export function ImportableEventRow({
  title,
  startsAt,
  allDay,
  location,
  calendarLabel,
  selected,
  alreadyAdded = false,
  onPress,
}: ImportableEventRowProps) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected, disabled: alreadyAdded }}
      accessibilityLabel={title}
      disabled={alreadyAdded}
      onPress={onPress}
      style={[
        styles.row,
        {
          backgroundColor: selected ? `${theme.accent}22` : theme.colors.field,
          borderColor: selected ? theme.accent : theme.colors.fieldBorder,
          opacity: alreadyAdded ? 0.55 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.box,
          selected
            ? { backgroundColor: theme.accent, borderColor: theme.accent }
            : { borderColor: theme.colors.text.tertiary },
        ]}
      >
        {selected ? <Check size={14} color={theme.onAccent} strokeWidth={3} /> : null}
      </View>
      <View style={styles.text}>
        <Text numberOfLines={2} style={[styles.title, { color: theme.colors.text.primary }]}>
          {title}
        </Text>
        <Text style={[styles.meta, { color: theme.colors.text.secondary }]}>
          {alreadyAdded ? 'Already in Prism' : formatEventWhen(startsAt, allDay)}
        </Text>
        {calendarLabel && !alreadyAdded ? (
          <Text numberOfLines={1} style={[styles.meta, { color: theme.colors.text.tertiary }]}>
            {calendarLabel}
          </Text>
        ) : null}
        {location && !alreadyAdded ? (
          <Text numberOfLines={1} style={[styles.meta, { color: theme.colors.text.tertiary }]}>
            {location}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    minHeight: 64,
  },
  box: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: type.bodyL.fontSize,
    lineHeight: type.bodyL.lineHeight,
    fontWeight: fontWeight.semibold as '600',
  },
  meta: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
  },
});
