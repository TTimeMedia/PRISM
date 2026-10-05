import React from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { HelpArticleScreen } from '../../../../features/you/screens/HelpArticleScreen';
import { findHelpArticle } from '../../../../lib/you/helpArticles';

export default function HelpArticleRoute() {
  const { article } = useLocalSearchParams<{ article: string }>();
  const found = findHelpArticle(article);
  if (!found) return <Redirect href="/you/help" />;
  return <HelpArticleScreen article={found} />;
}
