import { buildTimelineEvents, type TimelineRecords } from '../timeline';
import type {
  Appointment,
  Injection,
  Medication,
  MedicationLog,
  Milestone,
  JournalEntry,
} from '@prism/types';

const NOW = new Date('2026-06-15T12:00:00Z');

function emptyRecords(): TimelineRecords {
  return {
    medicationLogs: [],
    medications: [],
    injections: [],
    appointments: [],
    milestones: [],
    journalEntries: [],
  };
}

function medication(overrides: Partial<Medication> = {}): Medication {
  return {
    id: 'med-1',
    user_id: 'u1',
    name: 'Estradiol',
    form: 'pill',
    dosage_text: null,
    frequency_type: null,
    frequency_config: null,
    start_date: null,
    end_date: null,
    reminder_enabled: false,
    notes: null,
    created_at: NOW.toISOString(),
    updated_at: NOW.toISOString(),
    ...overrides,
  };
}

function medicationLog(overrides: Partial<MedicationLog> = {}): MedicationLog {
  return {
    id: 'log-1',
    user_id: 'u1',
    medication_id: 'med-1',
    scheduled_at: NOW.toISOString(),
    completed_at: NOW.toISOString(),
    status: 'completed',
    notes: null,
    created_at: NOW.toISOString(),
    updated_at: NOW.toISOString(),
    ...overrides,
  };
}

function injection(overrides: Partial<Injection> = {}): Injection {
  return {
    id: 'inj-1',
    user_id: 'u1',
    medication_id: null,
    injected_at: NOW.toISOString(),
    site: 'left_thigh',
    notes: null,
    created_at: NOW.toISOString(),
    updated_at: NOW.toISOString(),
    ...overrides,
  };
}

function appointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: 'apt-1',
    user_id: 'u1',
    title: 'Endocrinology',
    provider: 'Dr. Rivera',
    category: null,
    starts_at: NOW.toISOString(),
    ends_at: null,
    location: null,
    notes: null,
    reminder_enabled: false,
    created_at: NOW.toISOString(),
    updated_at: NOW.toISOString(),
    ...overrides,
  };
}

function milestone(overrides: Partial<Milestone> = {}): Milestone {
  return {
    id: 'mi-1',
    user_id: 'u1',
    title: 'Started HRT',
    description: null,
    date: '2026-06-10',
    category: null,
    icon: null,
    created_at: NOW.toISOString(),
    updated_at: NOW.toISOString(),
    ...overrides,
  };
}

function journalEntry(overrides: Partial<JournalEntry> = {}): JournalEntry {
  return {
    id: 'jo-1',
    user_id: 'u1',
    title: 'Reflection',
    content: 'Today was good.',
    mood: 'hopeful',
    date: '2026-06-12',
    tags: [],
    created_at: NOW.toISOString(),
    updated_at: NOW.toISOString(),
    ...overrides,
  };
}

describe('buildTimelineEvents', () => {
  it('returns nothing for empty records — never manufactures content', () => {
    expect(buildTimelineEvents(emptyRecords())).toEqual([]);
  });

  it('converts a medication log into a real logged-dose event, not a predicted schedule', () => {
    const events = buildTimelineEvents({
      ...emptyRecords(),
      medications: [medication()],
      medicationLogs: [medicationLog()],
    });
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      moduleKey: 'medications',
      sourceId: 'med-1',
      title: 'Estradiol',
      subtitle: 'Completed',
    });
  });

  it('falls back to a generic title when the medication behind a log is unknown', () => {
    const events = buildTimelineEvents({
      ...emptyRecords(),
      medicationLogs: [medicationLog({ medication_id: 'missing' })],
    });
    expect(events[0].title).toBe('Medication');
  });

  it('includes an injection event with a human-readable site label', () => {
    const events = buildTimelineEvents({ ...emptyRecords(), injections: [injection()] });
    expect(events[0]).toMatchObject({ moduleKey: 'injections', subtitle: 'Left Thigh' });
  });

  it('includes an appointment event', () => {
    const events = buildTimelineEvents({ ...emptyRecords(), appointments: [appointment()] });
    expect(events[0]).toMatchObject({
      moduleKey: 'appointments',
      title: 'Endocrinology',
      subtitle: 'Dr. Rivera',
    });
  });

  it('includes a milestone event, using its own date field for display-worthy ordering', () => {
    const events = buildTimelineEvents({ ...emptyRecords(), milestones: [milestone()] });
    expect(events[0]).toMatchObject({ moduleKey: 'milestones', title: 'Started HRT' });
  });

  it('includes a journal entry event, falling back to a generic title when untitled', () => {
    const events = buildTimelineEvents({
      ...emptyRecords(),
      journalEntries: [journalEntry({ title: null })],
    });
    expect(events[0]).toMatchObject({ moduleKey: 'journal', title: 'Journal entry' });
  });

  it('never duplicates data — sourceId always points back to the real record', () => {
    const events = buildTimelineEvents({ ...emptyRecords(), appointments: [appointment()] });
    expect(events[0].sourceId).toBe('apt-1');
  });

  it('orders every event type together, most recent first', () => {
    const events = buildTimelineEvents({
      medications: [medication()],
      medicationLogs: [medicationLog({ scheduled_at: '2026-06-01T08:00:00Z' })],
      injections: [injection({ injected_at: '2026-06-20T08:00:00Z' })],
      appointments: [appointment({ starts_at: '2026-06-14T08:00:00Z' })],
      milestones: [milestone({ date: '2026-06-10' })],
      journalEntries: [journalEntry({ date: '2026-06-12' })],
    });
    expect(events.map((e) => e.moduleKey)).toEqual([
      'injections',
      'appointments',
      'journal',
      'milestones',
      'medications',
    ]);
  });
});
