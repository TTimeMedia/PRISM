import React from 'react';
import { router } from 'expo-router';
import { Linking, Platform, ScrollView, StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';
import { ArrowLeft, CircleAlert, HelpCircle, Mail, ShieldAlert } from 'lucide-react-native';
import {
  PRISMHeader,
  PRISMIconButton,
  PRISMListItem,
  PRISMSection,
  spacing,
  useTheme,
  useToast,
} from '@prism/ui';
import { SUPPORT_EMAIL, supportMailto, type SupportTopic } from '../../../lib/you/support';

/**
 * Screen 66 — Support. Contact, problem reports and privacy concerns open
 * a draft email to the published support address. There is no help center
 * yet, so that row still says so plainly rather than opening a made-up link.
 */
export function SupportScreen() {
  const theme = useTheme();
  const { showToast } = useToast();

  const notConnected = () => showToast("This isn't connected yet — check back soon.");

  const email = async (topic: SupportTopic) => {
    const url = supportMailto(topic, {
      appVersion: Constants.expoConfig?.version ?? 'unknown',
      platform: Platform.OS,
      osVersion: Platform.Version,
    });
    try {
      await Linking.openURL(url);
    } catch {
      showToast(`No mail app found. Write to ${SUPPORT_EMAIL}.`);
    }
  };

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
            leading={<HelpCircle size={20} color={theme.accent} />}
            onPress={notConnected}
          />
          <PRISMListItem
            title="Contact support"
            subtitle={SUPPORT_EMAIL}
            leading={<Mail size={20} color={theme.spectrum.violet} />}
            onPress={() => email('contact')}
          />
          <PRISMListItem
            title="Report a problem"
            leading={<CircleAlert size={20} color={theme.spectrum.yellow} />}
            onPress={() => email('problem')}
          />
          <PRISMListItem
            title="Privacy concern"
            leading={<ShieldAlert size={20} color={theme.spectrum.pink} />}
            onPress={() => email('privacy')}
          />
        </PRISMSection>
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
});
