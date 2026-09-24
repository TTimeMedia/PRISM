import { isAlreadyInPrism, matchesSearch } from '../importCandidates';

describe('isAlreadyInPrism', () => {
  const existing = [{ title: 'Endocrinology', starts_at: '2026-10-05T14:30:00.000Z' }];

  it('recognises the same title at the same time, ignoring case and seconds', () => {
    expect(
      isAlreadyInPrism({ title: 'endocrinology ', startsAt: '2026-10-05T14:30:45.000Z' }, existing),
    ).toBe(true);
  });

  it('treats a different time or title as new', () => {
    expect(
      isAlreadyInPrism({ title: 'Endocrinology', startsAt: '2026-10-05T15:30:00.000Z' }, existing),
    ).toBe(false);
    expect(
      isAlreadyInPrism({ title: 'Primary care', startsAt: '2026-10-05T14:30:00.000Z' }, existing),
    ).toBe(false);
  });
});

describe('matchesSearch', () => {
  const event = { title: 'Dr. Rivera check-in', location: 'Riverside Clinic', notes: null };

  it('matches everything when the search is empty', () => {
    expect(matchesSearch(event, '   ')).toBe(true);
  });

  it('matches title or place, ignoring case', () => {
    expect(matchesSearch(event, 'rivera')).toBe(true);
    expect(matchesSearch(event, 'CLINIC')).toBe(true);
    expect(matchesSearch(event, 'dentist')).toBe(false);
  });
});
