import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Appointment, Injection, Medication, MedicationLog } from '@prism/types';
import type { Database } from '@prism/database';
import type {
  AppointmentCreateInput,
  InjectionCreateInput,
  MedicationCreateInput,
  MedicationLogCreateInput,
} from '@prism/validation';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/AuthProvider';
import {
  appointmentKey,
  appointmentsKey,
  injectionsKey,
  medicationKey,
  medicationLogsKey,
  medicationsKey,
} from './queries';

type MedicationUpdate = Database['public']['Tables']['medications']['Update'];
type AppointmentUpdate = Database['public']['Tables']['appointments']['Update'];

/**
 * CARE mutations — see docs/SCREEN_BIBLE.md §7. RLS is the actual
 * security boundary for reads; mutations still filter by `user_id` to
 * target the right row for `.update()`/`.delete()`.
 */

export function useCreateMedication() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: MedicationCreateInput): Promise<Medication> => {
      if (!userId) throw new Error('No authenticated session.');
      const { data, error } = await supabase
        .from('medications')
        .insert({ ...input, user_id: userId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: medicationsKey(userId) });
    },
  });
}

export function useUpdateMedication(id: string) {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: MedicationUpdate): Promise<Medication> => {
      if (!userId) throw new Error('No authenticated session.');
      const { data, error } = await supabase
        .from('medications')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(medicationKey(userId, id), data);
      queryClient.invalidateQueries({ queryKey: medicationsKey(userId) });
    },
  });
}

/**
 * "Pause" (Screen 26) preserves history — it never deletes past logs.
 * There is no dedicated status column in the canonical schema
 * (docs/MASTER_BUILD_SPEC.md §18), so pausing is expressed the same way
 * a medication's course naturally ends: setting `end_date`. Medication
 * logs live in their own table, keyed by `medication_id`, so they are
 * completely untouched by this. See docs/DECISIONS.md § CARE.
 */
export function usePauseMedication(id: string) {
  const updateMedication = useUpdateMedication(id);
  return {
    ...updateMedication,
    pause: () => updateMedication.mutateAsync({ end_date: new Date().toISOString().slice(0, 10) }),
    resume: () => updateMedication.mutateAsync({ end_date: null }),
  };
}

export function useDeleteMedication() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      if (!userId) throw new Error('No authenticated session.');
      const { error } = await supabase
        .from('medications')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: medicationsKey(userId) });
    },
  });
}

export function useCreateMedicationLog() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: MedicationLogCreateInput): Promise<MedicationLog> => {
      if (!userId) throw new Error('No authenticated session.');
      const { data, error } = await supabase
        .from('medication_logs')
        .insert({ ...input, user_id: userId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: medicationLogsKey(userId, data.medication_id),
      });
    },
  });
}

export function useCreateInjection() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: InjectionCreateInput): Promise<Injection> => {
      if (!userId) throw new Error('No authenticated session.');
      const { data, error } = await supabase
        .from('injections')
        .insert({ ...input, user_id: userId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: injectionsKey(userId) });
    },
  });
}

export function useCreateAppointment() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AppointmentCreateInput): Promise<Appointment> => {
      if (!userId) throw new Error('No authenticated session.');
      const { data, error } = await supabase
        .from('appointments')
        .insert({ ...input, user_id: userId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentsKey(userId) });
      // TODAY classifies appointments — see services/personalization/engine.ts.
      queryClient.invalidateQueries({ queryKey: ['today-items'] });
    },
  });
}

export function useUpdateAppointment(id: string) {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: AppointmentUpdate): Promise<Appointment> => {
      if (!userId) throw new Error('No authenticated session.');
      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(appointmentKey(userId, id), data);
      queryClient.invalidateQueries({ queryKey: appointmentsKey(userId) });
      queryClient.invalidateQueries({ queryKey: ['today-items'] });
    },
  });
}

export function useDeleteAppointment() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      if (!userId) throw new Error('No authenticated session.');
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentsKey(userId) });
      queryClient.invalidateQueries({ queryKey: ['today-items'] });
    },
  });
}
