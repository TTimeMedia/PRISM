/**
 * Runs when the phone hands Prism a link or a file. A calendar file (.ics),
 * such as an appointment attached to an email, is sent to the screen that
 * shows what's in it and asks before adding anything. Every other path is
 * left alone.
 */
export function redirectSystemPath({ path }: { path: string; initial: boolean }): string {
  try {
    if (/^(file|content):/i.test(path) || /\.ics(\?|#|$)/i.test(path)) {
      return `/care/appointments/import-file?uri=${encodeURIComponent(path)}`;
    }
  } catch {
    // Fall through to the default path.
  }
  return path;
}
