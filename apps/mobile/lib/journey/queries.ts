import { useQuery } from '@tanstack/react-query';
import type { JournalEntry, Milestone } from '@prism/types';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/AuthProvider';

/**
 * Read queries for JOURNEY (Milestones, Journal) — see
 * docs/SCREEN_BIBLE.md §8. RLS scopes every read to the current user, so
 * these never filter by user_id themselves; only mutations do, to target
 * the right row. See lib/journey/mutations.ts for writes.
 */

export const milestonesKey = (userId: string | undefined) => ['milestones', userId] as const;
export const milestoneKey = (userId: string | undefined, id: string) =>
  ['milestones', userId, id] as const;
export const journalEntriesKey = (userId: string | undefined) =>
  ['journal-entries', userId] as const;
export const journalEntryKey = (userId: string | undefined, id: string) =>
  ['journal-entries', userId, id] as const;

export function useMilestones() {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: milestonesKey(userId),
    queryFn: async (): Promise<Milestone[]> => {
      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useMilestone(id: string) {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: milestoneKey(userId, id),
    queryFn: async (): Promise<Milestone> => {
      const { data, error } = await supabase.from('milestones').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId && !!id,
  });
}

export function useJournalEntries() {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: journalEntriesKey(userId),
    queryFn: async (): Promise<JournalEntry[]> => {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useJournalEntry(id: string) {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: journalEntryKey(userId, id),
    queryFn: async (): Promise<JournalEntry> => {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId && !!id,
  });
}
