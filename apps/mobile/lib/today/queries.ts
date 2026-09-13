import { useQuery } from '@tanstack/react-query';
import type { Appointment, Medication, Milestone, TodayItem } from '@prism/types';
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
 *
 * Journal entries are never fetched here — TODAY's personalization
 * engine never classifies them into a card (see
 * services/personalization/engine.ts's own header), so fetching them for
 * this pipeline would only be wasted work. Journal stays reachable via
 * JOURNEY → Journal and Timeline instead.
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
      const [appointments, milestones, medications] = await Promise.all([
        enabled.has('appointments') ? fetchAppointments() : Promise.resolve<Appointment[]>([]),
        enabled.has('milestones') ? fetchMilestones() : Promise.resolve<Milestone[]>([]),
        enabled.has('medications') ? fetchMedications() : Promise.resolve<Medication[]>([]),
      ]);
      return buildTodayDashboard({ appointments, milestones, medications });
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

async function fetchMedications(): Promise<Medication[]> {
  const { data, error } = await supabase.from('medications').select('*');
  if (error) throw error;
  return data;
}
