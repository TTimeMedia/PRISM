import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Appointment, AppointmentQuestion } from '@prism/types';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/AuthProvider';
import { track } from '../analytics/events';

/**
 * Questions for the doctor. A question saved without an appointment belongs
 * to whichever appointment is next, so it shows up there automatically.
 */

export const questionsKey = (userId: string | undefined) =>
  ['appointment-questions', userId] as const;

export function useQuestions() {
  const { session } = useSession();
  const userId = session?.user.id;
  return useQuery({
    queryKey: questionsKey(userId),
    queryFn: async (): Promise<AppointmentQuestion[]> => {
      const { data, error } = await supabase
        .from('appointment_questions')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

/** The first appointment that hasn't started yet, or null. */
export function nextAppointment(
  appointments: Appointment[] | undefined,
  now: Date = new Date(),
): Appointment | null {
  return (
    [...(appointments ?? [])]
      .filter((a) => new Date(a.starts_at).getTime() >= now.getTime())
      .sort((a, b) => a.starts_at.localeCompare(b.starts_at))[0] ?? null
  );
}

/** The questions to show on one appointment: its own, plus unassigned ones if it's the next. */
export function questionsFor(
  appointmentId: string,
  questions: AppointmentQuestion[] | undefined,
  nextId: string | null,
): AppointmentQuestion[] {
  return (questions ?? []).filter(
    (q) =>
      q.appointment_id === appointmentId || (q.appointment_id === null && nextId === appointmentId),
  );
}

export function useAddQuestion() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      question,
      appointmentId,
    }: {
      question: string;
      appointmentId: string | null;
    }) => {
      if (!userId) throw new Error('No authenticated session.');
      const { error } = await supabase
        .from('appointment_questions')
        .insert({ user_id: userId, question: question.trim(), appointment_id: appointmentId });
      if (error) throw error;
      track('question_added');
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: questionsKey(userId) }),
  });
}

export function useSetQuestionAsked() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, asked }: { id: string; asked: boolean }) => {
      if (!userId) throw new Error('No authenticated session.');
      const { error } = await supabase
        .from('appointment_questions')
        .update({ asked })
        .eq('id', id)
        .eq('user_id', userId);
      if (error) throw error;
    },
    onMutate: async ({ id, asked }) => {
      const key = questionsKey(userId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<AppointmentQuestion[]>(key);
      queryClient.setQueryData<AppointmentQuestion[]>(key, (list) =>
        list?.map((q) => (q.id === id ? { ...q, asked } : q)),
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(questionsKey(userId), context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: questionsKey(userId) }),
  });
}

export function useDeleteQuestion() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!userId) throw new Error('No authenticated session.');
      const { error } = await supabase
        .from('appointment_questions')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: questionsKey(userId) }),
  });
}
