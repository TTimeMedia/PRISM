import { useQuery } from '@tanstack/react-query';
import type {
  Appointment,
  Injection,
  Medication,
  MedicationLog,
  Milestone,
  JournalEntry,
  TimelineEvent,
} from '@prism/types';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/AuthProvider';
import { useModules } from '../profile/queries';
import { buildTimelineEvents } from '../../services/journey/timeline';

/**
 * Screen 42 — Timeline. Unifies medications (as real logged doses, not a
 * predicted schedule), injections, appointments, milestones, and journal
 * entries into one chronological view — see
 * services/journey/timeline.ts. A disabled module's records are never
 * fetched at all, the same personalization rule already applied to
 * TODAY (lib/today/queries.ts) and CARE Home.
 */
export function useTimelineEvents() {
  const { session } = useSession();
  const userId = session?.user.id;
  const { data: modules, isLoading: modulesLoading } = useModules();

  const enabled = new Set(modules?.filter((m) => m.enabled).map((m) => m.module_key));

  return useQuery<TimelineEvent[]>({
    queryKey: [
      'timeline-events',
      userId,
      modules?.map((m) => `${m.module_key}:${m.enabled}`).join(','),
    ],
    queryFn: async () => {
      const [medications, medicationLogs, injections, appointments, milestones, journalEntries] =
        await Promise.all([
          enabled.has('medications') ? fetchMedications() : Promise.resolve<Medication[]>([]),
          enabled.has('medications') ? fetchMedicationLogs() : Promise.resolve<MedicationLog[]>([]),
          enabled.has('injections') ? fetchInjections() : Promise.resolve<Injection[]>([]),
          enabled.has('appointments') ? fetchAppointments() : Promise.resolve<Appointment[]>([]),
          enabled.has('milestones') ? fetchMilestones() : Promise.resolve<Milestone[]>([]),
          enabled.has('journal') ? fetchJournalEntries() : Promise.resolve<JournalEntry[]>([]),
        ]);
      return buildTimelineEvents({
        medications,
        medicationLogs,
        injections,
        appointments,
        milestones,
        journalEntries,
      });
    },
    enabled: !!userId && !modulesLoading,
  });
}

async function fetchMedications(): Promise<Medication[]> {
  const { data, error } = await supabase.from('medications').select('*');
  if (error) throw error;
  return data;
}

async function fetchMedicationLogs(): Promise<MedicationLog[]> {
  const { data, error } = await supabase.from('medication_logs').select('*');
  if (error) throw error;
  return data;
}

async function fetchInjections(): Promise<Injection[]> {
  const { data, error } = await supabase.from('injections').select('*');
  if (error) throw error;
  return data;
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
