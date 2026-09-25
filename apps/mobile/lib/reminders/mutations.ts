import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Reminder } from '@prism/types';
import type { ReminderCreateInput } from '@prism/validation';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/AuthProvider';
import { remindersKey } from './queries';

/**
 * Writes to the `reminders` table — the server-side record of what
 * `useReminderSync` has scheduled, kept for cross-device visibility (see
 * lib/reminders/queries.ts). RLS is the actual security boundary for
 * reads; mutations still filter by `user_id` to target the right row.
 */

export function useUpsertReminder() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ReminderCreateInput): Promise<Reminder> => {
      if (!userId) throw new Error('No authenticated session.');
      const { data, error } = await supabase
        .from('reminders')
        .upsert({ ...input, user_id: userId }, { onConflict: 'user_id,type,reference_id' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: remindersKey(userId) });
    },
  });
}

export function useDeleteReminder() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      type,
      referenceId,
    }: {
      type: string;
      referenceId: string;
    }): Promise<void> => {
      if (!userId) throw new Error('No authenticated session.');
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('user_id', userId)
        .eq('type', type)
        .eq('reference_id', referenceId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: remindersKey(userId) });
    },
  });
}
