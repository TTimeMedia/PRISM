import React from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  Download,
  HelpCircle,
  Palette,
  ShieldCheck,
  Sliders,
  UserRound,
  Accessibility as AccessibilityIcon,
} from 'lucide-react-native';
import {
  PRIZMButton,
  PRIZMHeader,
  PRIZMIconButton,
  PRIZMListItem,
  PRIZMSection,
  spacing,
  useTheme,
} from '@prizm/ui';
import { useProfile } from '../../../lib/profile/queries';
import { signOut } from '../../../lib/auth/actions';

/**
 * Screen 53 — Settings (opened from the menu; the YOU tab itself shows the
 * Timeline). Primary settings hub — Me / PRIZM / Privacy /
 * Preferences / Data / About, per docs/SCREEN_BIBLE.md §9. Sign out was
 * added here in Milestone 02, before the rest of this screen existed; it
 * stays at the bottom now that the full hub is built.
 */
export function YouScreen() {
  const theme = useTheme();
  const { data: profile } = useProfile();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PRIZMHeader
        title="Settings."
        subtitle={profile?.display_name || 'Your information belongs to you.'}
        leading={
          <PRIZMIconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.text.primary} />
          </PRIZMIconButton>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        <PRIZMSection title="Me">
          <PRIZMListItem
            title="Profile"
            leading={<UserRound size={20} color={theme.accent} />}
            onPress={() => router.push('/you/profile')}
          />
        </PRIZMSection>

        <PRIZMSection title="Prizm">
          <PRIZMListItem
            title="Customize Prizm"
            subtitle="Choose what shows up for you."
            leading={<Sliders size={20} color={theme.spectrum.violet} />}
            onPress={() => router.push('/you/customize')}
          />
        </PRIZMSection>

        <PRIZMSection title="Privacy">
          <PRIZMListItem
            title="Privacy & security"
            leading={<ShieldCheck size={20} color={theme.spectrum.mint} />}
            onPress={() => router.push('/you/privacy')}
          />
        </PRIZMSection>

        <PRIZMSection title="Preferences">
          <PRIZMListItem
            title="Notifications"
            leading={<Bell size={20} color={theme.spectrum.yellow} />}
            onPress={() => router.push('/you/notifications')}
          />
          <PRIZMListItem
            title="Appearance"
            leading={<Palette size={20} color={theme.spectrum.pink} />}
            onPress={() => router.push('/you/appearance')}
          />
          <PRIZMListItem
            title="Accessibility"
            leading={<AccessibilityIcon size={20} color={theme.accent} />}
            onPress={() => router.push('/you/accessibility')}
          />
          <PRIZMListItem
            title="Calendar"
            subtitle="Sync appointments to your device calendar."
            leading={<CalendarDays size={20} color={theme.spectrum.mint} />}
            onPress={() => router.push('/you/calendar')}
          />
        </PRIZMSection>

        <PRIZMSection title="Data">
          <PRIZMListItem
            title="Data & export"
            leading={<Download size={20} color={theme.spectrum.violet} />}
            onPress={() => router.push('/you/data')}
          />
        </PRIZMSection>

        <PRIZMSection title="About">
          <PRIZMListItem
            title="How Prizm works"
            leading={<HelpCircle size={20} color={theme.spectrum.cyan} />}
            onPress={() => router.push('/you/how-it-works')}
          />
          <PRIZMListItem
            title="About Prizm"
            leading={<HelpCircle size={20} color={theme.colors.text.secondary} />}
            onPress={() => router.push('/you/about')}
          />
          <PRIZMListItem
            title="Support"
            leading={<HelpCircle size={20} color={theme.colors.text.secondary} />}
            onPress={() => router.push('/you/support')}
          />
        </PRIZMSection>

        <PRIZMButton label="Sign out" variant="secondary" onPress={() => signOut()} />
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
