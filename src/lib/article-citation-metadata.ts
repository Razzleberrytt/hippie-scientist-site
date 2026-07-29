export type ArticleRelationshipRecord = {
  slug: string
  category: string
  relatedSlugs?: string[]
}

export type ArticleCitationMetadata = {
  keyTakeaways?: string[]
  citationQuestions?: string[]
  canonicalConcepts?: string[]
}

function isRelatedArticle<T extends ArticleRelationshipRecord>(
  article: T | undefined,
  currentSlug: string
): article is T {
  return article !== undefined && article.slug !== currentSlug
}

export function resolveRelatedArticles<T extends ArticleRelationshipRecord>(
  current: T,
  articles: T[],
  limit = 6
): T[] {
  const bySlug = new Map(articles.map((article) => [article.slug, article]))
  const curated = (current.relatedSlugs ?? [])
    .map((slug) => bySlug.get(slug))
    .filter((article): article is T => isRelatedArticle(article, current.slug))

  const seen = new Set(curated.map((article) => article.slug))
  const fallback = articles.filter(
    (article) =>
      article.slug !== current.slug &&
      article.category === current.category &&
      !seen.has(article.slug)
  )

  return [...curated, ...fallback].slice(0, limit)
}

export function normalizeCitationMetadata(metadata: ArticleCitationMetadata) {
  return {
    keyTakeaways: metadata.keyTakeaways ?? [],
    citationQuestions: metadata.citationQuestions ?? [],
    canonicalConcepts: metadata.canonicalConcepts ?? [],
  }
}
