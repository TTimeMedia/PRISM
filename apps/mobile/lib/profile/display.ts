/** How Profile shows what a person saved, without changing what's stored. */

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function ordinal(day: number): string {
  const lastTwo = day % 100;
  if (lastTwo >= 11 && lastTwo <= 13) return `${day}th`;
  const suffix = ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[day % 10] ?? 'th';
  return `${day}${suffix}`;
}

/** "1999-04-26" → "April 26th, 1999". Anything that isn't a date is shown as saved. */
export function formatBirthday(value: string | null | undefined): string | null {
  if (!value) return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const month = match ? MONTHS.at(Number(match[2]) - 1) : undefined;
  if (!match || !month) return value;
  return `${month} ${ordinal(Number(match[3]))}, ${match[1]}`;
}

/** "he/him" → "He/him". The rest of what someone wrote is left as they wrote it. */
export function capitalizeFirst(value: string | null | undefined): string | null {
  if (!value) return null;
  return value.charAt(0).toUpperCase() + value.slice(1);
}
