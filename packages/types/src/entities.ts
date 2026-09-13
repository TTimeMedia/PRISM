/**
 * PRISM core entity types.
 *
 * These mirror the canonical schema in docs/MASTER_BUILD_SPEC.md §18
 * exactly (column names, nullability, defaults). This file is the
 * single source of truth for the data shape shared across the mobile
 * app, web app, and Supabase migrations — do not redefine these shapes
 * elsewhere.
 *
 * PRISM stores and organizes what the user tells it. Nothing here
 * calculates, recommends, or interprets medical information — see
 * docs/PRODUCT_BIBLE.md §12 (Product Boundaries).
 */
import type { ModuleKey } from './modules';
import type { JourneyStage } from './onboarding';

export type UUID = string;
/** ISO 8601 timestamp string, always stored/transmitted in UTC. */
export type ISODateTime = string;
/** ISO 8601 date string (YYYY-MM-DD), no time/timezone component. */
export type ISODate = string;

export interface Profile {
  id: UUID;
  user_id: UUID;
  display_name: string | null;
  pronouns: string | null;
  gender: string | null;
  birthday: ISODate | null;
  journey_start_date: ISODate | null;
  profile_photo_url: string | null;
  onboarding_completed: boolean;
  /** Screen 10 (Journey Stage) — optional, never rendered as a progress meter. */
  journey_stage: JourneyStage | null;
  /** Screen 09 (What Brings You Here?) — multi-select intent, also gates whether Appointment Setup appears. */
  intent: string[] | null;
  /** Resume point for an interrupted onboarding flow — see @prism/types OnboardingStep. Null = not started. */
  onboarding_step: string | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface Module {
  id: UUID;
  user_id: UUID;
  module_key: ModuleKey;
  enabled: boolean;
  configuration: Record<string, unknown>;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export const MEDICATION_FORMS = ['pill', 'injection', 'patch', 'gel', 'cream', 'other'] as const;
export type MedicationForm = (typeof MEDICATION_FORMS)[number];

export const FREQUENCY_TYPES = ['daily', 'weekly', 'every_x_days', 'custom'] as const;
export type FrequencyType = (typeof FREQUENCY_TYPES)[number];

/**
 * Shape of `medications.frequency_config`. Deliberately minimal for MVP —
 * "advanced recurring schedules" (richer `custom` patterns) are P1
 * (docs/DECISIONS.md). Validated centrally in @prism/validation so every
 * writer (mobile, and any future web/admin surface) agrees on the shape.
 */
export interface FrequencyConfig {
  /** Used when frequency_type === 'every_x_days'. */
  interval_days?: number;
  /** Used when frequency_type === 'weekly' or 'custom'. 0 = Sunday. */
  days_of_week?: number[];
  /** Local time-of-day the dose is scheduled, e.g. "08:00". */
  time_of_day?: string;
}

export interface Medication {
  id: UUID;
  user_id: UUID;
  name: string;
  form: MedicationForm | null;
  /** User-entered, informational only. PRISM never calculates or recommends dosage. */
  dosage_text: string | null;
  frequency_type: FrequencyType | null;
  frequency_config: FrequencyConfig | null;
  start_date: ISODate | null;
  end_date: ISODate | null;
  reminder_enabled: boolean;
  notes: string | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export const MEDICATION_LOG_STATUSES = [
  'scheduled',
  'completed',
  'skipped',
  'missed',
  'skipped_intentionally',
] as const;
export type MedicationLogStatus = (typeof MEDICATION_LOG_STATUSES)[number];

export interface MedicationLog {
  id: UUID;
  user_id: UUID;
  medication_id: UUID;
  scheduled_at: ISODateTime;
  completed_at: ISODateTime | null;
  status: MedicationLogStatus;
  notes: string | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export const INJECTION_SITES = [
  'left_thigh',
  'right_thigh',
  'left_glute',
  'right_glute',
  'left_abdomen',
  'right_abdomen',
  'other',
  'not_tracked',
] as const;
/** Tracking labels only — never a medical recommendation about site selection. */
export type InjectionSite = (typeof INJECTION_SITES)[number];

export interface Injection {
  id: UUID;
  user_id: UUID;
  medication_id: UUID | null;
  injected_at: ISODateTime;
  site: InjectionSite | null;
  notes: string | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

/** Suggested categories only — users may enter any custom category text. */
export const SUGGESTED_APPOINTMENT_CATEGORIES = [
  'Primary care',
  'Gender-affirming care',
  'Endocrinology',
  'Surgery',
  'Mental health',
  'Lab',
  'Other',
] as const;

export interface Appointment {
  id: UUID;
  user_id: UUID;
  title: string;
  provider: string | null;
  category: string | null;
  starts_at: ISODateTime;
  ends_at: ISODateTime | null;
  location: string | null;
  notes: string | null;
  reminder_enabled: boolean;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

// --- P1 entities. The schema anticipates these from Foundation onward;
// only their screens are deferred. See docs/DECISIONS.md.

export const LAB_STATUSES = [
  'scheduled',
  'completed',
  'results_received',
  'follow_up_needed',
] as const;
export type LabStatus = (typeof LAB_STATUSES)[number];

/** P1. PRISM stores lab records; it never interprets results. */
export interface Lab {
  id: UUID;
  user_id: UUID;
  title: string;
  date: ISODate;
  provider: string | null;
  status: LabStatus | null;
  notes: string | null;
  attachment_id: UUID | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

/** P1. PRISM records procedures; it never determines eligibility or readiness. */
export interface Procedure {
  id: UUID;
  user_id: UUID;
  title: string;
  date: ISODate;
  provider: string | null;
  category: string | null;
  notes: string | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface Milestone {
  id: UUID;
  user_id: UUID;
  title: string;
  description: string | null;
  date: ISODate;
  category: string | null;
  icon: string | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface JournalEntry {
  id: UUID;
  user_id: UUID;
  title: string | null;
  content: string;
  /** Optional. Never a clinical score. */
  mood: string | null;
  date: ISODate;
  tags: string[];
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

/** P1. The fourth JOURNEY sub-feature — "Not progress. Memories." */
export interface Memory {
  id: UUID;
  user_id: UUID;
  title: string;
  description: string | null;
  date: ISODate | null;
  media_id: UUID | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export const LEGAL_ITEM_STATUSES = [
  'not_started',
  'preparing',
  'filed',
  'in_progress',
  'approved',
  'complete',
] as const;
export type LegalItemStatus = (typeof LEGAL_ITEM_STATUSES)[number];

/** P1. User-managed tracking only — PRISM does not provide legal advice. */
export interface LegalItem {
  id: UUID;
  user_id: UUID;
  title: string;
  category: string;
  status: LegalItemStatus;
  date: ISODate | null;
  notes: string | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

/** P1. High-security feature — see docs/SECURITY.md §5. */
export interface Document {
  id: UUID;
  user_id: UUID;
  title: string;
  category: string;
  storage_path: string;
  mime_type: string | null;
  file_size: number | null;
  uploaded_at: ISODateTime;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export const NOTIFICATION_STYLES = ['private', 'standard', 'custom'] as const;
/** 'private' is the default — see docs/SECURITY.md §7. */
export type NotificationStyle = (typeof NOTIFICATION_STYLES)[number];

export interface Reminder {
  id: UUID;
  user_id: UUID;
  type: string;
  reference_id: UUID | null;
  scheduled_time: ISODateTime;
  recurrence: Record<string, unknown> | null;
  notification_style: NotificationStyle;
  enabled: boolean;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export const THEMES = ['light', 'dark', 'system'] as const;
export type Theme = (typeof THEMES)[number];

export interface Settings {
  user_id: UUID;
  theme: Theme;
  /** Master switch for the lock screen — see docs/SECURITY.md §8. Distinct from biometric_lock, which only selects the unlock method. */
  app_lock_enabled: boolean;
  biometric_lock: boolean;
  notification_privacy: boolean;
  reduced_motion: boolean;
  accessibility_preferences: Record<string, unknown> | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}
