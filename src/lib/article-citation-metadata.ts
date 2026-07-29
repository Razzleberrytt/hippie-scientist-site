import { articleCitationOverrides } from '@/src/data/article-citation-overrides'

export type ArticleRelationshipRecord = {
  slug: string
  category: string
  relatedSlugs?: string[]
}

export type ArticleCitationMetadata = {
  slug?: string
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

function getOverride(slug: string | undefined) {
  return slug ? articleCitationOverrides[slug] : undefined
}

export function resolveRelatedArticles<T extends ArticleRelationshipRecord>(
  current: T,
  articles: T[],
  limit = 6
): T[] {
  const bySlug = new Map(articles.map((article) => [article.slug, article]))
  const relatedSlugs =
    current.relatedSlugs !== undefined
      ? current.relatedSlugs
      : getOverride(current.slug)?.relatedSlugs ?? []
  const curated = relatedSlugs
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
  const override = getOverride(metadata.slug)

  return {
    keyTakeaways:
      metadata.keyTakeaways !== undefined
        ? metadata.keyTakeaways
        : override?.keyTakeaways ?? [],
    citationQuestions:
      metadata.citationQuestions !== undefined
        ? metadata.citationQuestions
        : override?.citationQuestions ?? [],
    canonicalConcepts:
      metadata.canonicalConcepts !== undefined
        ? metadata.canonicalConcepts
        : override?.canonicalConcepts ?? [],
  }
}
