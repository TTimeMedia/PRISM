import { observanceFor } from '../observances';

const on = (month: number, day: number) => new Date(2026, month - 1, day, 9);

describe('observanceFor', () => {
  it('celebrates National Coming Out Day on October 11', () => {
    expect(observanceFor(on(10, 11))).toBe('Happy National Coming Out Day!');
  });

  it('says nothing on an ordinary day', () => {
    expect(observanceFor(on(10, 10))).toBeNull();
    expect(observanceFor(on(3, 30))).toBeNull();
  });

  it('covers every day of Pride Month', () => {
    expect(observanceFor(on(6, 1))).toBe('Happy Pride Month!');
    expect(observanceFor(on(6, 30))).toBe('Happy Pride Month!');
    expect(observanceFor(on(7, 1))).toBeNull();
  });

  it('lets a day beat the week, and the week beat the month', () => {
    expect(observanceFor(on(11, 2))).toBe('Happy Trans Awareness Month!');
    expect(observanceFor(on(11, 13))).toBe('Happy Trans Awareness Week!');
    expect(observanceFor(on(11, 19))).toBe('Happy Trans Awareness Week!');
    expect(observanceFor(on(11, 20))).toBe(
      'Today is Trans Day of Remembrance. We honor the lives lost.',
    );
    expect(observanceFor(on(11, 21))).toBe('Happy Trans Awareness Month!');
  });

  it('knows Trans Day of Visibility', () => {
    expect(observanceFor(on(3, 31))).toBe('Happy Trans Day of Visibility!');
  });
});
