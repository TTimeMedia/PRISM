import { useQuery } from '@tanstack/react-query';
import type { Appointment, JournalEntry, Medication, Milestone, TodayItem } from '@prism/types';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/AuthProvider';
import { useModules } from '../profile/queries';
import { buildTodayDashboard } from '../../services/personalization/engine';

/**
 * getUserProfile → getEnabledModules → getRelevantRecords →
 * calculateTodayItems → filterIrrelevantItems → rankItems →
 * renderDashboard — see docs/TECHNICAL_BIBLE.md §10. This hook is the
 * data-fetching half of the pipeline (the modules query already covers
 * getUserProfile/getEnabledModules — see lib/profile/queries.ts); the
 * pure classification/ranking half lives in
 * services/personalization/engine.ts.
 *
 * A disabled module's records are never fetched at all, not merely
 * filtered client-side afterwards — the strongest form of "if a module
 * is disabled, its content must not surface anywhere" (docs/TECHNICAL_BIBLE.md §10).
 */
export function useTodayItems() {
  const { session } = useSession();
  const userId = session?.user.id;
  const { data: modules, isLoading: modulesLoading } = useModules();

  const enabled = new Set(modules?.filter((m) => m.enabled).map((m) => m.module_key));

  return useQuery<TodayItem[]>({
    queryKey: [
      'today-items',
      userId,
      modules?.map((m) => `${m.module_key}:${m.enabled}`).join(','),
    ],
    queryFn: async () => {
      const [appointments, milestones, journalEntries, medications] = await Promise.all([
        enabled.has('appointments') ? fetchAppointments() : Promise.resolve<Appointment[]>([]),
        enabled.has('milestones') ? fetchMilestones() : Promise.resolve<Milestone[]>([]),
        enabled.has('journal') ? fetchJournalEntries() : Promise.resolve<JournalEntry[]>([]),
        enabled.has('medications') ? fetchMedications() : Promise.resolve<Medication[]>([]),
      ]);
      return buildTodayDashboard({ appointments, milestones, journalEntries, medications });
    },
    enabled: !!userId && !modulesLoading,
  });
}

async function fetchAppointments(): Promise<Appointment[]> {
  const { data, error } = await supabase.from('appointments').select('*');
  if (error) throw error;
  return data;
}

async function fetchMilestones(): Promise<Milestone[]> {
  const { data, error } = await supabase.from('milestones').select('*');
  if (error) throw error;
  return data;
}

async function fetchJournalEntries(): Promise<JournalEntry[]> {
  const { data, error } = await supabase.from('journal_entries').select('*');
  if (error) throw error;
  return data;
}

async function fetchMedications(): Promise<Medication[]> {
  const { data, error } = await supabase.from('medications').select('*');
  if (error) throw error;
  return data;
}
