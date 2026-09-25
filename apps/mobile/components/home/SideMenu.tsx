import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, type Href } from 'expo-router';
import Animated, { SlideInLeft } from 'react-native-reanimated';
import {
  Bell,
  CalendarSync,
  CircleHelp,
  Compass,
  Download,
  Eye,
  Info,
  LayoutGrid,
  Lock,
  Palette,
  Settings,
  X,
  type LucideIcon,
} from 'lucide-react-native';
import {
  fontFamily,
  fontWeight,
  radius,
  spacing,
  type,
  useReducedMotion,
  useTheme,
} from '@prism/ui';
import { useModules, useProfile } from '../../lib/profile/queries';
import { MODULE_STYLE } from './moduleStyle';
import { useTint } from './tint';

interface MenuItem {
  label: string;
  icon: LucideIcon;
  href: Href;
}

/** Where each feature's own list lives, shown only for the features that are on. */
const FEATURE_ITEMS: { module: keyof typeof MODULE_STYLE; href: Href }[] = [
  { module: 'medications', href: '/care/medications' },
  { module: 'appointments', href: '/care/appointments' },
  { module: 'milestones', href: '/journey/milestones' },
  { module: 'journal', href: '/journey/journal' },
];

const SET_UP_ITEMS: MenuItem[] = [
  { label: 'Reminders', icon: Bell, href: '/you/notifications' },
  { label: 'Choose what shows', icon: LayoutGrid, href: '/you/customize' },
  { label: 'Calendar', icon: CalendarSync, href: '/you/calendar' },
  { label: 'Appearance', icon: Palette, href: '/you/appearance' },
  { label: 'Privacy', icon: Lock, href: '/you/privacy' },
  { label: 'Data and export', icon: Download, href: '/you/data' },
];

const HELP_ITEMS: MenuItem[] = [
  { label: 'How Prism works', icon: CircleHelp, href: '/you/how-it-works' },
  { label: 'Support', icon: Eye, href: '/you/support' },
  { label: 'About Prism', icon: Info, href: '/you/about' },
];

function initialsOf(name: string | null | undefined): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'P';
  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

/**
 * A slide-out menu for everything that isn't a main tab: shortcuts to each
 * feature that's on, then setup, then help, with your profile at the bottom.
 * Keeps the four tabs simple without hiding anything.
 */
export function SideMenu({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const { data: modules } = useModules();
  const { data: profile } = useProfile();
  const enabled = new Set(modules?.filter((m) => m.enabled).map((m) => m.module_key));
  const features: MenuItem[] = [
    { label: 'Timeline', icon: Compass, href: '/you' },
    ...FEATURE_ITEMS.filter((item) => enabled.has(item.module)).map((item) => ({
      label: MODULE_STYLE[item.module].label,
      icon: MODULE_STYLE[item.module].icon,
      href: item.href,
    })),
  ];
  const name = profile?.display_name?.trim();
  const tint = useTint('violet');

  const go = (href: Href) => {
    onClose();
    router.push(href);
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        <Animated.View
          entering={reducedMotion ? undefined : SlideInLeft.duration(240)}
          style={[
            styles.panel,
            { backgroundColor: theme.colors.background, borderColor: theme.colors.border.subtle },
          ]}
        >
          <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
            <View style={styles.header}>
              <Text style={[styles.brand, { color: theme.colors.text.primary }]}>Prism</Text>
              <View style={styles.headerActions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Settings"
                  onPress={() => go('/you/settings')}
                  hitSlop={10}
                >
                  <Settings size={22} color={theme.colors.text.primary} />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close menu"
                  onPress={onClose}
                  hitSlop={10}
                >
                  <X size={24} color={theme.colors.text.primary} />
                </Pressable>
              </View>
            </View>

            <ScrollView contentContainerStyle={styles.list}>
              <Group title="Your Prism" items={features} onPick={go} />
              <Group title="Set up" items={SET_UP_ITEMS} onPick={go} />
              <Group title="Help" items={HELP_ITEMS} onPick={go} />
            </ScrollView>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={name ? `Your profile, ${name}` : 'Your profile'}
              onPress={() => go('/you/profile')}
              style={[styles.profile, { borderTopColor: theme.colors.border.subtle }]}
            >
              <View style={[styles.avatar, { backgroundColor: tint.tile }]}>
                <Text style={[styles.avatarText, { color: theme.colors.text.primary }]}>
                  {initialsOf(name)}
                </Text>
              </View>
              <Text style={[styles.profileName, { color: theme.colors.text.primary }]}>
                {name || 'Your profile'}
              </Text>
            </Pressable>
          </SafeAreaView>
        </Animated.View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close menu"
          onPress={onClose}
          style={styles.scrim}
        />
      </View>
    </Modal>
  );
}

function Group({
  title,
  items,
  onPick,
}: {
  title: string;
  items: MenuItem[];
  onPick: (href: Href) => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.group}>
      <Text style={[styles.groupTitle, { color: theme.colors.text.tertiary }]}>{title}</Text>
      {items.map(({ label, icon: Icon, href }) => (
        <Pressable
          key={label}
          accessibilityRole="button"
          accessibilityLabel={label}
          onPress={() => onPick(href)}
          style={({ pressed }) => [
            styles.item,
            pressed && { backgroundColor: theme.colors.surfaceSelected },
          ]}
        >
          <Icon size={22} color={theme.colors.text.primary} strokeWidth={1.8} />
          <Text style={[styles.itemLabel, { color: theme.colors.text.primary }]}>{label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  root: {
    flex: 1,
    flexDirection: 'row',
  },
  panel: {
    width: '82%',
    maxWidth: 340,
    borderRightWidth: 1,
  },
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(10,10,20,0.45)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  brand: {
    fontFamily: fontFamily.display,
    fontSize: type.headingXL.fontSize,
    lineHeight: type.headingXL.lineHeight,
    fontWeight: fontWeight.bold as '700',
    letterSpacing: 0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  list: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.lg,
  },
  group: {
    marginBottom: spacing.md,
  },
  groupTitle: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
    fontWeight: fontWeight.semibold as '600',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  itemLabel: {
    fontSize: type.bodyL.fontSize,
    lineHeight: type.bodyL.lineHeight,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fontFamily.display,
    fontSize: type.bodyM.fontSize,
    fontWeight: fontWeight.bold as '700',
  },
  profileName: {
    fontSize: type.bodyL.fontSize,
    lineHeight: type.bodyL.lineHeight,
    fontWeight: fontWeight.semibold as '600',
  },
});
