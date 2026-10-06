import React from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import {
  PRISMButton,
  PRISMHeader,
  PRISMIconButton,
  fontFamily,
  fontWeight,
  radius,
  spacing,
  type,
  useTheme,
} from '@prism/ui';
import type { HelpArticle } from '../../../lib/you/helpArticles';

/** One help article, then a way to ask if it didn't answer the question. */
export function HelpArticleScreen({ article }: { article: HelpArticle }) {
  const theme = useTheme();
  const body = { color: theme.colors.text.primary };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PRISMHeader
        title=""
        leading={
          <PRISMIconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.text.primary} />
          </PRISMIconButton>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.category, { color: theme.colors.text.tertiary }]}>
          {article.category}
        </Text>
        <Text
          accessibilityRole="header"
          style={[styles.title, { fontFamily: theme.fonts.display }, body]}
        >
          {article.title}
        </Text>
        {article.blocks.map((block, index) => {
          if (block.type === 'steps') {
            return (
              <View key={index} style={styles.steps}>
                {block.items.map((item, step) => (
                  <View key={step} style={styles.step}>
                    <Text style={[styles.stepNumber, { color: theme.accent }]}>{step + 1}</Text>
                    <Text style={[styles.paragraph, styles.stepText, body]}>{item}</Text>
                  </View>
                ))}
              </View>
            );
          }
          if (block.type === 'tip') {
            return (
              <View
                key={index}
                style={[styles.tip, { backgroundColor: theme.colors.surfaceElevated }]}
              >
                <Text style={[styles.paragraph, body]}>{block.text}</Text>
              </View>
            );
          }
          return (
            <Text key={index} style={[styles.paragraph, body]}>
              {block.text}
            </Text>
          );
        })}
        <View style={[styles.more, { borderTopColor: theme.colors.border.subtle }]}>
          <Text style={[styles.moreText, { color: theme.colors.text.secondary }]}>
            Didn&apos;t answer your question?
          </Text>
          <PRISMButton
            label="Contact support"
            variant="secondary"
            onPress={() => router.push('/you/support/contact')}
          />
        </View>
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
    gap: spacing.md,
  },
  category: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
    fontWeight: fontWeight.semibold as '600',
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: type.headingL.fontSize,
    lineHeight: type.headingL.lineHeight,
    fontWeight: fontWeight.bold as '700',
    marginTop: -spacing.sm,
  },
  paragraph: {
    fontSize: type.bodyL.fontSize,
    lineHeight: type.bodyL.lineHeight,
  },
  steps: {
    gap: spacing.smd,
  },
  step: {
    flexDirection: 'row',
    gap: spacing.smd,
  },
  stepNumber: {
    width: 20,
    fontSize: type.bodyL.fontSize,
    lineHeight: type.bodyL.lineHeight,
    fontWeight: fontWeight.bold as '700',
  },
  stepText: {
    flex: 1,
  },
  tip: {
    padding: spacing.md,
    borderRadius: radius.md,
  },
  more: {
    marginTop: spacing.md,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    gap: spacing.sm,
  },
  moreText: {
    fontSize: type.bodyM.fontSize,
    lineHeight: type.bodyM.lineHeight,
  },
});
