import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTheme } from '../theme/ThemeProvider';
import { componentRadius } from '../tokens/radius';
import { layout, spacing } from '../tokens/spacing';
import { fontWeight, type } from '../tokens/typography';
import { PRISMButton } from './PRISMButton';
import { PRISMSheet } from './PRISMSheet';

export interface PRISMTimeInputProps {
  /** Always visible — never rely on placeholder text as the only label. See docs/DESIGN_SYSTEM.md §11. */
  label: string;
  /** The canonical wire format, 24-hour HH:mm, or '' when nothing is chosen yet. */
  value: string;
  onChangeText: (value: string) => void;
  onBlur?: () => void;
  helperText?: string;
  error?: string;
  placeholder?: string;
  editable?: boolean;
  testID?: string;
}

/**
 * A native time field, the time counterpart to PRISMDateInput — tapping
 * opens the platform's own time picker instead of a keyboard. Value stays
 * the app's canonical 24-hour HH:mm wire format (what the zod schemas and
 * reminder scheduler already expect — see packages/validation's
 * `time_of_day` fields); only the on-screen display respects the device's
 * 12/24-hour locale preference.
 */
export function PRISMTimeInput({
  label,
  value,
  onChangeText,
  onBlur,
  helperText,
  error,
  placeholder = 'Choose a time',
  editable = true,
  testID,
}: PRISMTimeInputProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Date>(() => parseHHmm(value) ?? new Date());

  const borderColor = error ? theme.destructive : theme.colors.fieldBorder;
  const displayValue = value ? formatDisplayTime(value) : null;

  function openPicker() {
    if (!editable) return;
    setDraft(parseHHmm(value) ?? new Date());
    setOpen(true);
  }

  function handleAndroidChange(event: DateTimePickerEvent, selected?: Date) {
    setOpen(false);
    onBlur?.();
    if (event.type === 'set' && selected) {
      onChangeText(formatHHmm(selected));
    }
  }

  function handleCancel() {
    setOpen(false);
    onBlur?.();
  }

  function handleConfirm() {
    setOpen(false);
    onBlur?.();
    onChangeText(formatHHmm(draft));
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.text.secondary }]}>{label}</Text>
      <Pressable
        testID={testID}
        onPress={openPicker}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint="Opens a time picker"
        accessibilityValue={displayValue ? { text: displayValue } : undefined}
        accessibilityState={{ disabled: !editable }}
        style={[
          styles.field,
          {
            backgroundColor: theme.colors.field,
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
          mode="time"
          display="default"
          onChange={handleAndroidChange}
        />
      ) : null}

      {Platform.OS !== 'android' ? (
        <PRISMSheet visible={open} title={label} onRequestClose={handleCancel}>
          <DateTimePicker
            testID={testID ? `${testID}-native` : undefined}
            value={draft}
            mode="time"
            display="spinner"
            themeVariant={theme.scheme}
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

/** Parses the app's 24-hour HH:mm wire format into a Date carrying just that time (today's date, ignored by callers). */
function parseHHmm(value: string): Date | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const [, hours, minutes] = match;
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);
  return date;
}

/** Formats a Date's time-of-day as the app's canonical 24-hour HH:mm wire format. */
function formatHHmm(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/** Human, locale-respecting display (12- or 24-hour per device settings) for an already-chosen time. */
function formatDisplayTime(value: string): string {
  const date = parseHHmm(value);
  if (!date) return value;
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
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
