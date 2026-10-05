import {
  HELP_ARTICLES,
  HELP_CATEGORIES,
  findHelpArticle,
  searchHelpArticles,
} from '../helpArticles';

describe('help articles', () => {
  it('have unique slugs, a known category and something to read', () => {
    const slugs = HELP_ARTICLES.map((article) => article.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const article of HELP_ARTICLES) {
      expect(HELP_CATEGORIES).toContain(article.category);
      expect(article.blocks.length).toBeGreaterThan(0);
    }
  });

  it('finds an article by slug', () => {
    expect(findHelpArticle('app-lock')?.title).toBe('App Lock and Face ID');
    expect(findHelpArticle('nope')).toBeUndefined();
  });

  it('searches titles and text, matching every word typed', () => {
    expect(searchHelpArticles('').length).toBe(HELP_ARTICLES.length);
    expect(searchHelpArticles('forgot pin').map((article) => article.slug)).toContain('app-lock');
    expect(searchHelpArticles('SNOOZE').map((article) => article.slug)).toContain(
      'done-snooze-follow-up',
    );
    expect(searchHelpArticles('zebra')).toEqual([]);
  });
});
