import { useState } from 'react';
import { Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type {
  Appointment,
  Injection,
  JournalEntry,
  Medication,
  MedicationLog,
  Milestone,
  Module,
  Profile,
  Settings,
} from '@prism/types';
import { supabase } from '../supabase/client';
import { buildDataExport, type DataExportRecords } from './dataExport';

/**
 * Fetches every P0 table the signed-in user owns (RLS-scoped, same as
 * every other read) and hands the user a single JSON file — Screen 63's
 * "Export my data" / "Download my data" actions. On web this triggers a
 * normal browser download; on native it writes to the app's document
 * directory and opens the OS share sheet, since there is no user-visible
 * "Downloads" folder to write to directly on iOS/Android.
 */
export function useExportData() {
  const [isExporting, setIsExporting] = useState(false);

  const exportData = async (): Promise<void> => {
    setIsExporting(true);
    try {
      const [
        profile,
        settings,
        modules,
        medications,
        medicationLogs,
        injections,
        appointments,
        milestones,
        journalEntries,
      ] = await Promise.all([
        fetchProfile(),
        fetchSettings(),
        fetchModules(),
        fetchMedications(),
        fetchMedicationLogs(),
        fetchInjections(),
        fetchAppointments(),
        fetchMilestones(),
        fetchJournalEntries(),
      ]);

      const records: DataExportRecords = {
        profile,
        settings,
        modules,
        medications,
        medication_logs: medicationLogs,
        injections,
        appointments,
        milestones,
        journal_entries: journalEntries,
      };
      const payload = buildDataExport(records);
      const json = JSON.stringify(payload, null, 2);
      const filename = `prism-export-${payload.exported_at.slice(0, 10)}.json`;

      if (Platform.OS === 'web') {
        downloadOnWeb(json, filename);
      } else {
        await shareOnNative(json, filename);
      }
    } finally {
      setIsExporting(false);
    }
  };

  return { exportData, isExporting };
}

async function fetchProfile(): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').maybeSingle();
  if (error) throw error;
  return data;
}

async function fetchSettings(): Promise<Settings | null> {
  const { data, error } = await supabase.from('settings').select('*').maybeSingle();
  if (error) throw error;
  return data;
}

async function fetchModules(): Promise<Module[]> {
  const { data, error } = await supabase.from('modules').select('*');
  if (error) throw error;
  return data;
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

function downloadOnWeb(json: string, filename: string): void {
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function shareOnNative(json: string, filename: string): Promise<void> {
  const file = new File(Paths.document, filename);
  if (file.exists) file.delete();
  file.create();
  file.write(json);
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, { mimeType: 'application/json' });
  }
}
