import * as Calendar from 'expo-calendar';
import type { CalendarAppointmentInput, CalendarProvider } from './types';

/**
 * iOS device-calendar provider (EventKit, via expo-calendar). Requests
 * write-only access — enough to create events without reading the
 * user's existing calendars or events.
 *
 * expo-calendar also ships a same-named "classic" API
 * (requestCalendarPermissionsAsync, createEventAsync, ...) that
 * type-checks but throws at runtime in this SDK version — this file
 * intentionally uses only the current API (requestCalendarPermissions,
 * getDefaultCalendarSync, calendar.createEvent).
 */
export const deviceCalendarProvider: CalendarProvider = {
  async requestPermission() {
    const { granted } = await Calendar.requestCalendarPermissions(true);
    return granted;
  },

  async addAppointment(appointment: CalendarAppointmentInput) {
    const calendar = Calendar.getDefaultCalendarSync();
    const event = await calendar.createEvent({
      title: appointment.title,
      location: appointment.location ?? undefined,
      notes: appointment.notes ?? undefined,
      startDate: appointment.startsAt,
      endDate: appointment.endsAt ?? appointment.startsAt,
    });
    return event.id;
  },
};
