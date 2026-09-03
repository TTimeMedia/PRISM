import React from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
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

/**
 * Screen 66 — Support. No support channel is wired up yet (no help
 * center, ticketing, or contact address has been established) — tapping
 * a row says so plainly rather than opening a fabricated link, per
 * docs/DECISIONS.md § YOU.
 */
export function SupportScreen() {
  const theme = useTheme();
  const { showToast } = useToast();

  const notConnected = () => showToast("This isn't connected yet — check back soon.");

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
            leading={<HelpCircle size={20} color={theme.spectrum.cyan} />}
            onPress={notConnected}
          />
          <PRISMListItem
            title="Contact support"
            leading={<Mail size={20} color={theme.spectrum.violet} />}
            onPress={notConnected}
          />
          <PRISMListItem
            title="Report a problem"
            leading={<CircleAlert size={20} color={theme.spectrum.yellow} />}
            onPress={notConnected}
          />
          <PRISMListItem
            title="Privacy concern"
            leading={<ShieldAlert size={20} color={theme.spectrum.pink} />}
            onPress={notConnected}
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
