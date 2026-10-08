import React, { useState } from 'react';
import { router } from 'expo-router';
import { Image, Linking, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { ArrowLeft } from 'lucide-react-native';
import {
  PRISMButton,
  PRISMHeader,
  PRISMIconButton,
  PRISMSwitch,
  PRISMTextArea,
  radius,
  spacing,
  type,
  useTheme,
  useToast,
} from '@prism/ui';
import { KeyboardAwareScreen } from '../../../components/KeyboardAwareScreen';
import { useSession } from '../../../lib/auth/AuthProvider';
import { track } from '../../../lib/analytics/events';
import {
  MAX_SUPPORT_MESSAGE,
  SUPPORT_EMAIL,
  SUPPORT_KINDS,
  submitSupportRequest,
  type SupportKind,
} from '../../../lib/you/support';

export interface SupportFormScreenProps {
  kind: SupportKind;
  /** A screenshot taken when the phone was shaken; attached only if the person turns it on. */
  screenshotUri?: string | null;
  /** The screen it's about, when opened by shaking. */
  fromScreen?: string | null;
}

/**
 * Contact support, Report a problem and Privacy concern. One form, sent from
 * inside the app; replies come by email to the address on the account.
 */
export function SupportFormScreen({ kind, screenshotUri, fromScreen }: SupportFormScreenProps) {
  const theme = useTheme();
  const { showToast } = useToast();
  const { session } = useSession();
  const copy = SUPPORT_KINDS[kind];
  const [message, setMessage] = useState('');
  const [attachScreenshot, setAttachScreenshot] = useState(false);
  const [sending, setSending] = useState(false);

  const send = async () => {
    const userId = session?.user.id;
    if (!userId || !message.trim()) return;
    setSending(true);
    try {
      const { screenshotDropped } = await submitSupportRequest({
        userId,
        kind,
        message,
        screen: fromScreen,
        screenshotUri: attachScreenshot ? screenshotUri : null,
      });
      track('support_request_sent', { kind });
      showToast(
        screenshotDropped ? `${copy.sent} The screenshot couldn't be attached.` : copy.sent,
      );
      router.back();
    } catch {
      showToast("Couldn't send that. Check your connection and try again.", 'error');
    } finally {
      setSending(false);
    }
  };

  const version = Constants.expoConfig?.version ?? 'unknown';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PRISMHeader
        title={`${copy.title}.`}
        leading={
          <PRISMIconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.text.primary} />
          </PRISMIconButton>
        }
      />
      <KeyboardAwareScreen>
        <View style={styles.content}>
          <Text style={[styles.intro, { color: theme.colors.text.secondary }]}>{copy.intro}</Text>
          <PRISMTextArea
            label="Message"
            placeholder={copy.placeholder}
            value={message}
            onChangeText={setMessage}
            maxLength={MAX_SUPPORT_MESSAGE}
            autoFocus={!screenshotUri}
          />
          {screenshotUri ? (
            <View style={styles.shot}>
              <Image
                source={{ uri: screenshotUri }}
                style={[styles.shotImage, { borderColor: theme.colors.border.default }]}
                resizeMode="cover"
                accessibilityLabel="Screenshot of the screen you were on"
              />
              <View style={styles.shotText}>
                <PRISMSwitch
                  label="Attach this screenshot"
                  description="It shows what was on screen, which can include your medications. Attach it only if you're comfortable."
                  value={attachScreenshot}
                  onValueChange={setAttachScreenshot}
                />
              </View>
            </View>
          ) : null}
          <Text style={[styles.note, { color: theme.colors.text.tertiary }]}>
            Sent with your account email (for our reply), Prism {version}, your phone&apos;s system
            version{fromScreen ? ' and the screen you were on' : ''}.
          </Text>
          <PRISMButton
            label="Send"
            onPress={send}
            loading={sending}
            disabled={!message.trim() || !session}
          />
          <Text
            accessibilityRole="link"
            onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`).catch(() => undefined)}
            style={[styles.email, { color: theme.colors.text.secondary }]}
          >
            Prefer email? Write to {SUPPORT_EMAIL}
          </Text>
        </View>
      </KeyboardAwareScreen>
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
  intro: {
    fontSize: type.bodyM.fontSize,
    lineHeight: type.bodyM.lineHeight,
  },
  shot: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  shotImage: {
    width: 72,
    height: 144,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  shotText: {
    flex: 1,
  },
  note: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
  },
  email: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
