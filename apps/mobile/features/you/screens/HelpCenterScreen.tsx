import React, { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import {
  PRISMHeader,
  PRISMIconButton,
  PRISMInput,
  PRISMListItem,
  PRISMSection,
  spacing,
  type,
  useTheme,
} from '@prism/ui';
import { HELP_CATEGORIES, searchHelpArticles } from '../../../lib/you/helpArticles';

/** Help center: every article, grouped, with a search box. Works offline. */
export function HelpCenterScreen() {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchHelpArticles(query), [query]);
  const searching = query.trim().length > 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PRISMHeader
        title="Help center."
        leading={
          <PRISMIconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.text.primary} />
          </PRISMIconButton>
        }
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <PRISMInput
          label="Search help"
          placeholder="Reminders, App Lock, export…"
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          returnKeyType="search"
        />
        {HELP_CATEGORIES.map((category) => {
          const articles = results.filter((article) => article.category === category);
          if (articles.length === 0) return null;
          return (
            <PRISMSection key={category} title={category}>
              {articles.map((article) => (
                <PRISMListItem
                  key={article.slug}
                  title={article.title}
                  subtitle={article.summary}
                  onPress={() => router.push(`/you/help/${article.slug}`)}
                />
              ))}
            </PRISMSection>
          );
        })}
        {searching && results.length === 0 ? (
          <Text style={[styles.empty, { color: theme.colors.text.secondary }]}>
            Nothing matches that. Try other words, or ask us directly.
          </Text>
        ) : null}
        <PRISMSection title="Still need help?">
          <PRISMListItem
            title="Contact support"
            subtitle="We reply by email"
            onPress={() => router.push('/you/support/contact')}
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
  empty: {
    fontSize: type.bodyM.fontSize,
    lineHeight: type.bodyM.lineHeight,
    marginBottom: spacing.md,
  },
});
