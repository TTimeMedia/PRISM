import { z } from 'zod';
import { isoDateSchema } from './common';

/**
 * Every field here is optional except what account creation structurally
 * requires — see docs/PRODUCT_BIBLE.md §8.2 (No Assumptions). Never make
 * any of these `.min(1)`/required without a corresponding, deliberate
 * product decision recorded in docs/DECISIONS.md.
 */
export const profileUpdateSchema = z.object({
  display_name: z.string().trim().max(200).nullable().optional(),
  pronouns: z.string().trim().max(100).nullable().optional(),
  gender: z.string().trim().max(100).nullable().optional(),
  birthday: isoDateSchema.nullable().optional(),
  journey_start_date: isoDateSchema.nullable().optional(),
  /**
   * The `profile-photos` storage bucket is private (docs/SECURITY.md §5),
   * so this stores the bucket object path (e.g. "{user_id}/profile.jpg"),
   * not a public URL — a signed URL is generated on read. See
   * docs/DECISIONS.md § YOU.
   */
  profile_photo_url: z.string().trim().min(1).max(500).nullable().optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
