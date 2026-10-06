import { useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { MedicationLog } from '@prism/types';
import {
  addWatchActionListener,
  isWatchSupported,
  takeWatchActions,
  updateWatchContext,
} from '../../modules/prism-watch';
import { useSession } from '../auth/AuthProvider';
import { useAppointments, useMedications } from '../care/queries';
import { useCreateMedicationLog } from '../care/mutations';
import { useModules, useSettings } from '../profile/queries';
import {
  SIGNED_OUT_CONTEXT,
  buildWatchContext,
  parseWatchAction,
  type WatchAction,
} from './watchContext';
import { supabase } from '../supabase/client';

/** Today's dose logs, for ticking doses off on the watch. Invalidated when a dose is logged. */
export const todayDoseLogsKey = (userId: string | undefined) =>
  ['medication-logs', userId, 'today'] as const;

function dayBounds(now: Date): { from: string; to: string } {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { from: start.toISOString(), to: end.toISOString() };
}

/**
 * Keeps the Apple Watch app up to date and saves what's done on it.
 * Sends today's doses and the next appointment whenever they change (and
 * when Prism comes back to the foreground, so a new day shows), clears the
 * watch on sign-out, and logs doses marked taken on the watch through the
 * same path as the Done button on a reminder. Does nothing on phones and
 * builds without the watch app.
 */
export function useWatchSync(active: boolean): void {
  const { session } = useSession();
  const userId = session?.user.id;
  const { data: modules } = useModules();
  const { data: settings } = useSettings();
  const { data: medications } = useMedications();
  const { data: appointments } = useAppointments();
  const createLog = useCreateMedicationLog();
  const [tick, setTick] = useState(0);
  const enabled = isWatchSupported && active && !!userId;

  const { data: logs } = useQuery({
    queryKey: todayDoseLogsKey(userId),
    queryFn: async () => {
      const { from, to } = dayBounds(new Date());
      const { data, error } = await supabase
        .from('medication_logs')
        .select('medication_id, scheduled_at, status')
        .gte('scheduled_at', from)
        .lt('scheduled_at', to);
      if (error) throw error;
      return data as Pick<MedicationLog, 'medication_id' | 'scheduled_at' | 'status'>[];
    },
    enabled,
  });

  // A new day, or edits made elsewhere: re-send when Prism is opened again.
  useEffect(() => {
    if (!enabled) return;
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') setTick((value) => value + 1);
    });
    return () => subscription.remove();
  }, [enabled]);

  const medicationsOn = !!modules?.find((m) => m.module_key === 'medications')?.enabled;
  const appointmentsOn = !!modules?.find((m) => m.module_key === 'appointments')?.enabled;

  const context = useMemo(() => {
    if (!enabled || !medications || !appointments || !settings || !logs) return null;
    return buildWatchContext({
      medications: medicationsOn ? medications : [],
      appointments: appointmentsOn ? appointments : [],
      logs,
      notificationPrivacy: settings.notification_privacy ?? true,
    });
    // tick re-reads the clock after a day change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, medications, appointments, settings, logs, medicationsOn, appointmentsOn, tick]);

  const lastSent = useRef<string | null>(null);
  useEffect(() => {
    if (!isWatchSupported) return;
    const next = context ?? (userId ? null : SIGNED_OUT_CONTEXT());
    if (!next) return;
    // updatedAt changes every time; compare the rest so the watch only hears about real changes.
    const signature = JSON.stringify({ ...next, updatedAt: undefined });
    if (signature === lastSent.current) return;
    lastSent.current = signature;
    updateWatchContext(JSON.stringify(next));
  }, [context, userId]);

  // Doses logged on the watch. Kept in memory until saved, so a failed save is retried.
  const queue = useRef<WatchAction[]>([]);
  // Every action id ever queued, so a repeat (the watch retrying) is saved once.
  const seen = useRef(new Set<string>());
  const saving = useRef(false);
  useEffect(() => {
    if (!enabled) return;
    const drain = async () => {
      for (const json of takeWatchActions()) {
        const action = parseWatchAction(json);
        if (action && !seen.current.has(action.id)) {
          seen.current.add(action.id);
          queue.current.push(action);
        }
      }
      if (saving.current) return;
      saving.current = true;
      while (queue.current.length > 0) {
        const action = queue.current[0];
        try {
          await createLog.mutateAsync({
            medication_id: action.medicationId,
            scheduled_at: action.at,
            completed_at: new Date().toISOString(),
            status: 'completed',
          });
          queue.current.shift();
        } catch {
          break;
        }
      }
      saving.current = false;
    };
    void drain();
    const subscription = addWatchActionListener(() => void drain());
    return () => subscription?.remove();
    // tick retries anything that failed when Prism comes back to the foreground.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, tick]);
}
