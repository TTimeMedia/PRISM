import React from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
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
  useToast,
} from '@prism/ui';
import { LEGAL_LINKS } from '../../../lib/you/legal';

/**
 * Screen 65 — About. The Privacy Policy and Terms of Service are web pages
 * on ttimemedia.org, opened inside Prism, so they can be updated without an
 * app update and match what the App Store links to. Open-source
 * acknowledgements are built into the app from its dependencies.
 */
export function AboutScreen() {
  const theme = useTheme();
  const { showToast } = useToast();
  const version = Constants.expoConfig?.version ?? '0.1.0';

  const open = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      });
    } catch {
      showToast("Couldn't open that page. Check your connection.", 'error');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PRISMHeader
        title="About Prism."
        leading={
          <PRISMIconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.text.primary} />
          </PRISMIconButton>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.brand}>
          <Text style={[styles.wordmark, { color: theme.colors.text.primary }]}>Prism</Text>
          <Text style={[styles.version, { color: theme.colors.text.tertiary }]}>
            Version {version}
          </Text>
        </View>
        <Text style={[styles.description, { color: theme.colors.text.secondary }]}>
          Prism is an organizational companion for gender-affirming care — medications,
          appointments, and the personal journey around them. It stores and organizes what you tell
          it; it never interprets, recommends, or diagnoses.
        </Text>
        <PRISMSection title="Legal">
          <PRISMListItem title="Privacy Policy" onPress={() => open(LEGAL_LINKS.privacy)} />
          <PRISMListItem title="Terms of Service" onPress={() => open(LEGAL_LINKS.terms)} />
          <PRISMListItem
            title="Open-source acknowledgements"
            onPress={() => router.push('/you/acknowledgements')}
          />
        </PRISMSection>
        <Text style={[styles.copyright, { color: theme.colors.text.tertiary }]}>
          © {new Date().getFullYear()} T-Time Media LLC
        </Text>
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
  copyright: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
    textAlign: 'center',
  },
});
