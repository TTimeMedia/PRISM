/**
 * Combines a `YYYY-MM-DD` date and an optional `HH:mm` time (local) into
 * the UTC ISO datetime string the database expects. Used wherever a CARE
 * form collects date + time separately (Log Injection, Log Dose, Add/Edit
 * Appointment) — see docs/TECHNICAL_BIBLE.md §14 Timezone handling.
 */
export function toISODateTime(date: string, time: string | null | undefined): string {
  const safeTime = time && /^([01]\d|2[0-3]):([0-5]\d)$/.test(time) ? time : '09:00';
  return new Date(`${date}T${safeTime}:00`).toISOString();
}

export function nowDateAndTime(): { date: string; time: string } {
  return splitISODateTime(new Date().toISOString());
}

/**
 * Inverse of `toISODateTime` — splits a stored UTC ISO datetime back into
 * local `YYYY-MM-DD` / `HH:mm` fields for editing, e.g. Edit Appointment
 * pre-filling its Date/Time inputs from `appointments.starts_at`.
 */
export function splitISODateTime(iso: string): { date: string; time: string } {
  const local = new Date(iso);
  const date = `${local.getFullYear()}-${String(local.getMonth() + 1).padStart(2, '0')}-${String(local.getDate()).padStart(2, '0')}`;
  const time = `${String(local.getHours()).padStart(2, '0')}:${String(local.getMinutes()).padStart(2, '0')}`;
  return { date, time };
}
