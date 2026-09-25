import React, { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { File } from 'expo-file-system';
import { X } from 'lucide-react-native';
import {
  PRISMButton,
  PRISMHeader,
  PRISMIconButton,
  spacing,
  type,
  useTheme,
  useToast,
} from '@prism/ui';
import { parseIcs, type IcsEvent } from '../../../lib/calendar/ics';
import { isAlreadyInPrism } from '../../../lib/calendar/importCandidates';
import { useAppointments } from '../../../lib/care/queries';
import { useCreateAppointment } from '../../../lib/care/mutations';
import { ImportableEventRow } from '../components/ImportableEventRow';

type State = { status: 'loading' } | { status: 'ready'; events: IcsEvent[] } | { status: 'empty' };

const APPOINTMENTS = '/care/appointments';

/**
 * Shown when a calendar file (.ics) is opened in Prism — for example an
 * appointment attached to a clinic's email. The file is read on the phone,
 * its events are listed, and nothing is added until the person confirms.
 */
export function ImportIcsScreen() {
  const theme = useTheme();
  const { showToast } = useToast();
  const { uri } = useLocalSearchParams<{ uri?: string }>();
  const { data: existing } = useAppointments();
  const createAppointment = useCreateAppointment();
  const [state, setState] = useState<State>({ status: 'loading' });
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!uri) throw new Error('No file.');
        const events = parseIcs(await new File(uri).text());
        if (cancelled) return;
        setState(events.length > 0 ? { status: 'ready', events } : { status: 'empty' });
        // Tick everything that isn't in Prism yet.
        setSelected(
          new Set(
            events.flatMap((event, index) =>
              isAlreadyInPrism(event, existing ?? []) ? [] : [index],
            ),
          ),
        );
      } catch {
        if (!cancelled) setState({ status: 'empty' });
      }
    })();
    return () => {
      cancelled = true;
    };
    // The file is read once per opened uri; `existing` only decides the starting ticks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uri]);

  const toggle = (index: number) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });

  const leave = () => router.replace(APPOINTMENTS);

  const add = async () => {
    if (state.status !== 'ready') return;
    const chosen = state.events.filter((_, index) => selected.has(index));
    setAdding(true);
    try {
      for (const event of chosen) {
        await createAppointment.mutateAsync({
          title: event.title,
          location: event.location,
          notes: event.notes,
          starts_at: event.startsAt,
          ends_at: event.endsAt,
          reminder_enabled: false,
        });
      }
      showToast(
        chosen.length === 1 ? 'Added 1 appointment.' : `Added ${chosen.length} appointments.`,
      );
      leave();
    } catch {
      showToast("Couldn't add that. Try again.", 'error');
    } finally {
      setAdding(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PRISMHeader
        title="Add to Prism"
        leading={
          <PRISMIconButton accessibilityLabel="Close" onPress={leave}>
            <X size={22} color={theme.colors.text.primary} />
          </PRISMIconButton>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        {state.status === 'loading' ? (
          <Text style={[styles.body, { color: theme.colors.text.secondary }]}>
            Reading the file…
          </Text>
        ) : null}

        {state.status === 'empty' ? (
          <View style={styles.block}>
            <Text style={[styles.body, { color: theme.colors.text.secondary }]}>
              This file doesn&apos;t have an appointment Prism can read. You can add it yourself
              from Appointments.
            </Text>
            <PRISMButton label="Go to Appointments" variant="secondary" onPress={leave} />
          </View>
        ) : null}

        {state.status === 'ready' ? (
          <View style={styles.block}>
            <Text style={[styles.body, { color: theme.colors.text.secondary }]}>
              {state.events.length === 1
                ? 'This file has one appointment. It was read on your phone, and nothing is added until you say so.'
                : 'This file has more than one appointment. Pick the ones to add. It was read on your phone, and nothing is added until you say so.'}
            </Text>
            <View style={styles.rows}>
              {state.events.map((event, index) => (
                <ImportableEventRow
                  key={`${event.title}-${event.startsAt}-${index}`}
                  title={event.title}
                  startsAt={event.startsAt}
                  allDay={event.allDay}
                  location={event.location}
                  selected={selected.has(index)}
                  alreadyAdded={isAlreadyInPrism(event, existing ?? [])}
                  onPress={() => toggle(index)}
                />
              ))}
            </View>
            <PRISMButton
              label={
                selected.size === 0
                  ? 'Pick appointments to add'
                  : selected.size === 1
                    ? 'Add 1 appointment'
                    : `Add ${selected.size} appointments`
              }
              disabled={selected.size === 0}
              loading={adding}
              onPress={add}
            />
            <PRISMButton label="Not now" variant="tertiary" onPress={leave} />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
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
  block: {
    gap: spacing.md,
  },
  rows: {
    gap: spacing.sm,
  },
  body: {
    fontSize: type.bodyM.fontSize,
    lineHeight: type.bodyM.lineHeight,
  },
});
