import { careSetupSignalFromModules } from '../careSetupSignal';
import type { Module } from '@prism/types';

function makeModule(overrides: Partial<Module>): Module {
  return {
    id: 'm1',
    user_id: 'u1',
    module_key: 'medications',
    enabled: true,
    configuration: {},
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('careSetupSignalFromModules', () => {
  it('returns an empty signal when no modules are enabled', () => {
    expect(careSetupSignalFromModules(undefined)).toEqual([]);
    expect(careSetupSignalFromModules([])).toEqual([]);
  });

  it('includes "medication" when the medications module is enabled', () => {
    const modules = [makeModule({ module_key: 'medications', enabled: true })];
    expect(careSetupSignalFromModules(modules)).toContain('medication');
  });

  it('does not treat the retired injections switch as its own signal', () => {
    const modules = [makeModule({ module_key: 'injections', enabled: true })];
    expect(careSetupSignalFromModules(modules)).toEqual([]);
  });

  it('ignores a disabled module even if the row exists', () => {
    const modules = [makeModule({ module_key: 'medications', enabled: false })];
    expect(careSetupSignalFromModules(modules)).not.toContain('medication');
  });
});
