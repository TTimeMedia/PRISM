import React from 'react';
import { router, type Href } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, CircleAlert, HelpCircle, Mail, ShieldAlert } from 'lucide-react-native';
import {
  PRISMHeader,
  PRISMIconButton,
  PRISMListItem,
  PRISMSection,
  PRISMSwitch,
  spacing,
  type,
  useTheme,
} from '@prism/ui';
import { useAppStore } from '../../../lib/store/appStore';
import { SUPPORT_EMAIL } from '../../../lib/you/support';

/**
 * Screen 66 — Support. The Help center answers the common questions in the
 * app; Contact support, Report a problem and Privacy concern are forms sent
 * from the app (lib/you/support.ts), answered by email.
 */
export function SupportScreen() {
  const theme = useTheme();
  const shakeToReport = useAppStore((state) => state.shakeToReport);
  const setShakeToReport = useAppStore((state) => state.setShakeToReport);
  const go = (href: Href) => router.push(href);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PRISMHeader
        title="Support."
        leading={
          <PRISMIconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.text.primary} />
          </PRISMIconButton>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        <PRISMSection>
          <PRISMListItem
            title="Help center"
            subtitle="Answers to common questions"
            leading={<HelpCircle size={20} color={theme.accent} />}
            onPress={() => go('/you/help')}
          />
          <PRISMListItem
            title="Contact support"
            subtitle="Ask us anything"
            leading={<Mail size={20} color={theme.spectrum.violet} />}
            onPress={() => go('/you/support/contact')}
          />
          <PRISMListItem
            title="Report a problem"
            subtitle="Something isn't working"
            leading={<CircleAlert size={20} color={theme.spectrum.yellow} />}
            onPress={() => go('/you/support/problem')}
          />
          <PRISMListItem
            title="Privacy concern"
            subtitle="About your data"
            leading={<ShieldAlert size={20} color={theme.spectrum.pink} />}
            onPress={() => go('/you/support/privacy')}
          />
        </PRISMSection>
        <PRISMSection>
          <PRISMSwitch
            label="Shake to report a problem"
            description="Shake your phone anywhere in Prism to open a problem report, with an optional screenshot."
            value={shakeToReport}
            onValueChange={setShakeToReport}
          />
        </PRISMSection>
        <Text style={[styles.note, { color: theme.colors.text.tertiary }]}>
          We reply by email to the address on your account. You can also write to {SUPPORT_EMAIL}.
        </Text>
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
  },
  note: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
  },
});
