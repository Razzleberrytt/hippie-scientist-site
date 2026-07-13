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

const duplicateSlugs = mentalHealthArticles
  .map((article) => article.slug)
  .filter((slug, index, slugs) => slugs.indexOf(slug) !== index)

if (duplicateSlugs.length > 0) {
  throw new Error(`Duplicate mental health article slugs: ${[...new Set(duplicateSlugs)].join(', ')}`)
}

mentalHealthArticles.forEach(assertMentalHealthArticleIntegrity)

export const mentalHealthArticleSlugs = mentalHealthArticles.map((article) => article.slug)

export function getMentalHealthArticle(slug: string): MentalHealthArticle | undefined {
  return mentalHealthArticles.find((article) => article.slug === slug)
}

export function getMentalHealthArticlesByCluster(cluster: MentalHealthArticle['cluster']): MentalHealthArticle[] {
  return mentalHealthArticles.filter((article) => article.cluster === cluster)
}
