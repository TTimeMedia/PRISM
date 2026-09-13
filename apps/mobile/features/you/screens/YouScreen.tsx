import React from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Bell,
  Download,
  HelpCircle,
  Palette,
  ShieldCheck,
  Sliders,
  UserRound,
  Accessibility as AccessibilityIcon,
} from 'lucide-react-native';
import {
  PRISMButton,
  PRISMHeader,
  PRISMListItem,
  PRISMSection,
  spacing,
  useTheme,
} from '@prism/ui';
import { useProfile } from '../../../lib/profile/queries';
import { signOut } from '../../../lib/auth/actions';

/**
 * Screen 53 — You. Primary settings hub — Me / PRISM / Privacy /
 * Preferences / Data / About, per docs/SCREEN_BIBLE.md §9. Sign out was
 * added here in Milestone 02, before the rest of this screen existed; it
 * stays at the bottom now that the full hub is built.
 */
export function YouScreen() {
  const theme = useTheme();
  const { data: profile } = useProfile();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PRISMHeader
        title="You."
        subtitle={profile?.display_name || 'Your information belongs to you.'}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <PRISMSection title="Me">
          <PRISMListItem
            title="Profile"
            leading={<UserRound size={20} color={theme.spectrum.cyan} />}
            onPress={() => router.push('/you/profile')}
          />
        </PRISMSection>

        <PRISMSection title="PRISM">
          <PRISMListItem
            title="Customize PRISM"
            subtitle="Choose what shows up for you."
            leading={<Sliders size={20} color={theme.spectrum.violet} />}
            onPress={() => router.push('/you/customize')}
          />
        </PRISMSection>

        <PRISMSection title="Privacy">
          <PRISMListItem
            title="Privacy & security"
            leading={<ShieldCheck size={20} color={theme.spectrum.mint} />}
            onPress={() => router.push('/you/privacy')}
          />
        </PRISMSection>

        <PRISMSection title="Preferences">
          <PRISMListItem
            title="Notifications"
            leading={<Bell size={20} color={theme.spectrum.yellow} />}
            onPress={() => router.push('/you/notifications')}
          />
          <PRISMListItem
            title="Appearance"
            leading={<Palette size={20} color={theme.spectrum.pink} />}
            onPress={() => router.push('/you/appearance')}
          />
          <PRISMListItem
            title="Accessibility"
            leading={<AccessibilityIcon size={20} color={theme.spectrum.cyan} />}
            onPress={() => router.push('/you/accessibility')}
          />
        </PRISMSection>

        <PRISMSection title="Data">
          <PRISMListItem
            title="Data & export"
            leading={<Download size={20} color={theme.spectrum.violet} />}
            onPress={() => router.push('/you/data')}
          />
        </PRISMSection>

        <PRISMSection title="About">
          <PRISMListItem
            title="About PRISM"
            leading={<HelpCircle size={20} color={theme.colors.text.secondary} />}
            onPress={() => router.push('/you/about')}
          />
          <PRISMListItem
            title="Support"
            leading={<HelpCircle size={20} color={theme.colors.text.secondary} />}
            onPress={() => router.push('/you/support')}
          />
        </PRISMSection>

        <PRISMButton label="Sign out" variant="secondary" onPress={() => signOut()} />
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
