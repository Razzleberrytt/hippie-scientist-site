import {
  articleCitationOverrides,
  citationRelationshipTargets,
} from '@/src/data/article-citation-overrides'
import { evidenceSourceUrl, evidenceStudyId } from '@/lib/evidence-study'

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

export type ArticleReferenceInput = {
  title?: unknown
  authors?: unknown
  journal?: unknown
  year?: unknown
  pmid?: unknown
  doi?: unknown
  url?: unknown
}

export type NormalizedArticleReference = {
  n: number
  title: string
  text: string
  authors?: string
  journal?: string
  year?: string | number
  pmid?: string
  doi?: string
  url?: string
  sourceId: string
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

function cleanOptionalString(value: unknown): string | undefined {
  const text = typeof value === 'string' ? value.trim() : ''
  return text || undefined
}

export function normalizeDoi(value: unknown): string | undefined {
  const raw = cleanOptionalString(value)
  if (!raw) return undefined
  return raw
    .replace(/^doi:\s*/i, '')
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '')
    .trim() || undefined
}

/**
 * Normalize article references onto the same source identity/URL primitives used
 * by the evidence-study system. Ordinal `n` is the durable page anchor; PMID,
 * DOI, URL, and title feed a separate stable research-source identity.
 */
export function normalizeArticleReferences(
  references: readonly ArticleReferenceInput[],
): NormalizedArticleReference[] {
  return references.map((ref, index) => {
    const title = cleanOptionalString(ref.title) || `Source ${index + 1}`
    const authors = cleanOptionalString(ref.authors)
    const journal = cleanOptionalString(ref.journal)
    const pmid = cleanOptionalString(ref.pmid)
    const doi = normalizeDoi(ref.doi)
    const year = typeof ref.year === 'number' && Number.isFinite(ref.year)
      ? ref.year
      : cleanOptionalString(ref.year)
    const explicitUrl = cleanOptionalString(ref.url)
    const url = evidenceSourceUrl({ pmid, doi, url: explicitUrl })
    const sourceId = evidenceStudyId({ pmid, doi, url, title })

    return {
      n: index + 1,
      title,
      text: [authors, journal, year ? String(year) : ''].filter(Boolean).join(' · '),
      authors,
      journal,
      year,
      pmid,
      doi,
      url,
      sourceId,
    }
  })
}

/**
 * Build conservative citation JSON-LD from known identifiers. Free-form author
 * strings remain visible in the source ledger but are not promoted into fake
 * structured Person/Organization nodes.
 */
export function buildArticleReferenceSchema(ref: NormalizedArticleReference) {
  const identifiers = [
    ref.pmid ? { '@type': 'PropertyValue', propertyID: 'PMID', value: ref.pmid } : null,
    ref.doi ? { '@type': 'PropertyValue', propertyID: 'DOI', value: ref.doi } : null,
  ].filter((value): value is { '@type': string; propertyID: string; value: string } => Boolean(value))

  return {
    '@type': 'ScholarlyArticle',
    ...(ref.url ? { '@id': ref.url } : {}),
    name: ref.title,
    // Schema policy requires a headline on every Article-shaped node, including
    // the cited works nested under an article's citation list. A cited study's
    // headline is its title, so this states it rather than leaving consumers to
    // infer it from name alone.
    headline: ref.title,
    ...(ref.year ? { datePublished: String(ref.year) } : {}),
    ...(identifiers.length ? { identifier: identifiers } : {}),
    ...(ref.url ? { url: ref.url } : {}),
  }
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
