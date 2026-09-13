import React from 'react';
import { PRISMChipGroup } from '@prism/ui';

export interface ChipSelectOption {
  value: string;
  label: string;
}

export interface ChipSelectProps {
  options: readonly ChipSelectOption[];
  selected: readonly string[];
  onChange: (next: string[]) => void;
  /** Single-select behaves like a radio group instead of independent toggles. */
  multiple?: boolean;
}

/**
 * Wrapping chip group for onboarding's multi/single-select screens. Thin
 * adapter over the shared `PRISMChipGroup` (packages/ui), keeping
 * onboarding's existing array-value, no-own-label call-site contract.
 */
export function ChipSelect({ options, selected, onChange, multiple = true }: ChipSelectProps) {
  return (
    <PRISMChipGroup options={options} value={selected} onChange={onChange} multiple={multiple} />
  );
}
