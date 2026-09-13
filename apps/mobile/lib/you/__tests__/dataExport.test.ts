import { buildDataExport, type DataExportRecords } from '../dataExport';

function records(): DataExportRecords {
  return {
    profile: null,
    settings: null,
    modules: [],
    medications: [],
    medication_logs: [],
    injections: [],
    appointments: [],
    milestones: [],
    journal_entries: [],
  };
}

describe('buildDataExport', () => {
  it('stamps an export time alongside every P0 table', () => {
    const now = new Date('2026-06-01T12:00:00.000Z');
    const result = buildDataExport(records(), now);

    expect(result.exported_at).toBe('2026-06-01T12:00:00.000Z');
    expect(result.medications).toEqual([]);
    expect(result.journal_entries).toEqual([]);
  });

  it('carries the given records through unchanged', () => {
    const input = records();
    input.profile = { id: 'p1' } as never;
    const result = buildDataExport(input);

    expect(result.profile).toBe(input.profile);
  });
});
