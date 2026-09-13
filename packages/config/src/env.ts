/**
 * Fail-fast helper for required public environment variables.
 *
 * Mobile (Expo) and web (Next.js) each read process.env themselves,
 * since each framework requires a different variable name prefix
 * (EXPO_PUBLIC_*, NEXT_PUBLIC_*) to expose a variable to client code —
 * see docs/SECURITY.md §14-15. This just gives both a single, consistent
 * way to validate what they read instead of failing with a cryptic
 * "undefined" deep inside a Supabase call.
 */
export function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Copy .env.example to .env and fill it in.`,
    );
  }
  return value;
}
