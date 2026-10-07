import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { EuphoriaMoment } from '@prism/types';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/AuthProvider';
import { track } from '../analytics/events';

/** Euphoria jar: small good moments, saved in a tap and brought back at random. */

export const euphoriaKey = (userId: string | undefined) => ['euphoria-moments', userId] as const;

export function useEuphoriaMoments() {
  const { session } = useSession();
  const userId = session?.user.id;
  return useQuery({
    queryKey: euphoriaKey(userId),
    queryFn: async (): Promise<EuphoriaMoment[]> => {
      const { data, error } = await supabase
        .from('euphoria_moments')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useSaveEuphoria() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (text: string) => {
      if (!userId) throw new Error('No authenticated session.');
      const { error } = await supabase
        .from('euphoria_moments')
        .insert({ user_id: userId, text: text.trim() });
      if (error) throw error;
      track('euphoria_saved');
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: euphoriaKey(userId) }),
  });
}

export function useDeleteEuphoria() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!userId) throw new Error('No authenticated session.');
      const { error } = await supabase
        .from('euphoria_moments')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: euphoriaKey(userId) }),
  });
}

/** A random moment, never the one just shown (when there's more than one). */
export function pickMoment(
  moments: EuphoriaMoment[],
  previousId: string | null,
  random: () => number = Math.random,
): EuphoriaMoment | null {
  if (moments.length === 0) return null;
  const pool = moments.length > 1 ? moments.filter((m) => m.id !== previousId) : moments;
  return pool[Math.floor(random() * pool.length)] ?? pool[0];
}
