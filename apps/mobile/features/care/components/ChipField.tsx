import React from 'react';
import { PRISMChipGroup } from '@prism/ui';

export interface ChipFieldOption {
  value: string;
  label: string;
}

export interface ChipFieldProps {
  label: string;
  options: readonly ChipFieldOption[];
  value: string | null;
  onChange: (value: string | null) => void;
}

/**
 * A labeled single-select chip row — Form, Frequency, Injection Site, Log
 * Status. Thin adapter over the shared `PRISMChipGroup` (packages/ui),
 * keeping CARE's existing single-nullable-value call-site contract.
 */
export function ChipField({ label, options, value, onChange }: ChipFieldProps) {
  return (
    <PRISMChipGroup
      label={label}
      options={options}
      value={value ? [value] : []}
      onChange={(next) => onChange(next[0] ?? null)}
    />
  );
}
