export interface CalendarAppointmentInput {
  title: string;
  location?: string | null;
  notes?: string | null;
  startsAt: string;
  endsAt?: string | null;
}

/**
 * Seam between PRISM and whichever device/account calendar it's syncing
 * to. Only one implementation exists today (device-calendar-provider.ts,
 * backed by EventKit on iOS) — a future Google Calendar provider (OAuth,
 * not device-calendar-based) implements this same interface, so call
 * sites never need to change.
 */
export interface CalendarProvider {
  /** Requests write-only calendar access. Only ever called when the user explicitly opts in via Settings. */
  requestPermission(): Promise<boolean>;
  /** Adds an appointment to the calendar, returning the created event's id. */
  addAppointment(appointment: CalendarAppointmentInput): Promise<string>;
}
