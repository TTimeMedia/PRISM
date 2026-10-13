import React from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import {
  PRIZMButton,
  PRIZMHeader,
  PRIZMIconButton,
  PRIZMSection,
  spacing,
  type,
  useTheme,
  useToast,
} from '@prizm/ui';
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
      <PRIZMHeader
        title="Data & export."
        leading={
          <PRIZMIconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.text.primary} />
          </PRIZMIconButton>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        <PRIZMSection title="Export">
          <Text style={[styles.description, { color: theme.colors.text.secondary }]}>
            Downloads everything you&rsquo;ve stored in Prizm — profile, medications, injections,
            appointments, milestones, and journal entries — as a single JSON file.
          </Text>
          <PRIZMButton label="Export my data" loading={isExporting} onPress={handleExport} />
        </PRIZMSection>

        <PRIZMSection title="Delete account">
          <Text style={[styles.description, { color: theme.colors.text.secondary }]}>
            Permanently deletes your Prizm account and everything in it. This cannot be undone.
          </Text>
          <PRIZMButton
            label="Delete my account"
            variant="destructive"
            onPress={() => router.push('/you/data/delete-account')}
          />
        </PRIZMSection>
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
