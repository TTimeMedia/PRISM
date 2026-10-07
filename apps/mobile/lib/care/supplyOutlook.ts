import type { Medication, Supply } from '@prism/types';

/**
 * How long a supply will last and whether it needs attention soon. Pure, so
 * the Care list, the reminders and the tests all agree.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
/** "Running low" and "refill soon" both mean within this many days. */
export const SOON_DAYS = 7;

export interface SupplyOutlook {
  /** Whole doses left, when the supply is linked to a medication with an amount per dose. */
  dosesLeft: number | null;
  /** When it's expected to run out, when the medication's schedule allows a guess. */
  runsOutOn: Date | null;
  /** Out, or expected to run out within SOON_DAYS. */
  low: boolean;
  /** The refill date is within SOON_DAYS (or has passed). */
  refillSoon: boolean;
}

/** Average days between doses for a schedule, or null if it can't be told. */
export function daysBetweenDoses(medication: Medication | null | undefined): number | null {
  if (!medication?.frequency_type) return null;
  const config = medication.frequency_config ?? {};
  switch (medication.frequency_type) {
    case 'daily':
      return 1;
    case 'every_x_days':
      return config.interval_days && config.interval_days > 0 ? config.interval_days : null;
    case 'weekly':
    case 'custom': {
      const days = config.days_of_week?.length ?? 0;
      return days > 0 ? 7 / days : null;
    }
    default:
      return null;
  }
}

/** Calendar days, so a daylight-saving change never shifts the date. */
function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function supplyOutlook(
  supply: Supply,
  medication: Medication | null | undefined,
  now: Date = new Date(),
): SupplyOutlook {
  const dosesLeft =
    supply.per_dose && supply.per_dose > 0
      ? Math.floor(Number(supply.quantity) / Number(supply.per_dose) + 1e-9)
      : null;
  const gap = daysBetweenDoses(medication);
  const runsOutOn =
    dosesLeft !== null && gap !== null
      ? addDays(startOfDay(now), Math.round(dosesLeft * gap))
      : null;
  const soon = addDays(startOfDay(now), SOON_DAYS).getTime();
  const low =
    Number(supply.quantity) <= 0 ||
    dosesLeft === 0 ||
    (runsOutOn !== null && runsOutOn.getTime() <= soon);
  const refillSoon =
    !!supply.refill_on && new Date(`${supply.refill_on}T00:00:00`).getTime() <= soon;
  return { dosesLeft, runsOutOn, low, refillSoon };
}

/** "12 syringes", "2.5 mL", "3". */
export function quantityLabel(supply: Supply): string {
  const amount = Number(supply.quantity);
  const shown = Number.isInteger(amount) ? String(amount) : amount.toFixed(2).replace(/0+$/, '');
  return supply.unit ? `${shown} ${supply.unit}` : shown;
}

/** One short line for a list row: what's left, and the most useful date. */
export function outlookLabel(
  supply: Supply,
  outlook: SupplyOutlook,
  now: Date = new Date(),
): string {
  const parts = [`${quantityLabel(supply)} left`];
  if (outlook.dosesLeft !== null) {
    parts.push(outlook.dosesLeft === 1 ? '1 dose' : `${outlook.dosesLeft} doses`);
  }
  if (outlook.runsOutOn) {
    const days = Math.round((outlook.runsOutOn.getTime() - startOfDay(now).getTime()) / DAY_MS);
    parts.push(
      days <= 0
        ? 'runs out today'
        : days < 14
          ? `about ${days} days`
          : `about ${Math.round(days / 7)} weeks`,
    );
  }
  if (supply.refill_on) {
    const refill = new Date(`${supply.refill_on}T00:00:00`);
    parts.push(
      `refill ${refill.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`,
    );
  }
  return parts.join(' · ');
}

export interface SupplyReminder {
  kind: 'running-low' | 'refill';
  date: Date;
}

/** Reminders go out at this hour, local time. */
const REMINDER_HOUR = 10;

function atReminderHour(day: Date): Date {
  const copy = new Date(day);
  copy.setHours(REMINDER_HOUR, 0, 0, 0);
  return copy;
}

/**
 * When to remind about a supply: a week before it's expected to run out, and
 * a week before its refill date. Only future times; nothing for a supply
 * that can't be estimated and has no refill date.
 */
export function supplyReminderTimes(
  supply: Supply,
  medication: Medication | null | undefined,
  now: Date = new Date(),
): SupplyReminder[] {
  const reminders: SupplyReminder[] = [];
  const { runsOutOn } = supplyOutlook(supply, medication, now);
  if (runsOutOn) {
    const date = atReminderHour(addDays(runsOutOn, -SOON_DAYS));
    if (date.getTime() > now.getTime()) reminders.push({ kind: 'running-low', date });
  }
  if (supply.refill_on) {
    const refill = new Date(`${supply.refill_on}T00:00:00`);
    const date = atReminderHour(addDays(refill, -SOON_DAYS));
    if (date.getTime() > now.getTime()) reminders.push({ kind: 'refill', date });
  }
  return reminders;
}
