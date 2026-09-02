import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Appointment, Medication } from '@prism/types';
import type { AppointmentCreateInput, MedicationCreateInput } from '@prism/validation';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/AuthProvider';

/**
 * Minimal create mutations — just enough for Onboarding's Medication and
 * Appointment Setup screens (Screens 13 and 15) to persist real records
 * (Rule C, docs/MASTER_BUILD_SPEC.md Appendix A). Full CRUD for these
 * entities (edit, delete, logs) belongs to the CARE milestone.
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
      queryClient.invalidateQueries({ queryKey: ['medications', userId] });
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
      queryClient.invalidateQueries({ queryKey: ['appointments', userId] });
    },
  });
}
