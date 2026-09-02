import { describe, expect, it } from 'vitest';
import {
  milestoneCreateSchema,
  milestoneUpdateSchema,
  journalEntryCreateSchema,
  journalEntryUpdateSchema,
} from '../journey';

describe('milestoneCreateSchema', () => {
  it('accepts a minimal valid milestone', () => {
    const result = milestoneCreateSchema.safeParse({ title: 'Started HRT', date: '2026-06-01' });
    expect(result.success).toBe(true);
  });

  it('rejects a missing title', () => {
    const result = milestoneCreateSchema.safeParse({ date: '2026-06-01' });
    expect(result.success).toBe(false);
  });

  it('rejects a missing date — unlike CARE, a milestone always has one', () => {
    const result = milestoneCreateSchema.safeParse({ title: 'Started HRT' });
    expect(result.success).toBe(false);
  });
});

describe('milestoneUpdateSchema', () => {
  it('accepts a partial update', () => {
    const result = milestoneUpdateSchema.safeParse({ description: 'Updated description' });
    expect(result.success).toBe(true);
  });

  it('accepts an empty object', () => {
    const result = milestoneUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe('journalEntryCreateSchema', () => {
  it('accepts a minimal valid entry — title, mood, and tags are all optional', () => {
    const result = journalEntryCreateSchema.safeParse({
      content: 'Today was good.',
      date: '2026-06-01',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty content — "Write something before saving."', () => {
    const result = journalEntryCreateSchema.safeParse({ content: '', date: '2026-06-01' });
    expect(result.success).toBe(false);
  });

  it('accepts free-text mood — not a fixed enum, per the no-mood-tracker design rule', () => {
    const result = journalEntryCreateSchema.safeParse({
      content: 'Today was good.',
      date: '2026-06-01',
      mood: 'a little bit of everything',
    });
    expect(result.success).toBe(true);
  });

  it('defaults tags to an empty array when omitted', () => {
    const result = journalEntryCreateSchema.parse({ content: 'Hi', date: '2026-06-01' });
    expect(result.tags).toEqual([]);
  });
});

describe('journalEntryUpdateSchema', () => {
  it('accepts a partial update', () => {
    const result = journalEntryUpdateSchema.safeParse({ mood: 'calm' });
    expect(result.success).toBe(true);
  });
});
