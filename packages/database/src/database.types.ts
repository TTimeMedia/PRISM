/**
 * Hand-written Supabase `Database` type, matching the canonical schema in
 * docs/MASTER_BUILD_SPEC.md §18 and the migrations in supabase/migrations/.
 *
 * This is written by hand (not `supabase gen types`) because Foundation
 * has no live Supabase project to generate against yet. Once one exists,
 * regenerate this file with the Supabase CLI and keep the two in sync —
 * this file existing is what lets `createSupabaseClient<Database>()`
 * type every query, so do not let it drift from the actual migrations.
 */
import type {
  Appointment,
  Document,
  FrequencyConfig,
  Injection,
  JournalEntry,
  Lab,
  LegalItem,
  Medication,
  MedicationLog,
  Memory,
  Milestone,
  Module,
  Procedure,
  Profile,
  Reminder,
  Settings,
} from '@prism/types';

/** Fields the database generates/defaults — optional on insert, omitted from Row-derived Insert type accordingly. */
type Insertable<Row, GeneratedKeys extends keyof Row> = Omit<Row, GeneratedKeys> &
  Partial<Pick<Row, GeneratedKeys>>;

/** Fields that must never be changed by an update payload (ownership, identity, immutable timestamps). */
type Updatable<Row, ImmutableKeys extends keyof Row> = Partial<Omit<Row, ImmutableKeys>>;

type Generated = 'id' | 'created_at' | 'updated_at';
type Immutable = 'id' | 'user_id' | 'created_at';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Insertable<Profile, Generated>;
        Update: Updatable<Profile, Immutable>;
      };
      modules: {
        Row: Module;
        Insert: Insertable<Module, Generated | 'enabled' | 'configuration'>;
        Update: Updatable<Module, Immutable>;
      };
      medications: {
        Row: Medication;
        Insert: Insertable<Medication, Generated | 'reminder_enabled'>;
        Update: Updatable<Medication, Immutable>;
      };
      medication_logs: {
        Row: MedicationLog;
        Insert: Insertable<MedicationLog, Generated>;
        Update: Updatable<MedicationLog, Immutable>;
      };
      injections: {
        Row: Injection;
        Insert: Insertable<Injection, Generated>;
        Update: Updatable<Injection, Immutable>;
      };
      appointments: {
        Row: Appointment;
        Insert: Insertable<Appointment, Generated | 'reminder_enabled'>;
        Update: Updatable<Appointment, Immutable>;
      };
      /** P1 — see docs/DECISIONS.md. Table exists from Foundation onward regardless. */
      labs: {
        Row: Lab;
        Insert: Insertable<Lab, Generated>;
        Update: Updatable<Lab, Immutable>;
      };
      /** P1 — see docs/DECISIONS.md. */
      procedures: {
        Row: Procedure;
        Insert: Insertable<Procedure, Generated>;
        Update: Updatable<Procedure, Immutable>;
      };
      milestones: {
        Row: Milestone;
        Insert: Insertable<Milestone, Generated>;
        Update: Updatable<Milestone, Immutable>;
      };
      journal_entries: {
        Row: JournalEntry;
        Insert: Insertable<JournalEntry, Generated | 'tags'>;
        Update: Updatable<JournalEntry, Immutable>;
      };
      /** P1 — see docs/DECISIONS.md. */
      memories: {
        Row: Memory;
        Insert: Insertable<Memory, Generated>;
        Update: Updatable<Memory, Immutable>;
      };
      /** P1 — see docs/DECISIONS.md. */
      legal_items: {
        Row: LegalItem;
        Insert: Insertable<LegalItem, Generated>;
        Update: Updatable<LegalItem, Immutable>;
      };
      /** P1 — see docs/DECISIONS.md. High-security — see docs/SECURITY.md §5. */
      documents: {
        Row: Document;
        Insert: Insertable<Document, Generated | 'uploaded_at'>;
        Update: Updatable<Document, Immutable>;
      };
      reminders: {
        Row: Reminder;
        Insert: Insertable<Reminder, Generated | 'notification_style' | 'enabled'>;
        Update: Updatable<Reminder, Immutable>;
      };
      settings: {
        Row: Settings;
        Insert: Insertable<
          Settings,
          | 'theme'
          | 'biometric_lock'
          | 'notification_privacy'
          | 'reduced_motion'
          | 'created_at'
          | 'updated_at'
        >;
        /** No `Immutable` fields to exclude beyond user_id — settings has no `id` column; user_id is the primary key. */
        Update: Partial<Omit<Settings, 'user_id' | 'created_at'>>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type { FrequencyConfig };
