import { z } from 'zod';

export const uuidSchema = z.string().uuid();
export const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD');
export const isoDateTimeSchema = z.string().datetime({ offset: true });

/** A short, human title field used across many PRISM records. */
export const titleSchema = z.string().trim().min(1, 'This field is required.').max(200);

/** A longer free-text notes/description field. Always optional — see docs/PRODUCT_BIBLE.md §8.2. */
export const notesSchema = z.string().max(5000).nullable().optional();
