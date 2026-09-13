import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTheme } from '../theme/ThemeProvider';
import { componentRadius } from '../tokens/radius';
import { layout, spacing } from '../tokens/spacing';
import { fontWeight, type } from '../tokens/typography';
import { PRISMButton } from './PRISMButton';
import { PRISMSheet } from './PRISMSheet';

export interface PRISMDateInputProps {
  /** Always visible — never rely on placeholder text as the only label. See docs/DESIGN_SYSTEM.md §11. */
  label: string;
  /** The canonical wire format, YYYY-MM-DD, or '' when nothing is chosen yet. */
  value: string;
  onChangeText: (value: string) => void;
  onBlur?: () => void;
  helperText?: string;
  error?: string;
  placeholder?: string;
  editable?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
  testID?: string;
}

/**
 * A native date field (docs/SCREEN_BIBLE.md §3's Global Screen Contract) —
 * tapping opens the platform's own date picker instead of a keyboard, so a
 * date is always selected, never typed. Value stays the app's canonical
 * YYYY-MM-DD string; every call site that already wires
 * value/onChangeText/onBlur/error through react-hook-form keeps working
 * unchanged.
 */
export function PRISMDateInput({
  label,
  value,
  onChangeText,
  onBlur,
  helperText,
  error,
  placeholder = 'Choose a date',
  editable = true,
  minimumDate,
  maximumDate,
  testID,
}: PRISMDateInputProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Date>(() => parseIsoDate(value) ?? new Date());

  const borderColor = error ? theme.destructive : theme.colors.border.default;
  const displayValue = value ? formatDisplayDate(value) : null;

  function openPicker() {
    if (!editable) return;
    setDraft(parseIsoDate(value) ?? new Date());
    setOpen(true);
  }

  function handleAndroidChange(event: DateTimePickerEvent, selected?: Date) {
    setOpen(false);
    onBlur?.();
    if (event.type === 'set' && selected) {
      onChangeText(formatIsoDate(selected));
    }
  }

  function handleCancel() {
    setOpen(false);
    onBlur?.();
  }

  function handleConfirm() {
    setOpen(false);
    onBlur?.();
    onChangeText(formatIsoDate(draft));
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.text.secondary }]}>{label}</Text>
      <Pressable
        testID={testID}
        onPress={openPicker}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint="Opens a date picker"
        accessibilityValue={displayValue ? { text: displayValue } : undefined}
        accessibilityState={{ disabled: !editable }}
        style={[
          styles.field,
          {
            backgroundColor: theme.colors.surfaceElevated,
            borderColor,
            opacity: editable ? 1 : 0.6,
          },
        ]}
      >
        <Text
          style={[
            styles.fieldText,
            { color: displayValue ? theme.colors.text.primary : theme.colors.text.tertiary },
          ]}
        >
          {displayValue ?? placeholder}
        </Text>
      </Pressable>
      {error ? (
        <Text
          accessibilityLiveRegion="polite"
          style={[styles.helper, { color: theme.destructive }]}
        >
          {error}
        </Text>
      ) : helperText ? (
        <Text style={[styles.helper, { color: theme.colors.text.tertiary }]}>{helperText}</Text>
      ) : null}

      {open && Platform.OS === 'android' ? (
        <DateTimePicker
          testID={testID ? `${testID}-native` : undefined}
          value={draft}
          mode="date"
          display="default"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={handleAndroidChange}
        />
      ) : null}

      {Platform.OS !== 'android' ? (
        <PRISMSheet visible={open} title={label} onRequestClose={handleCancel}>
          <DateTimePicker
            testID={testID ? `${testID}-native` : undefined}
            value={draft}
            mode="date"
            display="inline"
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            onChange={(_event, selected) => selected && setDraft(selected)}
          />
          <View style={styles.sheetActions}>
            <View style={styles.sheetActionButton}>
              <PRISMButton label="Cancel" variant="secondary" onPress={handleCancel} />
            </View>
            <View style={styles.sheetActionButton}>
              <PRISMButton label="Done" onPress={handleConfirm} />
            </View>
          </View>
        </PRISMSheet>
      ) : null}
    </View>
  );
}

/** Parses the app's YYYY-MM-DD wire format as a local date, avoiding UTC-shift bugs from `new Date(string)`. */
function parseIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

/** Formats a Date as the app's canonical YYYY-MM-DD wire format, using local date parts (not toISOString, which shifts by timezone). */
function formatIsoDate(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Human, locale-respecting display for an already-chosen date. */
function formatDisplayDate(value: string): string {
  const date = parseIsoDate(value);
  if (!date) return value;
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
    fontWeight: fontWeight.medium as '500',
    marginBottom: spacing.xs,
  },
  field: {
    height: layout.inputHeight,
    borderRadius: componentRadius.input,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  fieldText: {
    fontSize: type.bodyL.fontSize,
  },
  helper: {
    fontSize: type.caption.fontSize,
    lineHeight: type.caption.lineHeight,
    marginTop: spacing.xs,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  sheetActionButton: {
    flex: 1,
  },
});
