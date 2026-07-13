import { coreMentalHealthArticles } from './mental-health/articles-core'
import { clusterAMentalHealthArticles } from './mental-health/articles-cluster-a'
import { clusterBMentalHealthArticles } from './mental-health/articles-cluster-b'
import { clusterCMentalHealthArticles } from './mental-health/articles-cluster-c'
import type { CitedText, MentalHealthArticle } from './mental-health/types'

export type {
  CitedText,
  MentalHealthArticle,
  MentalHealthFaq,
  MentalHealthReference,
  MentalHealthSection,
  MentalHealthSourceTier,
} from './mental-health/types'

export const mentalHealthArticles: MentalHealthArticle[] = [
  ...coreMentalHealthArticles,
  ...clusterAMentalHealthArticles,
  ...clusterBMentalHealthArticles,
  ...clusterCMentalHealthArticles,
]

const SEO_TITLE_MIN_LENGTH = 30
const SEO_TITLE_MAX_LENGTH = 65
const SEO_DESCRIPTION_MIN_LENGTH = 110
const SEO_DESCRIPTION_MAX_LENGTH = 190

function citedPassages(article: MentalHealthArticle): CitedText[] {
  return [
    ...article.keyPoints,
    ...article.sections.flatMap((section) => [
      ...section.paragraphs,
      ...(section.bullets ?? []),
    ]),
    ...article.faq.map((faq) => ({ text: faq.answer, refs: faq.refs })),
  ]
}

export function assertMentalHealthArticleIntegrity(article: MentalHealthArticle): void {
  const referenceIds = article.references.map((reference) => reference.id)
  const uniqueReferenceIds = new Set(referenceIds)
  const citedIds = new Set(citedPassages(article).flatMap((passage) => passage.refs))
  const missingReferences = [...citedIds].filter((id) => !uniqueReferenceIds.has(id))
  const duplicateReferences = referenceIds.filter((id, index) => referenceIds.indexOf(id) !== index)
  const malformedUrls = article.references
    .filter((reference) => !/^https:\/\//i.test(reference.url))
    .map((reference) => reference.id)
  const seoTitleLength = article.seoTitle.trim().length
  const descriptionLength = article.description.trim().length

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug)) {
    throw new Error(`${article.slug}: slug must be lowercase, descriptive, and hyphen-separated`)
  }
  if (seoTitleLength < SEO_TITLE_MIN_LENGTH || seoTitleLength > SEO_TITLE_MAX_LENGTH) {
    throw new Error(`${article.slug}: SEO title must be ${SEO_TITLE_MIN_LENGTH}-${SEO_TITLE_MAX_LENGTH} characters, found ${seoTitleLength}`)
  }
  if (descriptionLength < SEO_DESCRIPTION_MIN_LENGTH || descriptionLength > SEO_DESCRIPTION_MAX_LENGTH) {
    throw new Error(`${article.slug}: meta description must be ${SEO_DESCRIPTION_MIN_LENGTH}-${SEO_DESCRIPTION_MAX_LENGTH} characters, found ${descriptionLength}`)
  }
  if (missingReferences.length > 0) {
    throw new Error(`${article.slug}: missing reference definitions for ${missingReferences.join(', ')}`)
  }
  if (duplicateReferences.length > 0) {
    throw new Error(`${article.slug}: duplicate references ${[...new Set(duplicateReferences)].join(', ')}`)
  }
  if (malformedUrls.length > 0) {
    throw new Error(`${article.slug}: malformed reference URLs for ${malformedUrls.join(', ')}`)
  }
  if (article.references.length < 4) {
    throw new Error(`${article.slug}: expected at least 4 references, found ${article.references.length}`)
  }
  if (article.sections.length < 5 || article.keyPoints.length < 3 || article.faq.length < 3) {
    throw new Error(`${article.slug}: article does not meet the minimum depth standard`)
  }
}

function duplicates(values: string[]): string[] {
  return values.filter((value, index) => values.indexOf(value) !== index)
}

const duplicateSlugs = duplicates(mentalHealthArticles.map((article) => article.slug))
const duplicateSeoTitles = duplicates(mentalHealthArticles.map((article) => article.seoTitle.trim().toLowerCase()))
const duplicateDescriptions = duplicates(mentalHealthArticles.map((article) => article.description.trim().toLowerCase()))

if (duplicateSlugs.length > 0) {
  throw new Error(`Duplicate mental health article slugs: ${[...new Set(duplicateSlugs)].join(', ')}`)
}
if (duplicateSeoTitles.length > 0) {
  throw new Error(`Duplicate mental health SEO titles: ${[...new Set(duplicateSeoTitles)].join(', ')}`)
}
if (duplicateDescriptions.length > 0) {
  throw new Error(`Duplicate mental health meta descriptions: ${[...new Set(duplicateDescriptions)].join(', ')}`)
}

mentalHealthArticles.forEach(assertMentalHealthArticleIntegrity)

export const mentalHealthArticleSlugs = mentalHealthArticles.map((article) => article.slug)

export function getMentalHealthArticle(slug: string): MentalHealthArticle | undefined {
  return mentalHealthArticles.find((article) => article.slug === slug)
}

export function getMentalHealthArticlesByCluster(cluster: MentalHealthArticle['cluster']): MentalHealthArticle[] {
  return mentalHealthArticles.filter((article) => article.cluster === cluster)
}
