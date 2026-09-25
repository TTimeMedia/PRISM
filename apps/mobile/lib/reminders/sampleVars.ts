import {
  SAMPLE_VARS,
  reminderKindForMedication,
  type Appointment,
  type Medication,
  type ReminderKind,
  type ReminderVars,
} from '@prism/types';

/**
 * What to show as the example of a reminder. The person's own medication or
 * appointment when they have one with reminders on ("Take your Testosterone
 * cypionate at 9:00 AM."), so the wording is previewed on what they actually
 * take. Only when they have none does it fall back to a neutral made-up
 * example, which never assumes a medication.
 */
export interface ReminderSample {
  vars: ReminderVars;
  /** True when this comes from the person's own reminders rather than a made-up example. */
  own: boolean;
  /** How many of their own reminders of this kind are on. */
  count: number;
}

function clock(hour: number, minute: number): string {
  return new Date(2000, 0, 1, hour, minute).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function timeOfDay(value: string | undefined): string | undefined {
  const match = value?.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  return match ? clock(Number(match[1]), Number(match[2])) : undefined;
}

export function medicationsForKind(
  kind: 'medication' | 'injection',
  medications: readonly Medication[],
): Medication[] {
  return medications.filter(
    (medication) =>
      medication.reminder_enabled && reminderKindForMedication(medication.form) === kind,
  );
}

export function upcomingAppointmentsWithReminders(
  appointments: readonly Appointment[],
  now: Date = new Date(),
): Appointment[] {
  return appointments
    .filter((a) => a.reminder_enabled && new Date(a.starts_at).getTime() >= now.getTime())
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
}

export function reminderSampleFor(
  kind: ReminderKind,
  medications: readonly Medication[],
  appointments: readonly Appointment[],
  now: Date = new Date(),
): ReminderSample {
  if (kind === 'appointment') {
    const own = upcomingAppointmentsWithReminders(appointments, now);
    const first = own[0];
    if (!first) return { vars: SAMPLE_VARS.appointment, own: false, count: 0 };
    return {
      vars: {
        name: first.title,
        time: new Date(first.starts_at).toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
        }),
        when: 'in 1 hour',
      },
      own: true,
      count: own.length,
    };
  }
  const own = medicationsForKind(kind, medications);
  const first = own[0];
  if (!first) return { vars: SAMPLE_VARS[kind], own: false, count: 0 };
  return {
    vars: {
      name: first.name,
      time: timeOfDay(first.frequency_config?.time_of_day) ?? SAMPLE_VARS[kind].time,
      dose: first.dosage_text ?? undefined,
      when: 'now',
    },
    own: true,
    count: own.length,
  };
}
