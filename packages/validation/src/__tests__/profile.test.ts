import { describe, expect, it } from 'vitest';
import { profileUpdateSchema } from '../profile';

describe('profileUpdateSchema', () => {
  it('accepts a completely empty object — no identity field is required', () => {
    // See docs/PRODUCT_BIBLE.md §8.2 (No Assumptions) and
    // docs/DECISIONS.md "PRISM does not require pronouns" /
    // "PRISM does not assume a binary gender".
    const result = profileUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('accepts explicit nulls for every field (a user clearing a field)', () => {
    const result = profileUpdateSchema.safeParse({
      display_name: null,
      pronouns: null,
      gender: null,
      birthday: null,
      journey_start_date: null,
      profile_photo_url: null,
    });
    expect(result.success).toBe(true);
  });

  it('accepts free-text gender rather than a fixed set of options', () => {
    const result = profileUpdateSchema.safeParse({ gender: 'anything the user wants to type' });
    expect(result.success).toBe(true);
  });

  it('rejects a malformed date', () => {
    const result = profileUpdateSchema.safeParse({ birthday: 'not-a-date' });
    expect(result.success).toBe(false);
  });

  it('accepts a private-bucket object path for profile_photo_url, not just a URL', () => {
    // The profile-photos bucket is private (docs/SECURITY.md §5), so
    // this column stores a storage object path — see docs/DECISIONS.md § YOU.
    const result = profileUpdateSchema.safeParse({
      profile_photo_url: 'a1b2c3d4-user-id/profile.jpg',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an empty string for profile_photo_url', () => {
    const result = profileUpdateSchema.safeParse({ profile_photo_url: '' });
    expect(result.success).toBe(false);
  });
});
