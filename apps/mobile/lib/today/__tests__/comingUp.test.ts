import type { TodayItem } from '@prism/types';
import { comingUpItemHref, formatComingUpWhen, selectComingUpItems } from '../comingUp';

function item(overrides: Partial<TodayItem> = {}): TodayItem {
  return {
    id: 'medication-m1',
    moduleKey: 'medications',
    bucket: 'due_today',
    sourceId: 'm1',
    title: 'Testosterone',
    subtitle: '50mg',
    at: '2026-06-15T09:00:00',
    ...overrides,
  };
}

describe('selectComingUpItems', () => {
  it('keeps only due_today and upcoming items — never recent/meaningful (past-oriented) ones', () => {
    const items = [
      item({ id: 'a', bucket: 'due_today' }),
      item({ id: 'b', bucket: 'upcoming' }),
      item({ id: 'c', bucket: 'recent' }),
      item({ id: 'd', bucket: 'meaningful' }),
    ];
    expect(selectComingUpItems(items).map((i) => i.id)).toEqual(['a', 'b']);
  });

  it('preserves the chronological order it was given (rankItems already sorted it)', () => {
    const items = [
      item({ id: 'first', bucket: 'due_today', at: '2026-06-15T09:00:00' }),
      item({ id: 'second', bucket: 'upcoming', at: '2026-06-16T09:00:00' }),
      item({ id: 'third', bucket: 'upcoming', at: '2026-06-20T09:00:00' }),
    ];
    expect(selectComingUpItems(items).map((i) => i.id)).toEqual(['first', 'second', 'third']);
  });

  it('caps the list to the given limit — concise, not a full schedule dump', () => {
    const items = Array.from({ length: 10 }, (_, i) =>
      item({ id: `item-${i}`, bucket: 'upcoming' }),
    );
    expect(selectComingUpItems(items, 4)).toHaveLength(4);
  });

  it('returns an empty array when there is nothing concretely scheduled — never fabricates a placeholder item', () => {
    const items = [item({ bucket: 'recent' }), item({ bucket: 'meaningful' })];
    expect(selectComingUpItems(items)).toEqual([]);
  });

  it('returns an empty array for an empty input', () => {
    expect(selectComingUpItems([])).toEqual([]);
  });
});

describe('formatComingUpWhen', () => {
  const NOW = new Date(2026, 5, 15, 8, 0, 0);

  it('labels a same-day item "Today, <time>"', () => {
    expect(formatComingUpWhen('2026-06-15T09:00:00', NOW)).toBe('Today, 9:00 AM');
  });

  it('labels a next-day item "Tomorrow, <time>"', () => {
    expect(formatComingUpWhen('2026-06-16T09:00:00', NOW)).toBe('Tomorrow, 9:00 AM');
  });

  it('labels a farther-out item with weekday/month/day, no time', () => {
    const result = formatComingUpWhen('2026-06-20T09:00:00', NOW);
    expect(result).not.toContain('Today');
    expect(result).not.toContain('Tomorrow');
    expect(result).toMatch(/Jun/);
  });
});

describe('comingUpItemHref', () => {
  it('routes a medication item to its detail page', () => {
    expect(comingUpItemHref(item({ moduleKey: 'medications', sourceId: 'm1' }))).toBe(
      '/care/medications/m1',
    );
  });

  it('routes an appointment item to its detail page', () => {
    expect(comingUpItemHref(item({ moduleKey: 'appointments', sourceId: 'a1' }))).toBe(
      '/care/appointments/a1',
    );
  });

  it('routes a milestone item to its detail page', () => {
    expect(comingUpItemHref(item({ moduleKey: 'milestones', sourceId: 'mi1' }))).toBe(
      '/journey/milestones/mi1',
    );
  });

  it('routes a journal item to its detail page', () => {
    expect(comingUpItemHref(item({ moduleKey: 'journal', sourceId: 'j1' }))).toBe(
      '/journey/journal/j1',
    );
  });
});
