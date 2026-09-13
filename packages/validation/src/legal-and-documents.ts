import { z } from 'zod';
import { LEGAL_ITEM_STATUSES } from '@prism/types';
import { isoDateSchema, notesSchema, titleSchema } from './common';

/** P1. User-managed tracking only — PRISM does not provide legal advice. Wording must never imply legal transition is required. */
export const legalItemCreateSchema = z.object({
  title: titleSchema,
  category: z.string().trim().min(1).max(100),
  status: z.enum(LEGAL_ITEM_STATUSES),
  date: isoDateSchema.nullable().optional(),
  notes: notesSchema,
});
export type LegalItemCreateInput = z.infer<typeof legalItemCreateSchema>;

/**
 * P1. High-security feature — see docs/SECURITY.md §5. This schema
 * validates metadata only; the file itself is uploaded to a private
 * Supabase Storage bucket and its storage_path is written after upload
 * succeeds, never client-supplied ahead of time.
 */
export const documentCreateSchema = z.object({
  title: titleSchema,
  category: z.string().trim().min(1).max(100),
  mime_type: z.string().max(150).nullable().optional(),
  file_size: z
    .number()
    .int()
    .positive()
    .max(50 * 1024 * 1024)
    .nullable()
    .optional(),
});
export type DocumentCreateInput = z.infer<typeof documentCreateSchema>;
