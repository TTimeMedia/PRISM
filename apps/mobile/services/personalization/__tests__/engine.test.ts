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
    image_path: null,
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
    image_path: null,
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
        medications: [],
      },
      NOW,
    );
    expect(items).toHaveLength(0);
  });
});

describe('calculateTodayItems — milestones', () => {
  it('classifies a recent milestone as meaningful', () => {
    const items = calculateTodayItems(
      { appointments: [], milestones: [makeMilestone()], medications: [] },
      NOW,
    );
    expect(items[0].bucket).toBe('meaningful');
  });
});

describe('calculateTodayItems — journal entries never become a TODAY card', () => {
  // Regression: a real, freshly-created journal entry
  // ("Today I Used My App For The First Time") was surfacing as TODAY's
  // main content card. TODAY's card types are Medication (due today),
  // Appointment (upcoming), and Journey (recent milestone) — see
  // docs/SCREEN_BIBLE.md Screen 20. Journal is not one of them; it stays
  // reachable via JOURNEY → Journal and Timeline instead. RelevantRecords
  // no longer even accepts journal entries as an input — the pipeline
  // has no way to turn one into a TodayItem, so this isn't just a
  // filtered-out case, it's structurally impossible.
  it('accepts no journalEntries field at all — TypeScript itself would reject one', () => {
    const records: Parameters<typeof calculateTodayItems>[0] = {
      appointments: [],
      milestones: [],
      medications: [],
    };
    // @ts-expect-error — journalEntries is not part of RelevantRecords.
    records.journalEntries = [makeJournalEntry()];
    expect(calculateTodayItems(records, NOW)).toEqual([]);
  });

  it('a milestone and an appointment on the same day as a journal entry still surface normally — the fix is scoped to journal only', () => {
    const items = calculateTodayItems(
      {
        appointments: [makeAppointment({ starts_at: NOW.toISOString() })],
        milestones: [makeMilestone()],
        medications: [],
      },
      NOW,
    );
    expect(items.map((i) => i.moduleKey).sort()).toEqual(['appointments', 'milestones']);
  });
});

describe('calculateTodayItems — medications', () => {
  it('classifies a medication due today (via a real schedule resolution) as due_today', () => {
    const items = calculateTodayItems(
      {
        appointments: [],
        milestones: [],
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
      { appointments: [], milestones: [], medications: [makeMedication()] },
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
    const items = calculateTodayItems({ appointments: [], milestones: [], medications: [] }, NOW);
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
    expect(buildTodayDashboard({ appointments: [], milestones: [], medications: [] }, NOW)).toEqual(
      [],
    );
  });

  it('is deterministic for the same input and `now`', () => {
    const records = {
      appointments: [makeAppointment()],
      milestones: [makeMilestone()],
      medications: [],
    };
    expect(buildTodayDashboard(records, NOW)).toEqual(buildTodayDashboard(records, NOW));
  });
});
