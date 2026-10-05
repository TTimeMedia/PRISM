import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, type Href } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
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

const SideMenuContext = createContext<{ open: () => void } | null>(null);

/** Opens the menu. Null outside `SideMenuProvider`. */
export function useSideMenu() {
  return useContext(SideMenuContext);
}

/**
 * Holds the one side menu for the tabs, drawn over them. The menu stays
 * built while closed, so opening it is only an animation, with no screen
 * to build and no native modal to present first.
 */
export function SideMenuProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const value = useMemo(() => ({ open: () => setVisible(true) }), []);
  return (
    <SideMenuContext.Provider value={value}>
      <View style={styles.flex}>
        {children}
        <SideMenu visible={visible} onClose={() => setVisible(false)} />
      </View>
    </SideMenuContext.Provider>
  );
}

const OPEN_MS = 260;
const CLOSE_MS = 200;
const SCRIM_OPACITY = 0.45;

/**
 * A slide-out menu for everything that isn't a main tab: shortcuts to each
 * feature that's on, then setup, then help, with your profile at the bottom.
 * Keeps the four tabs simple without hiding anything.
 *
 * Always mounted: `visible` only drives the slide, which runs on the UI
 * thread. It follows a finger dragging it closed, and taps pass through to
 * the screen the moment it starts closing.
 */
export function SideMenu({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const { width } = useWindowDimensions();
  const panelWidth = Math.min(width * 0.82, 340);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(visible ? 1 : 0, {
      duration: reducedMotion ? 0 : visible ? OPEN_MS : CLOSE_MS,
      easing: Easing.out(Easing.cubic),
    });
  }, [visible, reducedMotion, progress]);

  useEffect(() => {
    if (!visible) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => subscription.remove();
  }, [visible, onClose]);

  // Drag left to close: the panel follows the finger, then finishes whichever way it was flung.
  const drag = Gesture.Pan()
    .enabled(visible)
    .activeOffsetX([-12, 12])
    .failOffsetY([-16, 16])
    .onUpdate((event) => {
      progress.value = Math.min(1, Math.max(0, 1 + event.translationX / panelWidth));
    })
    .onEnd((event) => {
      if (event.velocityX < -400 || progress.value < 0.6) {
        scheduleOnRN(onClose);
      } else {
        progress.value = withTiming(1, { duration: 160, easing: Easing.out(Easing.cubic) });
      }
    });

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (progress.value - 1) * (panelWidth + 2) }],
  }));
  const scrimStyle = useAnimatedStyle(() => ({ opacity: progress.value * SCRIM_OPACITY }));

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
    <GestureDetector gesture={drag}>
      <View
        style={StyleSheet.absoluteFill}
        pointerEvents={visible ? 'auto' : 'none'}
        accessibilityViewIsModal={visible}
        accessibilityElementsHidden={!visible}
        importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'}
      >
        <Animated.View style={[StyleSheet.absoluteFill, styles.scrimColor, scrimStyle]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close menu"
            onPress={onClose}
            style={styles.flex}
          />
        </Animated.View>
        <Animated.View
          style={[
            styles.panel,
            {
              width: panelWidth,
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border.subtle,
            },
            panelStyle,
          ]}
        >
          <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
            <View style={styles.header}>
              <Text style={[styles.brand, { color: theme.colors.text.primary }]}>Prism</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close menu"
                onPress={onClose}
                hitSlop={10}
              >
                <X size={24} color={theme.colors.text.primary} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.list}>
              <Group title="Your Prism" items={features} onPick={go} />
              <Group title="Set up" items={SET_UP_ITEMS} onPick={go} />
              <Group title="Help" items={HELP_ITEMS} onPick={go} />
            </ScrollView>

            {/* Pinned under the list, so Settings is always on screen however long the menu is. */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Settings"
              onPress={() => go('/you/settings')}
              style={({ pressed }) => [
                styles.settingsRow,
                { borderTopColor: theme.colors.border.subtle },
                pressed && { backgroundColor: theme.colors.surfaceSelected },
              ]}
            >
              <Settings size={22} color={theme.colors.text.primary} strokeWidth={1.8} />
              <Text style={[styles.itemLabel, { color: theme.colors.text.primary }]}>Settings</Text>
            </Pressable>
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
      </View>
    </GestureDetector>
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
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    borderRightWidth: 1,
  },
  scrimColor: {
    backgroundColor: 'rgb(10,10,20)',
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
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    borderTopWidth: 1,
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
