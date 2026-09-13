import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { JournalEntry, Milestone } from '@prism/types';
import type { Database } from '@prism/database';
import type { JournalEntryCreateInput, MilestoneCreateInput } from '@prism/validation';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/AuthProvider';
import { journalEntriesKey, journalEntryKey, milestoneKey, milestonesKey } from './queries';

type MilestoneUpdate = Database['public']['Tables']['milestones']['Update'];
type JournalEntryUpdate = Database['public']['Tables']['journal_entries']['Update'];

/**
 * JOURNEY mutations — see docs/SCREEN_BIBLE.md §8. RLS is the actual
 * security boundary for reads; mutations still filter by `user_id` to
 * target the right row for `.update()`/`.delete()`.
 */

export function useCreateMilestone() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: MilestoneCreateInput): Promise<Milestone> => {
      if (!userId) throw new Error('No authenticated session.');
      const { data, error } = await supabase
        .from('milestones')
        .insert({ ...input, user_id: userId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: milestonesKey(userId) });
      // TODAY classifies milestones — see services/personalization/engine.ts.
      queryClient.invalidateQueries({ queryKey: ['today-items'] });
    },
  });
}

export function useUpdateMilestone(id: string) {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: MilestoneUpdate): Promise<Milestone> => {
      if (!userId) throw new Error('No authenticated session.');
      const { data, error } = await supabase
        .from('milestones')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(milestoneKey(userId, id), data);
      queryClient.invalidateQueries({ queryKey: milestonesKey(userId) });
      queryClient.invalidateQueries({ queryKey: ['today-items'] });
    },
  });
}

export function useDeleteMilestone() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      if (!userId) throw new Error('No authenticated session.');
      const { error } = await supabase
        .from('milestones')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: milestonesKey(userId) });
      queryClient.invalidateQueries({ queryKey: ['today-items'] });
    },
  });
}

export function useCreateJournalEntry() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: JournalEntryCreateInput): Promise<JournalEntry> => {
      if (!userId) throw new Error('No authenticated session.');
      const { data, error } = await supabase
        .from('journal_entries')
        .insert({ ...input, user_id: userId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: journalEntriesKey(userId) });
      // TODAY classifies journal entries — see services/personalization/engine.ts.
      queryClient.invalidateQueries({ queryKey: ['today-items'] });
    },
  });
}

export function useUpdateJournalEntry(id: string) {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: JournalEntryUpdate): Promise<JournalEntry> => {
      if (!userId) throw new Error('No authenticated session.');
      const { data, error } = await supabase
        .from('journal_entries')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(journalEntryKey(userId, id), data);
      queryClient.invalidateQueries({ queryKey: journalEntriesKey(userId) });
      queryClient.invalidateQueries({ queryKey: ['today-items'] });
    },
  });
}

export function useDeleteJournalEntry() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      if (!userId) throw new Error('No authenticated session.');
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: journalEntriesKey(userId) });
      queryClient.invalidateQueries({ queryKey: ['today-items'] });
    },
  });
}
