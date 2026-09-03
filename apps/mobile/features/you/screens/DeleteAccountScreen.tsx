import React, { useState } from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import {
  PRISMButton,
  PRISMHeader,
  PRISMIconButton,
  PRISMInput,
  spacing,
  type,
  useTheme,
  useToast,
} from '@prism/ui';
import { supabase } from '../../../lib/supabase/client';
import { signOut } from '../../../lib/auth/actions';

const CONFIRM_PHRASE = 'DELETE';

/**
 * Screen 64 — Delete Account. Deleting an `auth.users` row requires the
 * Supabase service-role key, which must never ship in the mobile app
 * (docs/SECURITY.md) — so this calls a `delete-account` Edge Function.
 * That function doesn't exist yet (no server-side Edge Functions have
 * shipped — see supabase/functions/README.md); this screen is real,
 * working UI up to that boundary, and surfaces a clear error rather than
 * pretending to succeed until it's deployed. See docs/DECISIONS.md § YOU.
 */
export function DeleteAccountScreen() {
  const theme = useTheme();
  const { showToast } = useToast();
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const canDelete = confirmText.trim().toUpperCase() === CONFIRM_PHRASE;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase.functions.invoke('delete-account');
      if (error) throw error;
      await signOut();
    } catch {
      showToast("Couldn't delete your account. Please try again later.", 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PRISMHeader
        title="Delete your PRISM account?"
        leading={
          <PRISMIconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.text.primary} />
          </PRISMIconButton>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.copy, { color: theme.colors.text.secondary }]}>
          This permanently deletes your PRISM account and associated information. This cannot be
          undone.
        </Text>
        <PRISMInput
          label={`Type "${CONFIRM_PHRASE}" to confirm`}
          value={confirmText}
          onChangeText={setConfirmText}
          autoCapitalize="characters"
        />
        <PRISMButton
          label="Delete my account"
          variant="destructive"
          disabled={!canDelete}
          loading={deleting}
          onPress={handleDelete}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  copy: {
    fontSize: type.bodyM.fontSize,
    lineHeight: type.bodyM.lineHeight,
  },
});
