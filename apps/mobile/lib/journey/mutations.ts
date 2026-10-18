import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { JournalEntry, Milestone } from '@prism/types';
import type { Database } from '@prism/database';
import type { JournalEntryCreateInput, MilestoneCreateInput } from '@prism/validation';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/AuthProvider';
import { track } from '../analytics/events';
import { journalEntriesKey, journalEntryKey, milestoneKey, milestonesKey } from './queries';
import { removeEntryImages } from './entryImage';
import {
  byDateNewestFirst,
  putInList,
  refreshAfterSave,
  removeFromList,
} from '../refreshAfterSave';
import { entryPhotos } from './entryPhotos';

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
    onSuccess: (data) => {
      track('milestone_added');
      putInList(queryClient, milestonesKey(userId), data, byDateNewestFirst);
      // Today, the Timeline and the You stats show milestones too.
      return refreshAfterSave(queryClient, userId);
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
      putInList(queryClient, milestonesKey(userId), data, byDateNewestFirst);
      return refreshAfterSave(queryClient, userId);
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
      const { data: existing } = await supabase
        .from('milestones')
        .select('image_path, image_paths')
        .eq('id', id)
        .eq('user_id', userId)
        .maybeSingle();
      const { error } = await supabase
        .from('milestones')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      if (error) throw error;
      await removeEntryImages(existing ? entryPhotos(existing) : []);
    },
    onSuccess: (_data, id) => {
      removeFromList(queryClient, milestonesKey(userId), id);
      queryClient.removeQueries({ queryKey: milestoneKey(userId, id) });
      return refreshAfterSave(queryClient, userId);
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
    onSuccess: (data) => {
      track('journal_entry_added');
      putInList(queryClient, journalEntriesKey(userId), data, byDateNewestFirst);
      // Today, the Timeline and the You stats show journal entries too.
      return refreshAfterSave(queryClient, userId);
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
      putInList(queryClient, journalEntriesKey(userId), data, byDateNewestFirst);
      return refreshAfterSave(queryClient, userId);
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
      const { data: existing } = await supabase
        .from('journal_entries')
        .select('image_path, image_paths')
        .eq('id', id)
        .eq('user_id', userId)
        .maybeSingle();
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      if (error) throw error;
      await removeEntryImages(existing ? entryPhotos(existing) : []);
    },
    onSuccess: (_data, id) => {
      removeFromList(queryClient, journalEntriesKey(userId), id);
      queryClient.removeQueries({ queryKey: journalEntryKey(userId, id) });
      return refreshAfterSave(queryClient, userId);
    },
  });
}
