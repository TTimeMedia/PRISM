import React, { useState } from 'react';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, Check, X } from 'lucide-react-native';
import {
  BUILT_IN_MESSAGES,
  MAX_CUSTOM_MESSAGES,
  MAX_MESSAGE_LENGTH,
  MESSAGE_PLACEHOLDERS,
  messageOptions,
  renderMessage,
  resolveReminderMessages,
  selectedMessage,
  type ReminderKind,
  type ReminderMessages,
} from '@prism/types';
import {
  PRISMButton,
  PRISMErrorState,
  PRISMHeader,
  PRISMIconButton,
  PRISMInput,
  PRISMSection,
  PRISMSkeleton,
  radius,
  spacing,
  type,
  useTheme,
} from '@prism/ui';
import { useModules, useSettings, useUpdateSettings } from '../../../lib/profile/queries';
import { useAppointments, useMedications } from '../../../lib/care/queries';
import { reminderSampleFor, type ReminderSample } from '../../../lib/reminders/sampleVars';

const SECTIONS: { kind: ReminderKind; title: string; hint: string }[] = [
  { kind: 'medication', title: 'Medications', hint: 'Pills, patches, gels and creams.' },
  { kind: 'injection', title: 'Shot days', hint: 'Medications you inject.' },
  { kind: 'appointment', title: 'Appointments', hint: 'Visits, labs and calls.' },
];

/**
 * Reminder wording. What a reminder says once Private notifications is off:
 * pick one of a few built-in versions for each kind, or write your own with
 * placeholders like {name} and {time}. Each row shows exactly what it would
 * say, with an example. With Private notifications on, reminders stay
 * generic no matter what is chosen here.
 */
export function ReminderMessagesScreen() {
  const theme = useTheme();
  const { data: settings, isLoading, isError, refetch } = useSettings();
  const updateSettings = useUpdateSettings();
  const messages = resolveReminderMessages(settings?.reminder_messages);
  const { data: modules } = useModules();
  const { data: medications } = useMedications();
  const { data: appointments } = useAppointments();

  // Preview each kind on what the person actually has reminders for, and only
  // show the kinds they use. With none on yet, show all three with neutral examples.
  const on = (key: string) => !!modules?.find((m) => m.module_key === key)?.enabled;
  const samples = SECTIONS.map((section) => ({
    ...section,
    sample: reminderSampleFor(
      section.kind,
      on('medications') ? (medications ?? []) : [],
      on('appointments') ? (appointments ?? []) : [],
    ),
  }));
  const anyOwn = samples.some(({ sample }) => sample.own);
  const shown = anyOwn ? samples.filter(({ sample }) => sample.own) : samples;

  const save = (
    kind: ReminderKind,
    choice: { selected?: string; custom: { id: string; text: string }[] },
  ) => updateSettings.mutate({ reminder_messages: { ...messages, [kind]: choice } });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PRISMHeader
        title="Reminder wording."
        leading={
          <PRISMIconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.text.primary} />
          </PRISMIconButton>
        }
      />
      {isLoading ? (
        <PRISMSkeleton height={56} />
      ) : isError || !settings ? (
        <PRISMErrorState onRetry={() => refetch()} />
      ) : (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={[styles.note, { color: theme.colors.text.secondary }]}>
            {settings.notification_privacy
              ? 'Private notifications is on, so reminders stay generic. Turn it off in Notifications to use this wording.'
              : 'Pick what your reminders say, or write your own.'}
          </Text>
          {shown.map(({ kind, title, hint, sample }) => (
            <KindSection
              key={kind}
              kind={kind}
              title={title}
              hint={
                sample.own
                  ? `Previewed on ${sample.vars.name}${sample.count > 1 ? ` and ${sample.count - 1} more` : ''}.`
                  : hint
              }
              sample={sample}
              messages={messages}
              onSave={(choice) => save(kind, choice)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

interface KindSectionProps {
  kind: ReminderKind;
  sample: ReminderSample;
  title: string;
  hint: string;
  messages: ReminderMessages;
  onSave: (choice: { selected?: string; custom: { id: string; text: string }[] }) => void;
}

function KindSection({ kind, sample, title, hint, messages, onSave }: KindSectionProps) {
  const theme = useTheme();
  const [draft, setDraft] = useState('');
  const options = messageOptions(kind, messages);
  const custom = messages[kind]?.custom ?? [];
  const selectedId = selectedMessage(kind, messages).id;
  const builtInIds = new Set(BUILT_IN_MESSAGES[kind].map((option) => option.id));
  const canAdd = custom.length < MAX_CUSTOM_MESSAGES;

  const select = (id: string) => onSave({ selected: id, custom });
  const remove = (id: string) =>
    onSave({
      selected: selectedId === id ? undefined : selectedId,
      custom: custom.filter((c) => c.id !== id),
    });
  const add = () => {
    const text = draft.trim().slice(0, MAX_MESSAGE_LENGTH);
    if (!text) return;
    const id = `c-${Date.now().toString(36)}`;
    onSave({ selected: id, custom: [...custom, { id, text }] });
    setDraft('');
  };

  return (
    <PRISMSection title={title}>
      <Text style={[styles.note, { color: theme.colors.text.tertiary }]}>{hint}</Text>
      <View style={styles.list} accessibilityRole="radiogroup">
        {options.map((option) => {
          const selected = option.id === selectedId;
          const preview = renderMessage(option.text, sample.vars);
          const isCustom = !builtInIds.has(option.id);
          return (
            <View
              key={option.id}
              style={[
                styles.row,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: selected ? theme.accent : theme.colors.border.default,
                  borderWidth: selected ? 2 : 1,
                },
              ]}
            >
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={preview}
                onPress={() => select(option.id)}
                style={styles.rowMain}
              >
                <Text style={[styles.preview, { color: theme.colors.text.primary }]}>
                  {preview}
                </Text>
                {isCustom ? (
                  <Text style={[styles.template, { color: theme.colors.text.tertiary }]}>
                    {option.text}
                  </Text>
                ) : null}
              </Pressable>
              {selected ? (
                <View style={[styles.check, { backgroundColor: theme.accent }]}>
                  <Check size={14} color={theme.onAccent} strokeWidth={3} />
                </View>
              ) : null}
              {isCustom ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Delete "${preview}"`}
                  onPress={() => remove(option.id)}
                  hitSlop={10}
                >
                  <X size={18} color={theme.colors.text.tertiary} />
                </Pressable>
              ) : null}
            </View>
          );
        })}
      </View>
      {canAdd ? (
        <View style={styles.add}>
          <PRISMInput
            label="Write your own"
            value={draft}
            onChangeText={setDraft}
            maxLength={MAX_MESSAGE_LENGTH}
            placeholder={
              kind === 'injection' ? 'Shot day. Be kind to yourself.' : 'Take {name} at {time}'
            }
            helperText="Tap a placeholder to add it."
          />
          <View style={styles.tokens}>
            {MESSAGE_PLACEHOLDERS.map(({ token, label }) => (
              <Pressable
                key={token}
                accessibilityRole="button"
                accessibilityLabel={`Add ${label}`}
                onPress={() =>
                  setDraft(
                    (current) =>
                      `${current}${current && !current.endsWith(' ') ? ' ' : ''}${token}`,
                  )
                }
                style={[
                  styles.token,
                  { borderColor: theme.colors.fieldBorder, backgroundColor: theme.colors.field },
                ]}
              >
                <Text style={[styles.tokenText, { color: theme.colors.text.primary }]}>
                  {token}
                </Text>
              </Pressable>
            ))}
          </View>
          {draft.trim() ? (
            <Text style={[styles.note, { color: theme.colors.text.secondary }]}>
              Looks like: {renderMessage(draft, sample.vars)}
            </Text>
          ) : null}
          <PRISMButton
            label="Add this wording"
            variant="secondary"
            disabled={!draft.trim()}
            onPress={add}
          />
        </View>
      ) : (
        <Text style={[styles.note, { color: theme.colors.text.tertiary }]}>
          You have {MAX_CUSTOM_MESSAGES} of your own here. Delete one to add another.
        </Text>
      )}
    </PRISMSection>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  note: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
    marginTop: spacing.sm,
  },
  list: { gap: spacing.sm, marginTop: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  rowMain: { flex: 1, gap: 2 },
  preview: { fontSize: type.bodyM.fontSize, lineHeight: type.bodyM.lineHeight },
  template: { fontSize: type.caption.fontSize, lineHeight: type.caption.lineHeight },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  add: { gap: spacing.sm, marginTop: spacing.md },
  tokens: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  token: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  tokenText: { fontSize: type.bodyS.fontSize, lineHeight: type.bodyS.lineHeight },
});
