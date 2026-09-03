import {
  buildTodayDashboard,
  calculateTodayItems,
  filterIrrelevantItems,
  rankItems,
} from '../engine';
import type { Appointment, JournalEntry, Medication, Milestone } from '@prism/types';

const NOW = new Date('2026-06-15T12:00:00Z');

function makeAppointment(overrides: Partial<Appointment> = {}): Appointment {
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

function makeMilestone(overrides: Partial<Milestone> = {}): Milestone {
  return {
    id: 'mi-1',
    user_id: 'u1',
    title: 'Started HRT',
    description: null,
    date: NOW.toISOString().slice(0, 10),
    category: null,
    icon: null,
    created_at: NOW.toISOString(),
    updated_at: NOW.toISOString(),
    ...overrides,
  };
}

function makeJournalEntry(overrides: Partial<JournalEntry> = {}): JournalEntry {
  return {
    id: 'jo-1',
    user_id: 'u1',
    title: 'Reflection',
    content: 'Today was good.',
    mood: 'hopeful',
    date: NOW.toISOString().slice(0, 10),
    tags: [],
    created_at: NOW.toISOString(),
    updated_at: NOW.toISOString(),
    ...overrides,
  };
}

function makeMedication(overrides: Partial<Medication> = {}): Medication {
  return {
    id: 'med-1',
    user_id: 'u1',
    name: 'Testosterone',
    form: 'injection',
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

describe('calculateTodayItems — appointments', () => {
  it('classifies a same-day appointment as due_today', () => {
    const items = calculateTodayItems(
      {
        appointments: [makeAppointment({ starts_at: NOW.toISOString() })],
        milestones: [],
        journalEntries: [],
        medications: [],
      },
      NOW,
    );
    expect(items).toHaveLength(1);
    expect(items[0].bucket).toBe('due_today');
  });

  it('classifies a future appointment within the window as upcoming', () => {
    const future = new Date(NOW.getTime() + 5 * 24 * 60 * 60 * 1000);
    const items = calculateTodayItems(
      {
        appointments: [makeAppointment({ starts_at: future.toISOString() })],
        milestones: [],
        journalEntries: [],
        medications: [],
      },
      NOW,
    );
    expect(items[0].bucket).toBe('upcoming');
  });

  it('excludes a past appointment', () => {
    const past = new Date(NOW.getTime() - 24 * 60 * 60 * 1000);
    const items = calculateTodayItems(
      {
        appointments: [makeAppointment({ starts_at: past.toISOString() })],
        milestones: [],
        journalEntries: [],
        medications: [],
      },
      NOW,
    );
    expect(items).toHaveLength(0);
  });

  it('excludes an appointment far beyond the upcoming window', () => {
    const farFuture = new Date(NOW.getTime() + 90 * 24 * 60 * 60 * 1000);
    const items = calculateTodayItems(
      {
        appointments: [makeAppointment({ starts_at: farFuture.toISOString() })],
        milestones: [],
        journalEntries: [],
        medications: [],
      },
      NOW,
    );
    expect(items).toHaveLength(0);
  });
});

describe('calculateTodayItems — milestones and journal', () => {
  it('classifies a recent milestone as meaningful', () => {
    const items = calculateTodayItems(
      { appointments: [], milestones: [makeMilestone()], journalEntries: [], medications: [] },
      NOW,
    );
    expect(items[0].bucket).toBe('meaningful');
  });

  it('classifies a recent journal entry as recent', () => {
    const items = calculateTodayItems(
      { appointments: [], milestones: [], journalEntries: [makeJournalEntry()], medications: [] },
      NOW,
    );
    expect(items[0].bucket).toBe('recent');
  });

  it('falls back to a generic title for an untitled journal entry — never blank, never invented content', () => {
    const items = calculateTodayItems(
      {
        appointments: [],
        milestones: [],
        journalEntries: [makeJournalEntry({ title: null })],
        medications: [],
      },
      NOW,
    );
    expect(items[0].title).toBe('Journal entry');
  });
});

describe('calculateTodayItems — medications', () => {
  it('classifies a medication due today (via a real schedule resolution) as due_today', () => {
    const items = calculateTodayItems(
      {
        appointments: [],
        milestones: [],
        journalEntries: [],
        medications: [
          makeMedication({ frequency_type: 'daily', frequency_config: { time_of_day: '09:00' } }),
        ],
      },
      NOW,
    );
    expect(items).toHaveLength(1);
    expect(items[0].bucket).toBe('due_today');
  });

  it('classifies a medication next due within the window as upcoming', () => {
    const items = calculateTodayItems(
      {
        appointments: [],
        milestones: [],
        journalEntries: [],
        medications: [
          makeMedication({
            frequency_type: 'weekly',
            frequency_config: { days_of_week: [(NOW.getUTCDay() + 2) % 7] },
          }),
        ],
      },
      NOW,
    );
    expect(items[0].bucket).toBe('upcoming');
  });

  it('never manufactures a medication card when there is no frequency set', () => {
    const items = calculateTodayItems(
      { appointments: [], milestones: [], journalEntries: [], medications: [makeMedication()] },
      NOW,
    );
    expect(items).toHaveLength(0);
  });
});

describe('rankItems', () => {
  it('orders due_today before upcoming before recent/meaningful', () => {
    const future = new Date(NOW.getTime() + 2 * 24 * 60 * 60 * 1000);
    const items = calculateTodayItems(
      {
        appointments: [
          makeAppointment({ id: 'upcoming-apt', starts_at: future.toISOString() }),
          makeAppointment({ id: 'today-apt', starts_at: NOW.toISOString() }),
        ],
        milestones: [makeMilestone()],
        journalEntries: [],
        medications: [],
      },
      NOW,
    );
    const ranked = rankItems(items);
    expect(ranked.map((i) => i.bucket)).toEqual(['due_today', 'upcoming', 'meaningful']);
  });
});

describe('filterIrrelevantItems', () => {
  it('drops any item explicitly marked hidden', () => {
    const items = calculateTodayItems(
      { appointments: [], milestones: [], journalEntries: [], medications: [] },
      NOW,
    );
    const withHidden = [
      ...items,
      {
        id: 'x',
        moduleKey: 'journal' as const,
        bucket: 'hidden' as const,
        sourceId: 'x',
        title: 'x',
        at: NOW.toISOString(),
      },
    ];
    expect(filterIrrelevantItems(withHidden)).toHaveLength(0);
  });
});

describe('buildTodayDashboard', () => {
  it('never manufactures content — returns an empty array when there is nothing relevant', () => {
    // "Do not manufacture content when the user has nothing to show." —
    // docs/MASTER_BUILD_SPEC.md §31, Non-Negotiable Rule 11.
    expect(
      buildTodayDashboard(
        { appointments: [], milestones: [], journalEntries: [], medications: [] },
        NOW,
      ),
    ).toEqual([]);
  });

  it('is deterministic for the same input and `now`', () => {
    const records = {
      appointments: [makeAppointment()],
      milestones: [makeMilestone()],
      journalEntries: [],
      medications: [],
    };
    expect(buildTodayDashboard(records, NOW)).toEqual(buildTodayDashboard(records, NOW));
  });
});
