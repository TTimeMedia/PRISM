import * as Calendar from 'expo-calendar';
import type { CalendarAppointmentInput, CalendarEventSummary, CalendarProvider } from './types';

/**
 * iOS device-calendar provider (EventKit, via expo-calendar). Adding an
 * appointment needs only write-only access. Reading events (Import from
 * calendar) asks for full access separately, and only when someone taps
 * Import.
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

  async requestReadPermission() {
    const { granted } = await Calendar.requestCalendarPermissions(false);
    return granted;
  },

  async listUpcomingEvents(days = 120) {
    const start = new Date();
    const end = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
    // Events only. Without an entity type, EventKit also wants Reminders access,
    // which Prism never asks for, so listing calendars would fail.
    const calendars = await Calendar.getCalendars(Calendar.EntityTypes.EVENT);
    if (calendars.length === 0) return [];
    const events = await Calendar.listEvents(calendars, start, end);
    // Every calendar on the phone, across every account (iCloud, Google, ...).
    const byId = new Map(calendars.map((calendar) => [calendar.id, calendar]));
    return events
      .map((event): CalendarEventSummary => ({
        id: event.id,
        title: event.title || 'Untitled event',
        location: event.location || null,
        notes: event.notes || null,
        startsAt: new Date(event.startDate).toISOString(),
        endsAt: event.endDate ? new Date(event.endDate).toISOString() : null,
        allDay: !!event.allDay,
        calendarId: event.calendarId,
        calendarName: byId.get(event.calendarId)?.title || 'Calendar',
        accountName: byId.get(event.calendarId)?.source?.name || null,
      }))
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
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
