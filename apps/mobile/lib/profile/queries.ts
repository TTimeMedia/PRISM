import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Module, ModuleKey, Profile, Settings } from '@prism/types';
import type { Database } from '@prism/database';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/AuthProvider';

type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
type SettingsUpdate = Database['public']['Tables']['settings']['Update'];

/**
 * Server state for profile/modules/settings — see docs/TECHNICAL_BIBLE.md
 * §12. RLS (auth.uid() = user_id) is the actual security boundary, so
 * these queries never need to pass a user_id filter to *read* — only
 * mutations need it, to target the right row for `.update()`.
 */

const profileKey = (userId: string | undefined) => ['profile', userId] as const;
const modulesKey = (userId: string | undefined) => ['modules', userId] as const;
const settingsKey = (userId: string | undefined) => ['settings', userId] as const;

export function useProfile() {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: profileKey(userId),
    queryFn: async (): Promise<Profile> => {
      const { data, error } = await supabase.from('profiles').select('*').maybeSingle();
      if (error) throw error;
      if (!data) throw new Error('Profile not found — handle_new_user should have created one.');
      return data;
    },
    enabled: !!userId,
  });
}

export function useUpdateProfile() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: ProfileUpdate): Promise<Profile> => {
      if (!userId) throw new Error('No authenticated session.');
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(profileKey(userId), data);
    },
  });
}

export function useModules() {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: modulesKey(userId),
    queryFn: async (): Promise<Module[]> => {
      const { data, error } = await supabase.from('modules').select('*');
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

/**
 * Enables a module, creating its row if it doesn't exist yet — see
 * docs/DECISIONS.md "Disabled modules hide data rather than deleting
 * it": this only ever sets `enabled`/`configuration`, never deletes a
 * module row, so existing data reappears exactly as it was if a module
 * is re-enabled later.
 */
export function useSetModuleEnabled() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      moduleKey,
      enabled,
      configuration,
    }: {
      moduleKey: ModuleKey;
      enabled: boolean;
      configuration?: Record<string, unknown>;
    }): Promise<Module> => {
      if (!userId) throw new Error('No authenticated session.');
      const { data, error } = await supabase
        .from('modules')
        .upsert(
          {
            user_id: userId,
            module_key: moduleKey,
            enabled,
            ...(configuration ? { configuration } : {}),
          },
          { onConflict: 'user_id,module_key' },
        )
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: modulesKey(userId) });
    },
  });
}

export function useSettings() {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: settingsKey(userId),
    queryFn: async (): Promise<Settings> => {
      const { data, error } = await supabase.from('settings').select('*').single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useUpdateSettings() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: SettingsUpdate): Promise<Settings> => {
      if (!userId) throw new Error('No authenticated session.');
      const { data, error } = await supabase
        .from('settings')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(settingsKey(userId), data);
    },
  });
}
