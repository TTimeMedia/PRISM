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

export interface DataExportRecords {
  profile: Profile | null;
  settings: Settings | null;
  modules: Module[];
  medications: Medication[];
  medication_logs: MedicationLog[];
  injections: Injection[];
  appointments: Appointment[];
  milestones: Milestone[];
  journal_entries: JournalEntry[];
}

export interface DataExportPayload extends DataExportRecords {
  exported_at: string;
}

/**
 * Screen 63 (Data & Export) — one combined export covering every P0
 * table the user owns. Pure and testable: takes already-fetched records
 * and stamps an export time, no I/O of its own. See
 * docs/SECURITY.md §9 (export format/completeness bar) and
 * docs/BUILD_STATUS.md §6 (file structure — one combined export was the
 * open decision; see docs/DECISIONS.md § YOU).
 */
export function buildDataExport(
  records: DataExportRecords,
  now: Date = new Date(),
): DataExportPayload {
  return {
    exported_at: now.toISOString(),
    ...records,
  };
}
