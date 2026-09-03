import React from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { ArrowLeft } from 'lucide-react-native';
import {
  PRISMHeader,
  PRISMIconButton,
  PRISMListItem,
  PRISMSection,
  fontFamily,
  fontWeight,
  spacing,
  type,
  useTheme,
} from '@prism/ui';

/**
 * Screen 65 — About. Privacy Policy / Terms / open-source
 * acknowledgements have no published destination yet — shown as
 * informational rows rather than a fabricated link, per
 * docs/DECISIONS.md § YOU.
 */
export function AboutScreen() {
  const theme = useTheme();
  const version = Constants.expoConfig?.version ?? '0.1.0';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PRISMHeader
        title="About PRISM."
        leading={
          <PRISMIconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.text.primary} />
          </PRISMIconButton>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.brand}>
          <Text style={[styles.wordmark, { color: theme.colors.text.primary }]}>PRISM</Text>
          <Text style={[styles.version, { color: theme.colors.text.tertiary }]}>
            Version {version}
          </Text>
        </View>
        <Text style={[styles.description, { color: theme.colors.text.secondary }]}>
          PRISM is an organizational companion for gender-affirming care — medications,
          appointments, and the personal journey around them. It stores and organizes what you tell
          it; it never interprets, recommends, or diagnoses.
        </Text>
        <PRISMSection title="Legal">
          <PRISMListItem title="Privacy Policy" subtitle="Not yet published" showChevron={false} />
          <PRISMListItem
            title="Terms of Service"
            subtitle="Not yet published"
            showChevron={false}
          />
          <PRISMListItem
            title="Open-source acknowledgements"
            subtitle="Not yet compiled"
            showChevron={false}
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
  brand: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  wordmark: {
    fontFamily: fontFamily.display,
    fontSize: type.headingXL.fontSize,
    lineHeight: type.headingXL.lineHeight,
    fontWeight: fontWeight.bold as '700',
  },
  version: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
    marginTop: 2,
  },
  description: {
    fontSize: type.bodyM.fontSize,
    lineHeight: type.bodyM.lineHeight,
    marginBottom: spacing.lg,
  },
});
