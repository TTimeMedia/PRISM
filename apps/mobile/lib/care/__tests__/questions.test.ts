import type { Appointment, AppointmentQuestion } from '@prism/types';
import { nextAppointment, questionsFor } from '../questions';

jest.mock('../../supabase/client', () => ({ supabase: {} }));
jest.mock('../../auth/AuthProvider', () => ({ useSession: () => ({ session: null }) }));

const appt = (id: string, starts_at: string) => ({ id, starts_at }) as Appointment;
const q = (id: string, appointment_id: string | null) =>
  ({ id, appointment_id, question: id, asked: false }) as AppointmentQuestion;

describe('questions for the doctor', () => {
  const now = new Date('2026-10-07T12:00:00Z');
  const appointments = [
    appt('past', '2026-10-01T10:00:00Z'),
    appt('later', '2026-10-20T10:00:00Z'),
    appt('next', '2026-10-09T10:00:00Z'),
  ];

  it('finds the next appointment that has not started', () => {
    expect(nextAppointment(appointments, now)?.id).toBe('next');
    expect(nextAppointment([appointments[0]], now)).toBeNull();
  });

  it('gives unassigned questions to the next appointment only', () => {
    const questions = [q('loose', null), q('mine', 'later'), q('old', 'past')];
    expect(questionsFor('next', questions, 'next').map((x) => x.id)).toEqual(['loose']);
    expect(questionsFor('later', questions, 'next').map((x) => x.id)).toEqual(['mine']);
    expect(questionsFor('past', questions, 'next').map((x) => x.id)).toEqual(['old']);
  });
});
