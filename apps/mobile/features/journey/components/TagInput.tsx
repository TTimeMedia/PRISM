import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { PRISMChip, PRISMInput, spacing } from '@prism/ui';

export interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
}

/** A simple, non-clinical tag entry for journal entries — type and press return, tap a tag to remove it. */
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
      {value.length > 0 ? (
        <View style={styles.chips}>
          {value.map((tag) => (
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
