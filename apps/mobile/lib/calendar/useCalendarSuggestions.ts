import { useCallback, useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { useAppStore } from '../store/appStore';
import { useAppointments } from '../care/queries';
import { useCreateAppointment } from '../care/mutations';
import { track } from '../analytics/events';
import { calendarProvider, type CalendarEventSummary } from './index';
import { SUGGESTION_WINDOW_DAYS, pickSuggestions, suggestionKey } from './suggestions';

/**
 * Appointment suggestions from the phone's calendar, for Today. Only runs
 * when the person turned suggestions on (Calendar settings) and calendar
 * access was already given; it never asks for access itself. Looks again
 * each time Prism comes back to the foreground, so an event just added in
 * another app shows up.
 */
export function useCalendarSuggestions(active: boolean) {
  const enabled = useAppStore((state) => state.calendarSuggestions);
  const dismissed = useAppStore((state) => state.dismissedSuggestions);
  const dismissSuggestion = useAppStore((state) => state.dismissSuggestion);
  const { data: existing } = useAppointments();
  const createAppointment = useCreateAppointment();
  const [events, setEvents] = useState<CalendarEventSummary[]>([]);
  const on = active && enabled && Platform.OS === 'ios';

  const refresh = useCallback(async () => {
    try {
      if (!(await calendarProvider.hasReadPermission())) {
        setEvents([]);
        return;
      }
      setEvents(await calendarProvider.listUpcomingEvents(SUGGESTION_WINDOW_DAYS));
    } catch {
      // A calendar that can't be read just means no suggestions.
      setEvents([]);
    }
  }, []);

  useEffect(() => {
    if (!on) {
      setEvents([]);
      return;
    }
    void refresh();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refresh();
    });
    return () => subscription.remove();
  }, [on, refresh]);

  const suggestions = on && existing ? pickSuggestions(events, existing, dismissed) : [];

  const add = async (event: CalendarEventSummary) => {
    await createAppointment.mutateAsync({
      title: event.title,
      location: event.location,
      notes: event.notes,
      starts_at: event.startsAt,
      ends_at: event.endsAt,
      reminder_enabled: false,
    });
    track('calendar_suggestion_added');
  };

  const dismiss = (event: CalendarEventSummary) => dismissSuggestion(suggestionKey(event));

  return { suggestions, add, dismiss };
}
