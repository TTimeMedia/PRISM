import { deviceCalendarProvider } from './deviceCalendarProvider';
import type { CalendarProvider } from './types';

export type { CalendarAppointmentInput, CalendarProvider } from './types';

/**
 * The active calendar provider. Apple Calendar (device, via EventKit) is
 * the only one today; a Google Calendar provider would be selected here
 * later — e.g. by platform or a user preference — without changing any
 * call site, since both would implement the same CalendarProvider shape.
 */
export const calendarProvider: CalendarProvider = deviceCalendarProvider;
