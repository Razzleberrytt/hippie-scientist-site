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

export type CitationReadySummaryInput = {
  description: string
  keyTakeaways?: string[]
  sourceCount?: number
  evidenceGrade?: string | null
}

const CAVEAT_PATTERN = /\b(?:limit(?:ation|ed|s)?|uncertain(?:ty)?|mixed|inconsistent|small|short[- ]term|preliminary|exploratory|not established|not proven|does not establish|cannot establish|unknown|unclear|lack(?:s|ing)?|sparse|indirect|heterogeneous|specific extract|specific population)\b/i

function isRelatedArticle(
  article: ArticleRelationshipRecord | undefined,
  currentSlug: string
): article is ArticleRelationshipRecord {
  return article !== undefined && article.slug !== currentSlug
}

function getOverride(slug: string | undefined) {
  return slug ? articleCitationOverrides[slug] : undefined
}

function categoryFallbacks(
  current: ArticleRelationshipRecord,
  articles: ArticleRelationshipRecord[],
  excludedSlugs: Set<string>
): ArticleRelationshipRecord[] {
  const categoryArticles = articles.filter((article) => article.category === current.category)
  const currentIndex = categoryArticles.findIndex((article) => article.slug === current.slug)

  if (currentIndex < 0) {
    return categoryArticles.filter(
      (article) => article.slug !== current.slug && !excludedSlugs.has(article.slug)
    )
  }

  const rotated = [
    ...categoryArticles.slice(currentIndex + 1),
    ...categoryArticles.slice(0, currentIndex),
  ]

  return rotated.filter(
    (article) => article.slug !== current.slug && !excludedSlugs.has(article.slug)
  )
}

function cleanSentence(value: string): string {
  const cleaned = value.replace(/\s+/g, ' ').trim()
  if (!cleaned) return ''
  return /[.!?]$/.test(cleaned) ? cleaned : `${cleaned}.`
}

function splitSentences(value: string): string[] {
  const cleaned = value.replace(/\s+/g, ' ').trim()
  if (!cleaned) return []

  return cleaned
    .split(/(?<=[.!?])\s+(?=[A-Z0-9“"'])/)
    .map(cleanSentence)
    .filter(Boolean)
}

function uniqueSentences(values: string[]): string[] {
  const seen = new Set<string>()
  const unique: string[] = []

  for (const value of values) {
    const sentence = cleanSentence(value)
    if (!sentence) continue
    const key = sentence.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(sentence)
  }

  return unique
}

function preserveAuthoredCaveat(selected: string[], authoredSentences: string[]): string[] {
  const caveat = authoredSentences.find((sentence) => CAVEAT_PATTERN.test(sentence))
  if (!caveat || selected.includes(caveat)) return selected

  if (selected.length < 4) return [...selected, caveat]
  return [...selected.slice(0, 3), caveat]
}

/**
 * Build a 2–4 sentence extractive summary from authored article metadata.
 * Scientific claims come only from the authored description/takeaways; any
 * fallback sentence describes verifiable page metadata rather than efficacy.
 * When authored metadata contains a recognizable limitation/caveat sentence,
 * keep one in the extract so answer engines cannot lift a conclusion while
 * silently dropping its qualification.
 */
export function buildCitationReadySummary({
  description,
  keyTakeaways = [],
  sourceCount = 0,
  evidenceGrade,
}: CitationReadySummaryInput): string {
  const authoredSentences = uniqueSentences([
    ...splitSentences(description),
    ...keyTakeaways.map(cleanSentence),
  ])

  const selected = preserveAuthoredCaveat(authoredSentences.slice(0, 4), authoredSentences)

  if (selected.length < 2) {
    if (sourceCount > 0 && evidenceGrade) {
      selected.push(
        `The page labels the overall evidence as ${evidenceGrade} and links ${sourceCount} cited source${sourceCount === 1 ? '' : 's'} for verification.`
      )
    } else if (sourceCount > 0) {
      selected.push(
        `The page links ${sourceCount} cited source${sourceCount === 1 ? '' : 's'} for verification.`
      )
    } else if (evidenceGrade) {
      selected.push(`The page labels the overall evidence as ${evidenceGrade} and presents the detailed evidence below.`)
    } else {
      selected.push('The detailed evidence and limitations are presented below.')
    }
  }

  if (selected.length < 2) {
    selected.push('The full article provides the supporting context and source details.')
  }

  return selected.slice(0, 4).join(' ')
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
  const fallback = categoryFallbacks(current, articles, seen)

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
