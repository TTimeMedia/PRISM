/**
 * Types for the TODAY personalization engine.
 * See docs/TECHNICAL_BIBLE.md §10 and docs/MASTER_BUILD_SPEC.md §05/§07.
 */
import type { ModuleKey } from './modules';

/** How the personalization engine classifies a record for TODAY. */
export type RelevanceBucket = 'due_today' | 'upcoming' | 'recent' | 'meaningful' | 'hidden';

export interface TodayItem {
  id: string;
  moduleKey: ModuleKey;
  bucket: RelevanceBucket;
  /** Reference to the source record (e.g. a medication_logs.id). */
  sourceId: string;
  title: string;
  subtitle?: string;
  /** ISO datetime this item is relevant at/around, used for ranking. */
  at: string;
}
