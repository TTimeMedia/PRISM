import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Supply } from '@prism/types';
import type { Database } from '@prism/database';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/AuthProvider';
import { track } from '../analytics/events';

/** Supplies and refills — see lib/care/supplyOutlook.ts for how long they last. */

type SupplyInsert = Omit<Database['public']['Tables']['supplies']['Insert'], 'user_id'>;
type SupplyUpdate = Database['public']['Tables']['supplies']['Update'];

export const suppliesKey = (userId: string | undefined) => ['supplies', userId] as const;

export function useSupplies() {
  const { session } = useSession();
  const userId = session?.user.id;
  return useQuery({
    queryKey: suppliesKey(userId),
    queryFn: async (): Promise<Supply[]> => {
      const { data, error } = await supabase
        .from('supplies')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useSaveSupply() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values }: { id?: string; values: SupplyInsert }) => {
      if (!userId) throw new Error('No authenticated session.');
      if (id) {
        const update: SupplyUpdate = values;
        const { error } = await supabase
          .from('supplies')
          .update(update)
          .eq('id', id)
          .eq('user_id', userId);
        if (error) throw error;
        return;
      }
      const { error } = await supabase.from('supplies').insert({ ...values, user_id: userId });
      if (error) throw error;
      track('supply_added');
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: suppliesKey(userId) }),
  });
}

export function useDeleteSupply() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!userId) throw new Error('No authenticated session.');
      const { error } = await supabase.from('supplies').delete().eq('id', id).eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: suppliesKey(userId) }),
  });
}
