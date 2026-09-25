import type { Href } from 'expo-router';
import type { ModuleKey, TodayItem } from '@prism/types';

const COMING_UP_BUCKETS = new Set(['due_today', 'upcoming']);
const DEFAULT_LIMIT = 4;

/**
 * "Coming Up" on TODAY — the next concretely-dated items (due today or
 * upcoming), already chronologically sorted by rankItems
 * (services/personalization/engine.ts), capped to a short, scannable
 * list rather than the whole schedule. Purely a display-side slice of
 * the same real data TODAY's main feed already uses — never a separate
 * fetch, never invented content.
 */
export function selectComingUpItems(
  items: TodayItem[],
  limit: number = DEFAULT_LIMIT,
): TodayItem[] {
  return items.filter((item) => COMING_UP_BUCKETS.has(item.bucket)).slice(0, limit);
}

/** "Today, 9:00 AM" / "Tomorrow, 9:00 AM" / "Fri, Jun 20" — respects device locale via toLocaleString. */
export function formatComingUpWhen(at: string, now: Date = new Date()): string {
  const date = new Date(at);
  const time = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

  if (isSameCalendarDay(date, now)) return `Today, ${time}`;

  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  if (isSameCalendarDay(date, tomorrow)) return `Tomorrow, ${time}`;

  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Where tapping a "Coming Up" item goes — its own record, since TODAY
 * never duplicates data, only surfaces it (same principle as Timeline —
 * see TimelineScreen.tsx's own header). Medications route to their
 * detail page (which already shows "Next dose" — see
 * features/care/medicationDisplay.ts), not log history: an upcoming
 * item is about the dose that's coming, not a past log entry.
 */
export function comingUpItemHref(item: TodayItem): Href {
  return recordHref(item.moduleKey, item.sourceId);
}

function recordHref(moduleKey: ModuleKey, sourceId: string): Href {
  switch (moduleKey) {
    case 'medications':
      return `/care/medications/${sourceId}`;
    case 'appointments':
      return `/care/appointments/${sourceId}`;
    case 'milestones':
      return `/journey/milestones/${sourceId}`;
    case 'journal':
      return `/journey/journal/${sourceId}`;
    default:
      return '/journey/timeline';
  }
}

/** "in 25 minutes", "in 3 hours", "tomorrow", "in 4 days", or "15 minutes ago" for something just past. */
export function formatRelativeTime(at: string, now: Date = new Date()): string {
  const diffMs = new Date(at).getTime() - now.getTime();
  const minutes = Math.round(Math.abs(diffMs) / 60000);
  const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? '' : 's'}`;
  if (minutes < 1) return 'now';
  if (diffMs < 0) {
    if (minutes < 60) return `${plural(minutes, 'minute')} ago`;
    const hours = Math.round(minutes / 60);
    return hours < 24 ? `${plural(hours, 'hour')} ago` : 'earlier';
  }
  if (minutes < 60) return `in ${plural(minutes, 'minute')}`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `in ${plural(hours, 'hour')}`;
  const days = Math.round(hours / 24);
  return days === 1 ? 'tomorrow' : `in ${days} days`;
}
