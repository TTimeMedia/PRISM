import React, { useMemo, useState } from 'react';
import { Text } from 'react-native';
import { PRISMInput, spacing, type, useTheme } from '@prism/ui';
import { ChipField, type ChipFieldOption } from './ChipField';

export interface MedicationPickerProps {
  label: string;
  options: readonly ChipFieldOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  /** Above this many medications, a flat chip row gets hard to scan — show a search box first. */
  searchThreshold?: number;
}

/**
 * Selecting among the user's own already-created medications (never an
 * external drug database — see docs/DECISIONS.md and
 * docs/PRODUCT_BIBLE.md §12) — a short list stays the existing chip row;
 * once it's long enough to be hard to scan, a search field filters it so
 * the user still selects rather than types the record's name from
 * scratch.
 */
export function MedicationPicker({
  label,
  options,
  value,
  onChange,
  searchThreshold = 6,
}: MedicationPickerProps) {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const showSearch = options.length > searchThreshold;

  const filtered = useMemo(() => {
    if (!showSearch || !query.trim()) return options;
    const needle = query.trim().toLowerCase();
    return options.filter((option) => option.label.toLowerCase().includes(needle));
  }, [options, query, showSearch]);

  return (
    <>
      {showSearch ? (
        <PRISMInput
          label={`Search ${label.toLowerCase()}`}
          value={query}
          onChangeText={setQuery}
          placeholder="Type to filter…"
          returnKeyType="search"
        />
      ) : null}
      {filtered.length > 0 ? (
        <ChipField label={label} options={filtered} value={value} onChange={onChange} />
      ) : (
        <Text
          style={{
            color: theme.colors.text.tertiary,
            fontSize: type.bodyS.fontSize,
            lineHeight: type.bodyS.lineHeight,
            marginBottom: spacing.md,
          }}
        >
          No matches.
        </Text>
      )}
    </>
  );
}
