import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Appointment, Medication, MedicationLog } from '@prism/types';
import type { Database } from '@prism/database';
import type {
  AppointmentCreateInput,
  MedicationCreateInput,
  MedicationLogCreateInput,
} from '@prism/validation';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/AuthProvider';
import { track } from '../analytics/events';
import { cancelDueNudges } from '../reminders/notificationScheduler';
import { putInList, refreshAfterSave, removeFromList } from '../refreshAfterSave';
import {
  appointmentKey,
  appointmentsKey,
  medicationKey,
  medicationLogsKey,
  medicationsKey,
} from './queries';

const byName = (a: Medication, b: Medication) => a.name.localeCompare(b.name);
const byStart = (a: Appointment, b: Appointment) => a.starts_at.localeCompare(b.starts_at);
const newestDoseFirst = (a: MedicationLog, b: MedicationLog) =>
  b.scheduled_at.localeCompare(a.scheduled_at);

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
    onSuccess: (data) => {
      track('medication_added');
      putInList(queryClient, medicationsKey(userId), data, byName);
      // Today's Up next, the Timeline and the watch show medications too.
      return refreshAfterSave(queryClient, userId);
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
      putInList(queryClient, medicationsKey(userId), data, byName);
      return refreshAfterSave(queryClient, userId);
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
    onSuccess: (_data, id) => {
      removeFromList(queryClient, medicationsKey(userId), id);
      queryClient.removeQueries({ queryKey: medicationKey(userId, id) });
      return refreshAfterSave(queryClient, userId);
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
      track('dose_logged');
      putInList(queryClient, medicationLogsKey(userId, data.medication_id), data, newestDoseFirst);
      // Everything else that counts doses (Today, the Timeline, stats, a
      // linked supply the database just counted down). Not waited for, so
      // logging a dose and its Undo stay instant.
      void refreshAfterSave(queryClient, userId);
      // A dose that's been logged no longer needs its follow-up reminder.
      void cancelDueNudges(data.medication_id).catch(() => undefined);
    },
  });
}

/** Removes a dose just logged by mistake (Undo). Refreshes every view of dose logs. */
export function useUndoMedicationLog() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      if (!userId) throw new Error('No authenticated session.');
      const { error } = await supabase
        .from('medication_logs')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      void refreshAfterSave(queryClient, userId);
    },
  });
}

export function useDeleteMedicationLog(medicationId: string) {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      if (!userId) throw new Error('No authenticated session.');
      const { error } = await supabase
        .from('medication_logs')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: (_data, id) => {
      removeFromList(queryClient, medicationLogsKey(userId, medicationId), id);
      return refreshAfterSave(queryClient, userId);
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
    onSuccess: (data) => {
      track('appointment_added');
      putInList(queryClient, appointmentsKey(userId), data, byStart);
      // Today, the Timeline, questions for the next appointment and the watch too.
      return refreshAfterSave(queryClient, userId);
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
      putInList(queryClient, appointmentsKey(userId), data, byStart);
      return refreshAfterSave(queryClient, userId);
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
    onSuccess: (_data, id) => {
      removeFromList(queryClient, appointmentsKey(userId), id);
      queryClient.removeQueries({ queryKey: appointmentKey(userId, id) });
      return refreshAfterSave(queryClient, userId);
    },
  });
}
