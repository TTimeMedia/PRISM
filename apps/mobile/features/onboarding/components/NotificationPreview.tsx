import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Pill } from 'lucide-react-native';
import { fontFamily, fontWeight, radius, spacing, type, useTheme } from '@prism/ui';

/** A Prism reminder as it would look on the lock screen, saying `body`. */
export function NotificationPreview({ body }: { body: string }) {
  const theme = useTheme();
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.preview,
        { backgroundColor: theme.colors.field, borderColor: theme.colors.fieldBorder },
      ]}
    >
      <View style={[styles.appIcon, { backgroundColor: theme.accent }]}>
        <Pill size={22} color={theme.onAccent} strokeWidth={2.4} />
      </View>
      <View style={styles.previewText}>
        <View style={styles.previewHeader}>
          <Text style={[styles.previewApp, { color: theme.colors.text.primary }]}>Prism</Text>
          <Text style={[styles.previewTime, { color: theme.colors.text.tertiary }]}>now</Text>
        </View>
        <Text style={[styles.previewBody, { color: theme.colors.text.secondary }]}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
  },
  appIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewText: {
    flex: 1,
    gap: 2,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  previewApp: {
    fontFamily: fontFamily.primary,
    fontSize: type.bodyS.fontSize,
    fontWeight: fontWeight.semibold as '600',
  },
  previewTime: {
    fontSize: type.caption.fontSize,
  },
  previewBody: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
  },
});
