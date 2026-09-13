import { z } from 'zod';
import { isoDateSchema, notesSchema, titleSchema } from './common';

/** Suggested milestones are optional and always paired with a custom title — see docs/SCREEN_BIBLE.md Screen 45. */
export const milestoneCreateSchema = z.object({
  title: titleSchema,
  description: notesSchema,
  date: isoDateSchema,
  category: z.string().max(100).nullable().optional(),
  icon: z.string().max(50).nullable().optional(),
});
export type MilestoneCreateInput = z.infer<typeof milestoneCreateSchema>;

export const milestoneUpdateSchema = milestoneCreateSchema.partial();
export type MilestoneUpdateInput = z.infer<typeof milestoneUpdateSchema>;

/** Mood is optional and never a clinical score — see docs/PRODUCT_BIBLE.md §20. */
export const journalEntryCreateSchema = z.object({
  title: z.string().max(200).nullable().optional(),
  content: z.string().trim().min(1, 'Write something before saving.').max(20000),
  mood: z.string().max(50).nullable().optional(),
  date: isoDateSchema,
  tags: z.array(z.string().max(50)).max(20).default([]),
});
export type JournalEntryCreateInput = z.infer<typeof journalEntryCreateSchema>;

export const journalEntryUpdateSchema = journalEntryCreateSchema.partial();
export type JournalEntryUpdateInput = z.infer<typeof journalEntryUpdateSchema>;

/** P1. "Not progress. Memories." — see docs/DESIGN_SYSTEM.md §18. */
export const memoryCreateSchema = z.object({
  title: titleSchema,
  description: notesSchema,
  date: isoDateSchema.nullable().optional(),
  media_id: z.string().uuid().nullable().optional(),
});
export type MemoryCreateInput = z.infer<typeof memoryCreateSchema>;
