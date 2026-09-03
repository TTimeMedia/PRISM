import { z } from 'zod';
import { CARE_SETUP_OPTIONS, INTENT_OPTIONS, JOURNEY_STAGES } from '@prism/types';
import { isoDateSchema, titleSchema } from './common';

/** Screen 09 — What Brings You Here? Multi-select, entirely optional. */
export const intentSchema = z.object({
  intent: z.array(z.enum(INTENT_OPTIONS)).max(INTENT_OPTIONS.length),
});
export type IntentInput = z.infer<typeof intentSchema>;

/** Screen 10 — Journey Stage. Optional; never rendered as a progress meter. */
export const journeyStageSchema = z.object({
  journey_stage: z.enum(JOURNEY_STAGES).nullable().optional(),
});
export type JourneyStageInput = z.infer<typeof journeyStageSchema>;

/** Screen 11 — Identity. Every field optional — see docs/PRODUCT_BIBLE.md §8.2 (No Assumptions). */
export const identitySchema = z.object({
  display_name: z.string().trim().max(200).nullable().optional(),
  pronouns: z.string().trim().max(100).nullable().optional(),
  gender: z.string().trim().max(100).nullable().optional(),
});
export type IdentityInput = z.infer<typeof identitySchema>;

/** Screen 12 — Care Setup. Drives which of screens 13-14 appear and which modules get enabled. */
export const careSetupSchema = z.object({
  care_setup: z.array(z.enum(CARE_SETUP_OPTIONS)).max(CARE_SETUP_OPTIONS.length),
});
export type CareSetupInput = z.infer<typeof careSetupSchema>;

/**
 * Screen 14 — Injection Setup. Unlike Medication Setup, this captures
 * *preferences* for the injections module (there is no injection to log
 * yet) — stored in modules.configuration, not a standalone injections row.
 */
export const injectionSetupSchema = z.object({
  wants_tracking: z.boolean(),
  medication_id: z.string().uuid().nullable().optional(),
  reminder_enabled: z.boolean().default(false),
  track_site: z.boolean().default(false),
});
export type InjectionSetupInput = z.infer<typeof injectionSetupSchema>;

/**
 * Screen 15 — Appointment Setup. All fields optional/skippable per the
 * spec, unlike the full Add Appointment screen's required title — a
 * title is derived from `category` (or a generic fallback) at submit
 * time rather than asked for directly here.
 */
export const appointmentSetupSchema = z.object({
  provider: z.string().trim().max(200).nullable().optional(),
  category: z.string().trim().max(100).nullable().optional(),
  date: isoDateSchema.nullable().optional(),
  time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Expected HH:mm')
    .nullable()
    .optional(),
  location: z.string().trim().max(300).nullable().optional(),
  reminder_enabled: z.boolean().default(false),
});
export type AppointmentSetupInput = z.infer<typeof appointmentSetupSchema>;

/** Derives a real appointment title from the (optional) category, since Screen 15 never asks for one directly. */
export function deriveAppointmentTitle(category: string | null | undefined): string {
  const trimmed = category?.trim();
  return trimmed ? titleSchema.parse(trimmed) : 'Appointment';
}

/** Screen 16 — Journey Date. "Choose a date" / "I don't know" / "no specific start date" / "Skip" all resolve to a nullable date — no default is ever invented. */
export const journeyDateSchema = z.object({
  journey_start_date: isoDateSchema.nullable().optional(),
});
export type JourneyDateInput = z.infer<typeof journeyDateSchema>;

/** Screen 17 — Privacy Setup. Private notifications default ON — see docs/SECURITY.md §7. */
export const privacySetupSchema = z.object({
  app_lock_enabled: z.boolean().default(false),
  biometric_lock: z.boolean().default(false),
  notification_privacy: z.boolean().default(true),
});
export type PrivacySetupInput = z.infer<typeof privacySetupSchema>;
