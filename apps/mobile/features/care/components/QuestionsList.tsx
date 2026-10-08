import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Check, Plus, Trash2 } from 'lucide-react-native';
import { PRISMIconButton, fontWeight, radius, spacing, type, useTheme, useToast } from '@prism/ui';
import type { AppointmentQuestion } from '@prism/types';
import {
  useAddQuestion,
  useDeleteQuestion,
  useSetQuestionAsked,
} from '../../../lib/care/questions';

interface QuestionsListProps {
  questions: AppointmentQuestion[];
  /** Where new questions go; null means "the next appointment". */
  appointmentId: string | null;
  placeholder?: string;
}

/**
 * A short checklist of questions: type one and add it, tick it once it's been
 * asked, or remove it. Used on an appointment and on the questions screen.
 */
export function QuestionsList({ questions, appointmentId, placeholder }: QuestionsListProps) {
  const theme = useTheme();
  const { showToast } = useToast();
  const add = useAddQuestion();
  const setAsked = useSetQuestionAsked();
  const remove = useDeleteQuestion();
  const [draft, setDraft] = useState('');

  const submit = async () => {
    const question = draft.trim();
    if (!question) return;
    try {
      await add.mutateAsync({ question, appointmentId });
      setDraft('');
    } catch {
      showToast("Couldn't add that question. Try again.", 'error');
    }
  };

  const open = questions.filter((q) => !q.asked);
  const asked = questions.filter((q) => q.asked);

  return (
    <View style={styles.wrap}>
      {[...open, ...asked].map((q) => (
        <View key={q.id} style={styles.row}>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: q.asked }}
            accessibilityLabel={q.asked ? `Asked: ${q.question}` : q.question}
            onPress={() => setAsked.mutate({ id: q.id, asked: !q.asked })}
            hitSlop={8}
            style={[
              styles.box,
              {
                borderColor: q.asked ? theme.accent : theme.colors.border.strong,
                backgroundColor: q.asked ? theme.accent : 'transparent',
              },
            ]}
          >
            {q.asked ? <Check size={14} color={theme.onAccent} strokeWidth={3} /> : null}
          </Pressable>
          <Text
            style={[
              styles.text,
              {
                color: q.asked ? theme.colors.text.tertiary : theme.colors.text.primary,
                textDecorationLine: q.asked ? 'line-through' : 'none',
              },
            ]}
          >
            {q.question}
          </Text>
          <PRISMIconButton accessibilityLabel="Remove question" onPress={() => remove.mutate(q.id)}>
            <Trash2 size={16} color={theme.colors.text.tertiary} />
          </PRISMIconButton>
        </View>
      ))}

      <View
        style={[
          styles.addRow,
          { backgroundColor: theme.colors.field, borderColor: theme.colors.fieldBorder },
        ]}
      >
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={submit}
          placeholder={placeholder ?? 'Add a question'}
          placeholderTextColor={theme.colors.text.tertiary}
          returnKeyType="done"
          maxLength={500}
          style={[styles.input, { color: theme.colors.text.primary }]}
          accessibilityLabel="New question"
        />
        <PRISMIconButton accessibilityLabel="Add question" onPress={submit}>
          <Plus size={20} color={draft.trim() ? theme.accent : theme.colors.text.tertiary} />
        </PRISMIconButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.smd },
  box: {
    width: 22,
    height: 22,
    borderRadius: radius.xs,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    fontSize: type.bodyM.fontSize,
    lineHeight: type.bodyM.lineHeight,
    fontWeight: fontWeight.regular as '400',
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingLeft: spacing.smd,
  },
  input: {
    flex: 1,
    minHeight: 44,
    fontSize: type.bodyM.fontSize,
  },
});
