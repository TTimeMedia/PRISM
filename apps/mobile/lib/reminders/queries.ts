import { useQuery } from '@tanstack/react-query';
import type { Reminder } from '@prism/types';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/AuthProvider';

/**
 * Read queries for the `reminders` table — the record of which native
 * notifications `useReminderSync` has scheduled, keyed by `type` +
 * `reference_id` (see lib/reminders/mutations.ts). RLS scopes every read
 * to the current user, so this never filters by user_id itself.
 */

export const remindersKey = (userId: string | undefined) => ['reminders', userId] as const;

export function useReminders() {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: remindersKey(userId),
    queryFn: async (): Promise<Reminder[]> => {
      const { data, error } = await supabase.from('reminders').select('*');
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}
