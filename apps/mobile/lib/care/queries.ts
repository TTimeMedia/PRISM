import { useQuery } from '@tanstack/react-query';
import type { Appointment, Injection, Medication, MedicationLog } from '@prism/types';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/AuthProvider';

/**
 * Read queries for CARE (Medications, Injections, Appointments) — see
 * docs/SCREEN_BIBLE.md §7. RLS scopes every read to the current user, so
 * these never filter by user_id themselves; only mutations do, to target
 * the right row. See lib/care/mutations.ts for writes.
 */

export const medicationsKey = (userId: string | undefined) => ['medications', userId] as const;
export const medicationKey = (userId: string | undefined, id: string) =>
  ['medications', userId, id] as const;
export const medicationLogsKey = (userId: string | undefined, medicationId: string) =>
  ['medication-logs', userId, medicationId] as const;
export const injectionsKey = (userId: string | undefined) => ['injections', userId] as const;
export const appointmentsKey = (userId: string | undefined) => ['appointments', userId] as const;
export const appointmentKey = (userId: string | undefined, id: string) =>
  ['appointments', userId, id] as const;

export function useMedications() {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: medicationsKey(userId),
    queryFn: async (): Promise<Medication[]> => {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useMedication(id: string) {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: medicationKey(userId, id),
    queryFn: async (): Promise<Medication> => {
      const { data, error } = await supabase.from('medications').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId && !!id,
  });
}

export function useMedicationLogs(medicationId: string) {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: medicationLogsKey(userId, medicationId),
    queryFn: async (): Promise<MedicationLog[]> => {
      const { data, error } = await supabase
        .from('medication_logs')
        .select('*')
        .eq('medication_id', medicationId)
        .order('scheduled_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!userId && !!medicationId,
  });
}

export function useInjections() {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: injectionsKey(userId),
    queryFn: async (): Promise<Injection[]> => {
      const { data, error } = await supabase
        .from('injections')
        .select('*')
        .order('injected_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useAppointments() {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: appointmentsKey(userId),
    queryFn: async (): Promise<Appointment[]> => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('starts_at', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useAppointment(id: string) {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: appointmentKey(userId, id),
    queryFn: async (): Promise<Appointment> => {
      const { data, error } = await supabase.from('appointments').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId && !!id,
  });
}
