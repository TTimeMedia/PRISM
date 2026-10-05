import { capitalizeFirst, formatBirthday } from '../display';

describe('formatBirthday', () => {
  it.each([
    ['1999-04-26', 'April 26th, 1999'],
    ['2001-01-01', 'January 1st, 2001'],
    ['1990-03-02', 'March 2nd, 1990'],
    ['1985-12-23', 'December 23rd, 1985'],
    ['1994-07-11', 'July 11th, 1994'],
    ['1994-07-12', 'July 12th, 1994'],
    ['1994-07-13', 'July 13th, 1994'],
    ['1994-07-21', 'July 21st, 1994'],
  ])('shows %s as %s', (saved, shown) => {
    expect(formatBirthday(saved)).toBe(shown);
  });

  it('leaves nothing as nothing, and anything else as saved', () => {
    expect(formatBirthday(null)).toBeNull();
    expect(formatBirthday('')).toBeNull();
    expect(formatBirthday('sometime in spring')).toBe('sometime in spring');
  });
});

describe('capitalizeFirst', () => {
  it('capitalizes only the first letter', () => {
    expect(capitalizeFirst('he/him')).toBe('He/him');
    expect(capitalizeFirst('xe/xem')).toBe('Xe/xem');
    expect(capitalizeFirst('They/them')).toBe('They/them');
    expect(capitalizeFirst(null)).toBeNull();
  });
});
