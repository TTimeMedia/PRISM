import React from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import {
  PRISMButton,
  PRISMHeader,
  PRISMIconButton,
  PRISMSection,
  spacing,
  type,
  useTheme,
  useToast,
} from '@prism/ui';
import { useExportData } from '../../../lib/you/useExportData';

/**
 * Screen 63 — Data & Export. One combined "Export my data" action
 * covers both of the spec's "Export"/"Download" actions — on web it
 * triggers a browser download, on native it shares a file — see
 * docs/DECISIONS.md § YOU.
 */
export function DataExportScreen() {
  const theme = useTheme();
  const { exportData, isExporting } = useExportData();
  const { showToast } = useToast();

  const handleExport = async () => {
    try {
      await exportData();
    } catch {
      showToast("Couldn't export your data. Please try again.", 'error');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PRISMHeader
        title="Data & export."
        leading={
          <PRISMIconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.text.primary} />
          </PRISMIconButton>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        <PRISMSection title="Export">
          <Text style={[styles.description, { color: theme.colors.text.secondary }]}>
            Downloads everything you&rsquo;ve stored in PRISM — profile, medications, injections,
            appointments, milestones, and journal entries — as a single JSON file.
          </Text>
          <PRISMButton label="Export my data" loading={isExporting} onPress={handleExport} />
        </PRISMSection>

        <PRISMSection title="Delete account">
          <Text style={[styles.description, { color: theme.colors.text.secondary }]}>
            Permanently deletes your PRISM account and everything in it. This cannot be undone.
          </Text>
          <PRISMButton
            label="Delete my account"
            variant="destructive"
            onPress={() => router.push('/you/data/delete-account')}
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
    gap: spacing.lg,
  },
  description: {
    fontSize: type.bodyM.fontSize,
    lineHeight: type.bodyM.lineHeight,
    marginBottom: spacing.md,
  },
});
