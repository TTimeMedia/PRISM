import type { Module } from '@prism/types';

/**
 * Reconstructs a Care-Setup-shaped signal (the slugs
 * careSetupImpliesMedication checks for) from already-persisted
 * module state, for screens reached *after* Care Setup (Medication and
 * Appointment Setup) — including on a resumed flow, where the raw Care
 * Setup selection was never itself persisted (only its effect: which
 * modules got enabled — see docs/DECISIONS.md).
 */
export function careSetupSignalFromModules(modules: Module[] | undefined): string[] {
  const signal: string[] = [];
  if (modules?.some((m) => m.module_key === 'medications' && m.enabled)) signal.push('medication');
  return signal;
}
