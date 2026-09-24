import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Check, ChevronDown, Plus } from 'lucide-react-native';
import {
  PRISMButton,
  PRISMSheet,
  componentRadius,
  fontWeight,
  layout,
  radius,
  spacing,
  type,
  useTheme,
} from '@prism/ui';

export interface ListPickerFieldProps {
  label: string;
  /** The current value; free text, so it can be one of `options` or something typed. */
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  /** Shown in the field while nothing is chosen. */
  placeholder?: string;
  /**
   * Long lists: adds a search box at the top, and typing something that
   * isn't in the list offers to use it as written. Short lists: adds a
   * "Write your own" row that opens a text box instead.
   */
  searchable?: boolean;
  /** Label of the row that lets someone write their own answer. */
  customLabel?: string;
  /** Shown above the text box when writing their own answer. */
  customPrompt?: string;
  error?: string;
}

/**
 * A field that looks like a text input but opens a scrollable list to pick
 * from. Nothing is forced: people can always write their own answer, and
 * clear what they chose. Used for pronouns, gender, and medication names.
 */
export function ListPickerField({
  label,
  value,
  onChange,
  options,
  placeholder = 'Choose',
  searchable = false,
  customLabel = 'Write your own',
  customPrompt = 'Write your own',
  error,
}: ListPickerFieldProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [writingOwn, setWritingOwn] = useState(false);
  const [draft, setDraft] = useState('');

  const close = () => {
    setOpen(false);
    setQuery('');
    setWritingOwn(false);
    setDraft('');
  };
  const choose = (next: string) => {
    onChange(next);
    close();
  };

  const trimmedQuery = query.trim();
  const filtered = useMemo(() => {
    if (!searchable || !trimmedQuery) return options;
    const needle = trimmedQuery.toLowerCase();
    return options.filter((option) => option.toLowerCase().includes(needle));
  }, [options, searchable, trimmedQuery]);
  const exactMatch = options.some((option) => option.toLowerCase() === trimmedQuery.toLowerCase());

  const borderColor = error ? theme.destructive : open ? theme.accent : theme.colors.fieldBorder;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.text.secondary }]}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value || placeholder}`}
        onPress={() => {
          setDraft(value && !options.includes(value) ? value : '');
          setOpen(true);
        }}
        style={[styles.field, { backgroundColor: theme.colors.field, borderColor }]}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.fieldText,
            { color: value ? theme.colors.text.primary : theme.colors.text.tertiary },
          ]}
        >
          {value || placeholder}
        </Text>
        <ChevronDown size={20} color={theme.colors.text.tertiary} />
      </Pressable>
      {error ? <Text style={[styles.error, { color: theme.destructive }]}>{error}</Text> : null}

      <PRISMSheet visible={open} title={label} onRequestClose={close}>
        {writingOwn ? (
          <View style={styles.writeOwn}>
            <Text style={[styles.hint, { color: theme.colors.text.secondary }]}>
              {customPrompt}
            </Text>
            <TextInput
              autoFocus
              accessibilityLabel={customPrompt}
              value={draft}
              onChangeText={setDraft}
              returnKeyType="done"
              onSubmitEditing={() => draft.trim() && choose(draft.trim())}
              placeholderTextColor={theme.colors.text.tertiary}
              style={[
                styles.input,
                {
                  color: theme.colors.text.primary,
                  backgroundColor: theme.colors.field,
                  borderColor: theme.accent,
                },
              ]}
            />
            <PRISMButton
              label="Use this"
              disabled={!draft.trim()}
              onPress={() => choose(draft.trim())}
            />
            <PRISMButton
              label="Back to the list"
              variant="tertiary"
              onPress={() => setWritingOwn(false)}
            />
          </View>
        ) : (
          <>
            {searchable ? (
              <TextInput
                accessibilityLabel={`Search ${label}`}
                value={query}
                onChangeText={setQuery}
                placeholder="Search or type your own"
                placeholderTextColor={theme.colors.text.tertiary}
                autoCapitalize="words"
                autoCorrect={false}
                style={[
                  styles.input,
                  {
                    color: theme.colors.text.primary,
                    backgroundColor: theme.colors.field,
                    borderColor: theme.colors.fieldBorder,
                  },
                ]}
              />
            ) : null}
            <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
              {searchable && trimmedQuery && !exactMatch ? (
                <Row
                  label={`Add "${trimmedQuery}"`}
                  leading={<Plus size={18} color={theme.accent} />}
                  onPress={() => choose(trimmedQuery)}
                />
              ) : null}
              {filtered.map((option) => (
                <Row
                  key={option}
                  label={option}
                  selected={option === value}
                  onPress={() => choose(option)}
                />
              ))}
              {!searchable ? (
                <Row
                  label={customLabel}
                  selected={!!value && !options.includes(value)}
                  leading={<Plus size={18} color={theme.accent} />}
                  onPress={() => setWritingOwn(true)}
                />
              ) : null}
            </ScrollView>
            {value ? (
              <PRISMButton label="Clear" variant="tertiary" onPress={() => choose('')} />
            ) : null}
          </>
        )}
      </PRISMSheet>
    </View>
  );
}

function Row({
  label,
  selected = false,
  leading,
  onPress,
}: {
  label: string;
  selected?: boolean;
  leading?: React.ReactNode;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: selected
            ? `${theme.accent}22`
            : pressed
              ? theme.colors.surfaceSelected
              : 'transparent',
        },
      ]}
    >
      {leading}
      <Text
        style={[
          styles.rowLabel,
          {
            color: theme.colors.text.primary,
            fontWeight: (selected ? fontWeight.semibold : fontWeight.regular) as '400' | '600',
          },
        ]}
      >
        {label}
      </Text>
      {selected ? <Check size={20} color={theme.accent} strokeWidth={2.6} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
    fontWeight: fontWeight.medium as '500',
    marginBottom: 6,
  },
  field: {
    height: layout.inputHeight,
    borderRadius: componentRadius.input,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  fieldText: {
    flex: 1,
    fontSize: type.bodyL.fontSize,
  },
  error: {
    fontSize: type.caption.fontSize,
    lineHeight: type.caption.lineHeight,
    marginTop: spacing.xs,
  },
  list: {
    maxHeight: 340,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: layout.minTouchTarget + 4,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  rowLabel: {
    flex: 1,
    fontSize: type.bodyL.fontSize,
    lineHeight: type.bodyL.lineHeight,
  },
  input: {
    height: layout.inputHeight,
    borderRadius: componentRadius.input,
    borderWidth: 1.5,
    paddingHorizontal: spacing.md,
    fontSize: type.bodyL.fontSize,
    marginBottom: spacing.sm,
  },
  writeOwn: {
    gap: spacing.sm,
  },
  hint: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
  },
});
