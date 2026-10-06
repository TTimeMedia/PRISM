import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CalendarArrowDown } from 'lucide-react-native';
import { PRISMButton, fontWeight, radius, spacing, type, useTheme, useToast } from '@prism/ui';
import type { CalendarEventSummary } from '../../../lib/calendar';
import { formatComingUpWhen } from '../../../lib/today/comingUp';
import { SectionTitle, useTint } from '../../../components/home';

export interface CalendarSuggestionsProps {
  suggestions: CalendarEventSummary[];
  onAdd: (event: CalendarEventSummary) => Promise<void>;
  onDismiss: (event: CalendarEventSummary) => void;
}

/**
 * "From your calendar": upcoming events that look like appointments, each
 * one tap from Prism. Shown only when calendar suggestions are on.
 */
export function CalendarSuggestions({ suggestions, onAdd, onDismiss }: CalendarSuggestionsProps) {
  if (suggestions.length === 0) return null;
  return (
    <>
      <SectionTitle title="From your calendar" />
      <View style={styles.list}>
        {suggestions.map((event) => (
          <SuggestionCard key={event.id} event={event} onAdd={onAdd} onDismiss={onDismiss} />
        ))}
      </View>
    </>
  );
}

function SuggestionCard({
  event,
  onAdd,
  onDismiss,
}: {
  event: CalendarEventSummary;
  onAdd: (event: CalendarEventSummary) => Promise<void>;
  onDismiss: (event: CalendarEventSummary) => void;
}) {
  const theme = useTheme();
  const tint = useTint('violet');
  const { showToast } = useToast();
  const [adding, setAdding] = useState(false);

  const add = async () => {
    setAdding(true);
    try {
      await onAdd(event);
      showToast('Added to your appointments.', 'success');
    } catch {
      showToast("Couldn't add that. Try again.", 'error');
      setAdding(false);
    }
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border.subtle },
      ]}
    >
      <View style={styles.top}>
        <View style={[styles.icon, { backgroundColor: tint.tile }]}>
          <CalendarArrowDown size={20} color={theme.colors.text.primary} strokeWidth={2.2} />
        </View>
        <View style={styles.text}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]} numberOfLines={2}>
            {event.title}
          </Text>
          <Text style={[styles.detail, { color: theme.colors.text.secondary }]}>
            {formatComingUpWhen(event.startsAt)}
          </Text>
          {event.location ? (
            <Text style={[styles.detail, { color: theme.colors.text.tertiary }]} numberOfLines={1}>
              {event.location}
            </Text>
          ) : null}
        </View>
      </View>
      <View style={styles.actions}>
        <View style={styles.primary}>
          <PRISMButton label="Add to Prism" loading={adding} onPress={add} />
        </View>
        <PRISMButton label="Not this one" variant="tertiary" onPress={() => onDismiss(event)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.smd,
  },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.smd,
  },
  top: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
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
  detail: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  primary: {
    flex: 1,
  },
});
