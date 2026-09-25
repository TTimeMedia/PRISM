import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { PRISMButton, fontWeight, radius, spacing, type, useTheme } from '@prism/ui';
import { useAppStore } from '../../lib/store/appStore';

/**
 * A one-time note on Today that Prism is made of parts you can switch on and
 * off. It says it once, then stays out of the way: dismissing it (or opening
 * the switches) means it never comes back. After that the same switches live
 * in the menu and in Settings.
 */
export function CustomizeTip() {
  const theme = useTheme();
  const dismissed = useAppStore((state) => state.customizeTipDismissed);
  const dismiss = useAppStore((state) => state.dismissCustomizeTip);
  if (dismissed) return null;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border.default },
        theme.scheme === 'light' && theme.shadow,
      ]}
    >
      <View style={styles.top}>
        <View style={[styles.icon, { backgroundColor: theme.colors.surfaceSelected }]}>
          <Sparkles size={20} color={theme.colors.text.primary} strokeWidth={2} />
        </View>
        <View style={styles.text}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>Make Prism yours</Text>
          <Text style={[styles.body, { color: theme.colors.text.secondary }]}>
            Prism is made of parts you switch on and off. Add or remove any of them any time.
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <View style={styles.primary}>
          <PRISMButton
            label="Choose what shows"
            variant="secondary"
            onPress={() => {
              dismiss();
              router.push('/you/customize');
            }}
          />
        </View>
        <PRISMButton label="Got it" variant="tertiary" onPress={dismiss} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.smd,
    marginTop: spacing.lg,
  },
  top: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: type.bodyL.fontSize,
    lineHeight: type.bodyL.lineHeight,
    fontWeight: fontWeight.semibold as '600',
  },
  body: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  primary: {
    flex: 1,
  },
});
