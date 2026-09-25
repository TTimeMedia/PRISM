import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { PRISMChip, PRISMInput, spacing } from '@prism/ui';
import { SUGGESTED_JOURNAL_TAGS } from '../optionLabels';

export interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
}

/**
 * A simple, non-clinical tag entry for journal entries — type and press
 * return, tap a tag to remove it. Suggested tags are optional shortcuts
 * that toggle the same underlying array; custom tags not in the
 * suggested list are shown separately below.
 */
export function TagInput({ value, onChange }: TagInputProps) {
  const [draft, setDraft] = useState('');

  const addTag = () => {
    const tag = draft.trim();
    if (tag && !value.includes(tag) && value.length < 20) {
      onChange([...value, tag]);
    }
    setDraft('');
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const toggleSuggested = (tag: string) => {
    if (value.includes(tag)) {
      removeTag(tag);
    } else if (value.length < 20) {
      onChange([...value, tag]);
    }
  };

  const customTags = value.filter((tag) => !SUGGESTED_JOURNAL_TAGS.includes(tag as never));

  return (
    <View style={styles.container}>
      <PRISMInput
        label="Tags"
        placeholder="Add a tag"
        value={draft}
        onChangeText={setDraft}
        onSubmitEditing={addTag}
        returnKeyType="done"
      />
      <View style={styles.chips}>
        {SUGGESTED_JOURNAL_TAGS.map((tag) => (
          <PRISMChip
            key={tag}
            label={tag}
            selected={value.includes(tag)}
            onPress={() => toggleSuggested(tag)}
          />
        ))}
      </View>
      {customTags.length > 0 ? (
        <View style={styles.chips}>
          {customTags.map((tag) => (
            <PRISMChip key={tag} label={tag} selected onPress={() => removeTag(tag)} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
