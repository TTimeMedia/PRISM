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

/** Every key of Row whose value type is nullable — a nullable column can always be omitted on insert, same as an explicit null. */
type NullableKeys<Row> = { [K in keyof Row]: null extends Row[K] ? K : never }[keyof Row];

/**
 * Fields optional on insert: the database-generated ones (GeneratedKeys)
 * plus every nullable column (NullableKeys) — a Zod schema's
 * `.nullable().optional()` field is `T | null | undefined`, and a
 * nullable Postgres column with no client-supplied value just stores
 * NULL, so "key omitted" and "key explicitly null" must both type-check.
 */
type Insertable<Row, GeneratedKeys extends keyof Row> = Omit<
  Row,
  GeneratedKeys | NullableKeys<Row>
> &
  Partial<Pick<Row, GeneratedKeys | NullableKeys<Row>>>;

/** Fields that must never be changed by an update payload (ownership, identity, immutable timestamps). */
type Updatable<Row, ImmutableKeys extends keyof Row> = Partial<Omit<Row, ImmutableKeys>>;

/**
 * Forces TS to re-materialize a type as a fresh mapped/object type rather
 * than keeping it as a reference to a named interface. Needed below
 * because `SupabaseClient`'s own generic defaults resolve the table
 * schema via `... extends GenericSchema ? ... : never`, and that check
 * silently resolves to `never` — degrading every `.insert()`/`.update()`
 * call on every table to accepting nothing — when a table's `Row` is a
 * *named* interface (e.g. `Profile`) rather than an inline/mapped object
 * type, specifically once that interface has an array-typed field (e.g.
 * `intent: string[] | null`). Verified in isolation against this exact
 * TypeScript version: an inline object literal or a `Flatten<T>`-wrapped
 * type both satisfy the check; a bare named-interface reference does
 * not. This is the fix, not a style preference — do not remove it.
 */
type Flatten<T> = { [K in keyof T]: T[K] };

/**
 * Wraps Row/Insert/Update into the shape postgrest-js actually requires
 * (`GenericTable`, from @supabase/postgrest-js) — it needs a
 * `Relationships` array on every table, or its generic table lookups
 * silently degrade to `never` too. See the `Flatten` comment above for
 * the other half of why this file exists in this exact shape.
 */
type Table<Row, Insert, Update> = {
  Row: Flatten<Row>;
  Insert: Flatten<Insert>;
  Update: Flatten<Update>;
  Relationships: [];
};

type Generated = 'id' | 'created_at' | 'updated_at';
type Immutable = 'id' | 'user_id' | 'created_at';

export interface Database {
  public: {
    Tables: {
      profiles: Table<Profile, Insertable<Profile, Generated>, Updatable<Profile, Immutable>>;
      modules: Table<
        Module,
        Insertable<Module, Generated | 'enabled' | 'configuration'>,
        Updatable<Module, Immutable>
      >;
      medications: Table<
        Medication,
        Insertable<Medication, Generated | 'reminder_enabled'>,
        Updatable<Medication, Immutable>
      >;
      medication_logs: Table<
        MedicationLog,
        Insertable<MedicationLog, Generated>,
        Updatable<MedicationLog, Immutable>
      >;
      injections: Table<
        Injection,
        Insertable<Injection, Generated>,
        Updatable<Injection, Immutable>
      >;
      appointments: Table<
        Appointment,
        Insertable<Appointment, Generated | 'reminder_enabled'>,
        Updatable<Appointment, Immutable>
      >;
      /** P1 — see docs/DECISIONS.md. Table exists from Foundation onward regardless. */
      labs: Table<Lab, Insertable<Lab, Generated>, Updatable<Lab, Immutable>>;
      /** P1 — see docs/DECISIONS.md. */
      procedures: Table<
        Procedure,
        Insertable<Procedure, Generated>,
        Updatable<Procedure, Immutable>
      >;
      milestones: Table<
        Milestone,
        Insertable<Milestone, Generated>,
        Updatable<Milestone, Immutable>
      >;
      journal_entries: Table<
        JournalEntry,
        Insertable<JournalEntry, Generated | 'tags'>,
        Updatable<JournalEntry, Immutable>
      >;
      /** P1 — see docs/DECISIONS.md. */
      memories: Table<Memory, Insertable<Memory, Generated>, Updatable<Memory, Immutable>>;
      /** P1 — see docs/DECISIONS.md. */
      legal_items: Table<
        LegalItem,
        Insertable<LegalItem, Generated>,
        Updatable<LegalItem, Immutable>
      >;
      /** P1 — see docs/DECISIONS.md. High-security — see docs/SECURITY.md §5. */
      documents: Table<
        Document,
        Insertable<Document, Generated | 'uploaded_at'>,
        Updatable<Document, Immutable>
      >;
      reminders: Table<
        Reminder,
        Insertable<Reminder, Generated | 'notification_style' | 'enabled'>,
        Updatable<Reminder, Immutable>
      >;
      settings: Table<
        Settings,
        Insertable<
          Settings,
          | 'theme'
          | 'app_lock_enabled'
          | 'biometric_lock'
          | 'notification_privacy'
          | 'reduced_motion'
          | 'created_at'
          | 'updated_at'
        >,
        /** No `Immutable` fields to exclude beyond user_id — settings has no `id` column; user_id is the primary key. */
        Partial<Omit<Settings, 'user_id' | 'created_at'>>
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type { FrequencyConfig };
