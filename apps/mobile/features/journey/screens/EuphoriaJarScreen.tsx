import React, { useState } from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { ArrowLeft, Sparkles, Trash2 } from 'lucide-react-native';
import {
  PRISMButton,
  PRISMCard,
  PRISMErrorState,
  PRISMHeader,
  PRISMIconButton,
  PRISMSkeleton,
  PRISMTextArea,
  fontWeight,
  radius,
  spacing,
  type,
  useTheme,
  useToast,
} from '@prism/ui';
import type { EuphoriaMoment } from '@prism/types';
import {
  pickMoment,
  useDeleteEuphoria,
  useEuphoriaMoments,
  useSaveEuphoria,
} from '../../../lib/journey/euphoria';
import { useTint } from '../../../components/home/tint';

const MAX_LENGTH = 280;

/**
 * Euphoria jar: save the small good moments in a tap ("got called sir",
 * "my voice cracked low"), and on a hard day shake the jar to get one back.
 */
export function EuphoriaJarScreen() {
  const theme = useTheme();
  const tint = useTint('violet');
  const { showToast } = useToast();
  const { data: moments, isLoading, isError, refetch } = useEuphoriaMoments();
  const save = useSaveEuphoria();
  const remove = useDeleteEuphoria();
  const [text, setText] = useState('');
  const [inputKey, setInputKey] = useState(0);
  const [shown, setShown] = useState<EuphoriaMoment | null>(null);

  const onSave = async () => {
    const value = text.trim();
    if (!value) return;
    try {
      await save.mutateAsync(value);
      setText('');
      setInputKey((key) => key + 1);
      showToast('Saved to your jar.', 'success');
    } catch {
      showToast("Couldn't save that. Try again.", 'error');
    }
  };

  const onShake = () => setShown(pickMoment(moments ?? [], shown?.id ?? null));

  const onDelete = async (id: string) => {
    try {
      await remove.mutateAsync(id);
      if (shown?.id === id) setShown(null);
    } catch {
      showToast("Couldn't remove that. Try again.", 'error');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PRISMHeader
        title="Euphoria jar"
        leading={
          <PRISMIconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.text.primary} />
          </PRISMIconButton>
        }
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.intro, { color: theme.colors.text.secondary }]}>
          Save the small good moments, the ones that felt like you. On a hard day, shake the jar and
          one comes back.
        </Text>

        <PRISMTextArea
          key={inputKey}
          label="A good moment"
          placeholder="Got called “sir” at the coffee shop."
          defaultValue=""
          onChangeText={setText}
          maxLength={MAX_LENGTH}
          minLines={2}
        />
        <PRISMButton
          label="Add to the jar"
          loading={save.isPending}
          disabled={!text.trim()}
          onPress={onSave}
        />

        {isLoading ? (
          <PRISMSkeleton height={120} />
        ) : isError ? (
          <PRISMErrorState onRetry={() => refetch()} />
        ) : (moments ?? []).length > 0 ? (
          <>
            <View style={[styles.jar, { backgroundColor: tint.tile, borderColor: tint.border }]}>
              <Sparkles size={28} color={tint.solid} />
              <Text style={[styles.jarCount, { color: theme.colors.text.primary }]}>
                {moments!.length === 1 ? '1 moment saved' : `${moments!.length} moments saved`}
              </Text>
              {shown ? (
                <Animated.View
                  key={shown.id}
                  entering={FadeIn.duration(320)}
                  exiting={FadeOut.duration(160)}
                  style={styles.shown}
                >
                  <Text style={[styles.shownText, { color: theme.colors.text.primary }]}>
                    {shown.text}
                  </Text>
                  <Text style={[styles.date, { color: theme.colors.text.tertiary }]}>
                    {formatDate(shown.created_at)}
                  </Text>
                </Animated.View>
              ) : null}
              <PRISMButton
                label={shown ? 'Shake again' : 'Shake the jar'}
                variant="secondary"
                onPress={onShake}
              />
            </View>

            <Text style={[styles.heading, { color: theme.colors.text.primary }]}>
              Everything in the jar
            </Text>
            <View style={styles.list}>
              {moments!.map((moment) => (
                <PRISMCard key={moment.id}>
                  <View style={styles.row}>
                    <View style={styles.rowText}>
                      <Text style={[styles.momentText, { color: theme.colors.text.primary }]}>
                        {moment.text}
                      </Text>
                      <Text style={[styles.date, { color: theme.colors.text.tertiary }]}>
                        {formatDate(moment.created_at)}
                      </Text>
                    </View>
                    <PRISMIconButton
                      accessibilityLabel="Remove this moment"
                      onPress={() => onDelete(moment.id)}
                    >
                      <Trash2 size={18} color={theme.colors.text.tertiary} />
                    </PRISMIconButton>
                  </View>
                </PRISMCard>
              ))}
            </View>
          </>
        ) : (
          <Text style={[styles.empty, { color: theme.colors.text.tertiary }]}>
            Your jar is empty for now. The first good moment goes here.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  intro: { fontSize: type.bodyM.fontSize, lineHeight: type.bodyM.lineHeight },
  jar: {
    marginTop: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
    alignItems: 'center',
  },
  jarCount: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
    fontWeight: fontWeight.semibold as '600',
  },
  shown: { alignItems: 'center', gap: spacing.xs },
  shownText: {
    fontSize: type.headingL.fontSize,
    lineHeight: type.headingL.lineHeight,
    fontWeight: fontWeight.semibold as '600',
    textAlign: 'center',
  },
  heading: {
    marginTop: spacing.md,
    fontSize: type.headingM.fontSize,
    lineHeight: type.headingM.lineHeight,
    fontWeight: fontWeight.semibold as '600',
  },
  list: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowText: { flex: 1, gap: spacing.xs },
  momentText: { fontSize: type.bodyM.fontSize, lineHeight: type.bodyM.lineHeight },
  date: { fontSize: type.caption.fontSize, lineHeight: type.caption.lineHeight },
  empty: { fontSize: type.bodyS.fontSize, lineHeight: type.bodyS.lineHeight, textAlign: 'center' },
});
