import { z } from 'zod';

/**
 * What every form says when something needs fixing. Zod's own wording
 * ("Expected string, received null") is written for developers; these tell
 * the person what to do to move on. Schemas with their own message keep it.
 * Installed for every schema by index.ts.
 */
export const prismErrorMap: z.ZodErrorMap = (issue) => {
  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      if (issue.received === 'undefined' || issue.received === 'null') {
        return { message: 'Please fill this in.' };
      }
      if (issue.expected === 'number') return { message: 'Enter a number.' };
      return { message: 'Please check this and try again.' };
    case z.ZodIssueCode.too_small:
      if (issue.type === 'string') {
        return {
          message:
            Number(issue.minimum) <= 1
              ? 'Please fill this in.'
              : `Use at least ${issue.minimum} characters.`,
        };
      }
      if (issue.type === 'number') return { message: `Enter ${issue.minimum} or more.` };
      if (issue.type === 'array') {
        return {
          message:
            Number(issue.minimum) <= 1
              ? 'Choose at least one.'
              : `Choose at least ${issue.minimum}.`,
        };
      }
      return { message: 'Please fill this in.' };
    case z.ZodIssueCode.too_big:
      if (issue.type === 'string') {
        return { message: `Keep this to ${issue.maximum} characters or fewer.` };
      }
      if (issue.type === 'number') return { message: `Enter ${issue.maximum} or less.` };
      if (issue.type === 'array') return { message: `Choose up to ${issue.maximum}.` };
      return { message: 'This is too long. Please shorten it.' };
    case z.ZodIssueCode.invalid_string:
      if (issue.validation === 'email') {
        return { message: 'Enter an email address, like name@example.com.' };
      }
      if (issue.validation === 'datetime') return { message: 'Choose a date and time.' };
      if (issue.validation === 'url') {
        return { message: 'Enter a web address, like https://example.com.' };
      }
      return { message: 'Please check this and try again.' };
    case z.ZodIssueCode.invalid_enum_value:
    case z.ZodIssueCode.invalid_literal:
    case z.ZodIssueCode.invalid_union:
      return { message: 'Choose one of the options.' };
    case z.ZodIssueCode.not_finite:
      return { message: 'Enter a number.' };
    default:
      return { message: 'Please check this and try again.' };
  }
};

export const uuidSchema = z.string().uuid();
export const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose a date.');
export const isoDateTimeSchema = z.string().datetime({ offset: true });

/** An optional date. A cleared date field ('') counts as no date, not a wrong one. */
export const optionalIsoDateSchema = z.preprocess(
  (value) => (value === '' ? null : value),
  isoDateSchema.nullable().optional(),
);

/** A time of day, 24-hour HH:mm. */
export const timeOfDaySchema = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Choose a time.');

/** An optional time of day. A cleared time ('') counts as no time, not a wrong one. */
export const optionalTimeOfDaySchema = z.preprocess(
  (value) => (value === '' ? null : value),
  timeOfDaySchema.nullable().optional(),
);

/** A short, human title field used across many PRISM records. */
export const titleSchema = z.string().trim().min(1, 'Please fill this in.').max(200);

/** A longer free-text notes/description field. Always optional — see docs/PRODUCT_BIBLE.md §8.2. */
export const notesSchema = z.string().max(5000).nullable().optional();
