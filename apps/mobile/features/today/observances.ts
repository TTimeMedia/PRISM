/**
 * LGBTQ+ days Today celebrates under the greeting. Each one runs from
 * `from` to `to` (inclusive) in one month, by the phone's local date. When
 * several cover the same day, the shortest wins, so a single day beats the
 * week or month around it (Nov 20 is Trans Day of Remembrance, not
 * Trans Awareness Month). People can turn these off in Appearance.
 */
interface Observance {
  /** 1–12. */
  month: number;
  from: number;
  to: number;
  message: string;
}

export const OBSERVANCES: readonly Observance[] = [
  { month: 3, from: 31, to: 31, message: 'Happy Trans Day of Visibility!' },
  { month: 4, from: 26, to: 26, message: 'Happy Lesbian Visibility Day!' },
  { month: 6, from: 1, to: 30, message: 'Happy Pride Month!' },
  { month: 7, from: 14, to: 14, message: "Happy International Non-Binary People's Day!" },
  { month: 9, from: 23, to: 23, message: 'Happy Bi Visibility Day!' },
  { month: 10, from: 11, to: 11, message: 'Happy National Coming Out Day!' },
  { month: 10, from: 26, to: 26, message: 'Happy Intersex Awareness Day!' },
  { month: 11, from: 1, to: 30, message: 'Happy Trans Awareness Month!' },
  { month: 11, from: 13, to: 19, message: 'Happy Trans Awareness Week!' },
  {
    month: 11,
    from: 20,
    to: 20,
    message: 'Today is Trans Day of Remembrance. We honor the lives lost.',
  },
];

/** The message for this date, or null on an ordinary day. */
export function observanceFor(now: Date = new Date()): string | null {
  const month = now.getMonth() + 1;
  const day = now.getDate();
  let best: Observance | null = null;
  for (const observance of OBSERVANCES) {
    if (observance.month !== month || day < observance.from || day > observance.to) continue;
    if (!best || observance.to - observance.from < best.to - best.from) best = observance;
  }
  return best?.message ?? null;
}
