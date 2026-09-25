import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Bell, LayoutGrid, Menu } from 'lucide-react-native';
import { fontFamily, fontWeight, spacing, type, useTheme } from '@prism/ui';
import { useReminderAttention } from '../../lib/reminders/useReminderAttention';
import { SideMenu } from './SideMenu';

/**
 * The bar across the top of Today, Care and Journey: the menu on the left, a
 * bell for reminders (with a dot when reminders are on but this phone isn't
 * allowing them), the screen's name in the middle, and a shortcut to choose
 * what Prism shows on the right.
 */
export function TopBar({ title }: { title: string }) {
  const theme = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const needsAttention = useReminderAttention();

  return (
    <>
      <View style={styles.bar}>
        <View style={styles.side}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open menu"
            onPress={() => setMenuOpen(true)}
            style={styles.button}
            hitSlop={6}
          >
            <Menu size={26} color={theme.colors.text.primary} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={needsAttention ? 'Reminders, needs attention' : 'Reminders'}
            onPress={() => router.push('/you/notifications')}
            style={styles.button}
            hitSlop={6}
          >
            <Bell size={24} color={theme.colors.text.primary} />
            {needsAttention ? (
              <View
                testID="reminder-dot"
                style={[
                  styles.dot,
                  { backgroundColor: theme.destructive, borderColor: theme.colors.background },
                ]}
              />
            ) : null}
          </Pressable>
        </View>
        <Text
          accessibilityRole="header"
          style={[styles.title, { color: theme.colors.text.primary }]}
          numberOfLines={1}
        >
          {title}
        </Text>
        <View style={[styles.side, styles.sideEnd]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Choose what shows"
            onPress={() => router.push('/you/customize')}
            style={styles.button}
            hitSlop={6}
          >
            <LayoutGrid size={24} color={theme.colors.text.primary} />
          </Pressable>
        </View>
      </View>
      <SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: 52,
  },
  side: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sideEnd: {
    justifyContent: 'flex-end',
  },
  button: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: type.bodyL.fontSize,
    lineHeight: type.bodyL.lineHeight,
    fontWeight: fontWeight.semibold as '600',
  },
});
