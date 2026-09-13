import { describe, expect, it } from 'vitest';
import { isP0Module, MODULE_KEYS, P0_MODULE_KEYS, P1_MODULE_KEYS } from '../modules';

describe('module scoping', () => {
  it('P0 and P1 module keys together account for exactly the full set, with no overlap', () => {
    const combined = [...P0_MODULE_KEYS, ...P1_MODULE_KEYS].sort();
    const all = [...MODULE_KEYS].sort();
    expect(combined).toEqual(all);
    expect(new Set(P0_MODULE_KEYS).size + new Set(P1_MODULE_KEYS).size).toBe(MODULE_KEYS.length);
  });

  it('isP0Module matches docs/DECISIONS.md exactly: medications, injections, appointments, milestones, journal', () => {
    expect(isP0Module('medications')).toBe(true);
    expect(isP0Module('injections')).toBe(true);
    expect(isP0Module('appointments')).toBe(true);
    expect(isP0Module('milestones')).toBe(true);
    expect(isP0Module('journal')).toBe(true);
  });

  it('isP0Module is false for every P1 module: labs, procedures, memories, legal, documents', () => {
    expect(isP0Module('labs')).toBe(false);
    expect(isP0Module('procedures')).toBe(false);
    expect(isP0Module('memories')).toBe(false);
    expect(isP0Module('legal')).toBe(false);
    expect(isP0Module('documents')).toBe(false);
  });
});
