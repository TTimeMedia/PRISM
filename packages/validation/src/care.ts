import { z } from 'zod';
import {
  FREQUENCY_TYPES,
  INJECTION_SITES,
  LAB_STATUSES,
  MEDICATION_FORMS,
  MEDICATION_LOG_STATUSES,
} from '@prism/types';
import { isoDateSchema, isoDateTimeSchema, notesSchema, titleSchema } from './common';

/**
 * Shape of `medications.frequency_config` — see @prism/types FrequencyConfig
 * and docs/BUILD_STATUS.md §6 (this shape was an open implementation
 * decision; it is now defined here as the single source of truth).
 */
export const frequencyConfigSchema = z
  .object({
    interval_days: z.number().int().min(1).max(365).optional(),
    days_of_week: z.array(z.number().int().min(0).max(6)).optional(),
    time_of_day: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Expected HH:mm')
      .optional(),
  })
  .nullable()
  .optional();

/**
 * PRISM may store and display user-entered dosage information. It must
 * never calculate, recommend, or validate dosage as "correct" — this
 * schema only checks that free text was provided, not what it says.
 * See docs/PRODUCT_BIBLE.md §12 and docs/DECISIONS.md.
 */
export const medicationCreateSchema = z.object({
  name: titleSchema,
  form: z.enum(MEDICATION_FORMS).nullable().optional(),
  dosage_text: z.string().max(200).nullable().optional(),
  frequency_type: z.enum(FREQUENCY_TYPES).nullable().optional(),
  frequency_config: frequencyConfigSchema,
  start_date: isoDateSchema.nullable().optional(),
  end_date: isoDateSchema.nullable().optional(),
  reminder_enabled: z.boolean().default(false),
  notes: notesSchema,
});
export type MedicationCreateInput = z.infer<typeof medicationCreateSchema>;

/** Editing a medication's own configuration must never rewrite its historical logs — see docs/SCREEN_BIBLE.md Screen 27. */
export const medicationUpdateSchema = medicationCreateSchema.partial();
export type MedicationUpdateInput = z.infer<typeof medicationUpdateSchema>;

export const medicationLogCreateSchema = z.object({
  medication_id: z.string().uuid(),
  scheduled_at: isoDateTimeSchema,
  completed_at: isoDateTimeSchema.nullable().optional(),
  status: z.enum(MEDICATION_LOG_STATUSES),
  notes: notesSchema,
});
export type MedicationLogCreateInput = z.infer<typeof medicationLogCreateSchema>;

/** No medical guidance is given on site selection — see docs/PRODUCT_BIBLE.md §13. */
export const injectionCreateSchema = z.object({
  medication_id: z.string().uuid().nullable().optional(),
  injected_at: isoDateTimeSchema,
  site: z.enum(INJECTION_SITES).nullable().optional(),
  notes: notesSchema,
});
export type InjectionCreateInput = z.infer<typeof injectionCreateSchema>;

export const appointmentCreateSchema = z.object({
  title: titleSchema,
  provider: z.string().max(200).nullable().optional(),
  /** Free text — suggested categories exist but are not enforced (users may add custom ones). */
  category: z.string().max(100).nullable().optional(),
  starts_at: isoDateTimeSchema,
  ends_at: isoDateTimeSchema.nullable().optional(),
  location: z.string().max(300).nullable().optional(),
  notes: notesSchema,
  reminder_enabled: z.boolean().default(false),
});
export type AppointmentCreateInput = z.infer<typeof appointmentCreateSchema>;

export const appointmentUpdateSchema = appointmentCreateSchema.partial();
export type AppointmentUpdateInput = z.infer<typeof appointmentUpdateSchema>;

/**
 * Shape of CARE's Add/Edit Appointment forms (Screens 32/34), which
 * collect date and time as separate fields — unlike `appointmentCreateSchema`,
 * which stores the combined `starts_at`. Title is required here (CARE's
 * form asks for one directly); onboarding's Appointment Setup instead
 * derives a title from category, since it never asks for one — see
 * `deriveAppointmentTitle` in @prism/validation onboarding.
 */
export const appointmentFormSchema = z.object({
  title: titleSchema,
  provider: z.string().trim().max(200).nullable().optional(),
  category: z.string().trim().max(100).nullable().optional(),
  date: isoDateSchema,
  time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Expected HH:mm')
    .nullable()
    .optional(),
  location: z.string().trim().max(300).nullable().optional(),
  notes: notesSchema,
  reminder_enabled: z.boolean().default(false),
});
export type AppointmentFormInput = z.infer<typeof appointmentFormSchema>;

// --- P1 (schema/validation exists now; screens ship later — see docs/DECISIONS.md)

/** P1. PRISM stores lab records; it never interprets results. */
export const labCreateSchema = z.object({
  title: titleSchema,
  date: isoDateSchema,
  provider: z.string().max(200).nullable().optional(),
  status: z.enum(LAB_STATUSES).nullable().optional(),
  notes: notesSchema,
  attachment_id: z.string().uuid().nullable().optional(),
});
export type LabCreateInput = z.infer<typeof labCreateSchema>;

/** P1. PRISM records procedures; it never determines eligibility or readiness. */
export const procedureCreateSchema = z.object({
  title: titleSchema,
  date: isoDateSchema,
  provider: z.string().max(200).nullable().optional(),
  category: z.string().max(100).nullable().optional(),
  notes: notesSchema,
});
export type ProcedureCreateInput = z.infer<typeof procedureCreateSchema>;
