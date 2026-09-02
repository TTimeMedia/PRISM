/**
 * Types for JOURNEY's Timeline (Screen 42) — a unified, chronological
 * view across record types. Timeline events reference their source
 * records; the timeline is a view, never a second independent copy of
 * the data. See docs/SCREEN_BIBLE.md Screens 42-43 and
 * docs/MASTER_BUILD_SPEC.md §09.
 */
import type { ModuleKey } from './modules';

export interface TimelineEvent {
  id: string;
  moduleKey: ModuleKey;
  /** Reference to the source record — Timeline never duplicates data. */
  sourceId: string;
  title: string;
  subtitle?: string;
  /** ISO datetime this event occurred at, used for chronological ordering. */
  at: string;
}
