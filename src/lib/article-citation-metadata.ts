import {
  articleCitationOverrides,
  citationRelationshipTargets,
} from '@/src/data/article-citation-overrides'

export type ArticleRelationshipRecord = {
  slug: string
  title: string
  category: string
  url: string
  relatedSlugs?: string[]
}

export type ArticleCitationMetadata = {
  slug?: string
  keyTakeaways?: string[]
  citationQuestions?: string[]
  canonicalConcepts?: string[]
}

function isRelatedArticle(
  article: ArticleRelationshipRecord | undefined,
  currentSlug: string
): article is ArticleRelationshipRecord {
  return article !== undefined && article.slug !== currentSlug
}

function getOverride(slug: string | undefined) {
  return slug ? articleCitationOverrides[slug] : undefined
}

export function resolveRelatedArticles(
  current: ArticleRelationshipRecord,
  articles: ArticleRelationshipRecord[],
  limit = 6
): ArticleRelationshipRecord[] {
  const relationshipTargets = Object.values(citationRelationshipTargets)
  const bySlug = new Map(
    [...relationshipTargets, ...articles].map((article) => [article.slug, article])
  )
  const relatedSlugs =
    current.relatedSlugs !== undefined
      ? current.relatedSlugs
      : getOverride(current.slug)?.relatedSlugs ?? []
  const curated = relatedSlugs
    .map((slug) => bySlug.get(slug))
    .filter((article): article is ArticleRelationshipRecord =>
      isRelatedArticle(article, current.slug)
    )

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
