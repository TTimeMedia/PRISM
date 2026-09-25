import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  PRISMButton,
  PRISMChipGroup,
  PRISMSheet,
  componentRadius,
  layout,
  spacing,
  type,
  useTheme,
  useToast,
} from '@prism/ui';
import { calendarProvider, type CalendarEventSummary } from '../../../lib/calendar';
import {
  calendarLabel,
  calendarsOf,
  dedupeEvents,
  isAlreadyInPrism,
  matchesSearch,
} from '../../../lib/calendar/importCandidates';
import { useAppointments } from '../../../lib/care/queries';
import { useCreateAppointment } from '../../../lib/care/mutations';
import { ImportableEventRow } from './ImportableEventRow';

type Phase = 'intro' | 'loading' | 'list' | 'denied' | 'error';

export interface CalendarImportSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Called with how many appointments were added. */
  onImported?: (count: number) => void;
}

/**
 * Import from calendar. Nothing is read until the person taps "Choose from
 * my calendar"; they then see their upcoming events and tick the ones that
 * are appointments. Only ticked events are copied into Prism; the rest are
 * never stored.
 */
export function CalendarImportSheet({ visible, onClose, onImported }: CalendarImportSheetProps) {
  const theme = useTheme();
  const { showToast } = useToast();
  const { data: existing } = useAppointments();
  const createAppointment = useCreateAppointment();
  const [phase, setPhase] = useState<Phase>('intro');
  const [events, setEvents] = useState<CalendarEventSummary[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');
  const [calendarFilter, setCalendarFilter] = useState<string>('all');
  const [importing, setImporting] = useState(false);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  const close = () => {
    setPhase('intro');
    setEvents([]);
    setSelected(new Set());
    setQuery('');
    setCalendarFilter('all');
    onClose();
  };

  const choose = async () => {
    setPhase('loading');
    try {
      const granted = await calendarProvider.requestReadPermission();
      if (!granted) {
        setPhase('denied');
        return;
      }
      setEvents(dedupeEvents(await calendarProvider.listUpcomingEvents()));
      setPhase('list');
    } catch (error) {
      // Kept short and shown, so a problem can be reported precisely.
      setErrorDetail(
        error instanceof Error ? error.message.slice(0, 200) : String(error).slice(0, 200),
      );
      setPhase('error');
    }
  };

  const calendars = useMemo(() => calendarsOf(events), [events]);
  const visibleEvents = useMemo(
    () =>
      events.filter(
        (event) =>
          (calendarFilter === 'all' || event.calendarId === calendarFilter) &&
          matchesSearch(event, query),
      ),
    [events, query, calendarFilter],
  );
  const alreadyIn = (event: CalendarEventSummary) => isAlreadyInPrism(event, existing ?? []);

  const toggle = (id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const importSelected = async () => {
    const chosen = events.filter((event) => selected.has(event.id));
    setImporting(true);
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
      onImported?.(chosen.length);
      close();
    } catch {
      showToast("Couldn't add those. Try again.", 'error');
    } finally {
      setImporting(false);
    }
  };

  return (
    <PRISMSheet visible={visible} title="Import from calendar" onRequestClose={close}>
      {phase === 'intro' || phase === 'loading' ? (
        <View style={styles.block}>
          <Text style={[styles.body, { color: theme.colors.text.secondary }]}>
            Pick appointments from your phone&apos;s calendar, including ones from your email
            accounts. Prism reads your calendar only now, on this phone, so you can choose. Only the
            ones you pick are added, and nothing else is kept.
          </Text>
          <PRISMButton
            label="Choose from my calendar"
            loading={phase === 'loading'}
            onPress={choose}
          />
          <PRISMButton label="Not now" variant="tertiary" onPress={close} />
        </View>
      ) : null}

      {phase === 'denied' ? (
        <View style={styles.block}>
          <Text style={[styles.body, { color: theme.colors.text.secondary }]}>
            Calendar access wasn&apos;t allowed, so nothing was read. You can allow it in your
            phone&apos;s Settings under Prism, then try again.
          </Text>
          <PRISMButton label="Close" variant="secondary" onPress={close} />
        </View>
      ) : null}

      {phase === 'error' ? (
        <View style={styles.block}>
          <Text style={[styles.body, { color: theme.colors.text.secondary }]}>
            Prism couldn&apos;t read the calendar just now. Check that Calendar is set up on this
            phone and try again.
          </Text>
          {errorDetail ? (
            <Text style={[styles.detail, { color: theme.colors.text.tertiary }]}>
              {errorDetail}
            </Text>
          ) : null}
          <PRISMButton label="Try again" onPress={choose} />
          <PRISMButton label="Close" variant="tertiary" onPress={close} />
        </View>
      ) : null}

      {phase === 'list' ? (
        events.length === 0 ? (
          <View style={styles.block}>
            <Text style={[styles.body, { color: theme.colors.text.secondary }]}>
              No upcoming events were found in the next few months.
            </Text>
            <PRISMButton label="Close" variant="secondary" onPress={close} />
          </View>
        ) : (
          <View style={styles.block}>
            <TextInput
              accessibilityLabel="Search events"
              value={query}
              onChangeText={setQuery}
              placeholder="Search your events"
              placeholderTextColor={theme.colors.text.tertiary}
              autoCorrect={false}
              style={[
                styles.search,
                {
                  color: theme.colors.text.primary,
                  backgroundColor: theme.colors.field,
                  borderColor: theme.colors.fieldBorder,
                },
              ]}
            />
            {calendars.length > 1 ? (
              <View style={styles.calendars}>
                <Text style={[styles.detail, { color: theme.colors.text.tertiary }]}>
                  Showing events from {calendars.length} calendars
                </Text>
                <PRISMChipGroup
                  options={[
                    { value: 'all', label: 'All calendars' },
                    ...calendars.map((calendar) => ({ value: calendar.id, label: calendar.label })),
                  ]}
                  value={[calendarFilter]}
                  onChange={(next) => setCalendarFilter(next[0] ?? 'all')}
                />
              </View>
            ) : null}
            <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
              <View style={styles.rows}>
                {visibleEvents.length === 0 ? (
                  <Text style={[styles.body, { color: theme.colors.text.secondary }]}>
                    Nothing matches that search.
                  </Text>
                ) : (
                  visibleEvents.map((event) => (
                    <ImportableEventRow
                      key={event.id}
                      title={event.title}
                      startsAt={event.startsAt}
                      allDay={event.allDay}
                      location={event.location}
                      calendarLabel={calendars.length > 1 ? calendarLabel(event) : undefined}
                      selected={selected.has(event.id)}
                      alreadyAdded={alreadyIn(event)}
                      onPress={() => toggle(event.id)}
                    />
                  ))
                )}
              </View>
            </ScrollView>
            <PRISMButton
              label={
                selected.size === 0
                  ? 'Pick appointments to add'
                  : selected.size === 1
                    ? 'Add 1 appointment'
                    : `Add ${selected.size} appointments`
              }
              disabled={selected.size === 0}
              loading={importing}
              onPress={importSelected}
            />
            <PRISMButton label="Cancel" variant="tertiary" onPress={close} />
          </View>
        )
      ) : null}
    </PRISMSheet>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.smd,
  },
  body: {
    fontSize: type.bodyM.fontSize,
    lineHeight: type.bodyM.lineHeight,
  },
  detail: {
    fontSize: type.caption.fontSize,
    lineHeight: type.caption.lineHeight,
  },
  search: {
    height: layout.inputHeight,
    borderRadius: componentRadius.input,
    borderWidth: 1.5,
    paddingHorizontal: spacing.md,
    fontSize: type.bodyL.fontSize,
  },
  calendars: {
    gap: spacing.xs,
  },
  list: {
    maxHeight: 340,
  },
  rows: {
    gap: spacing.sm,
  },
});
