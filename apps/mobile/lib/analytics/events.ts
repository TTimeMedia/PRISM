import { capture } from './analytics';

/**
 * Every event Prism can send. Only these names exist, so nothing else can be
 * sent by accident. None carries anything the person wrote or recorded:
 * "dose_logged" says a dose was logged, never which medication or how much.
 * Adding an event means adding it here and to the privacy policy's
 * description if it's a new kind.
 */
export type AnalyticsEvent =
  | 'app_opened'
  | 'screen_viewed'
  | 'onboarding_completed'
  | 'dose_logged'
  | 'medication_added'
  | 'appointment_added'
  | 'appointments_imported'
  | 'calendar_suggestion_added'
  | 'journal_entry_added'
  | 'milestone_added'
  | 'support_request_sent'
  | 'theme_changed';

type SafeProperties = Record<string, string | number | boolean>;

export function track(event: AnalyticsEvent, properties?: SafeProperties): void {
  capture(event, properties);
}

/** A route with record IDs replaced, e.g. /care/medications/:id, so no ID ever leaves the phone. */
export function screenName(pathname: string): string {
  return (
    pathname
      .split('/')
      .map((part) => (/^[0-9a-f-]{16,}$/i.test(part) || /^\d+$/.test(part) ? ':id' : part))
      .join('/') || '/'
  );
}
