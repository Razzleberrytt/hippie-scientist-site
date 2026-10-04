import { allArticleMonographs, allBlogPosts } from '../.content-collections/generated'
import { loadPublishedCompounds } from '@/app/compounds/library-data'
import { loadPublishedHerbs } from '@/app/herbs/library-data'
import {
  getPublicEvidenceDataset,
  type PublicEvidenceDataset,
} from '@/lib/public-evidence-dataset'

export type PublicSiteMetrics = {
  publishedArticles: number
  publishedHerbs: number
  publishedCompounds: number
  publishedProfiles: number
  structuredStudies: number
  humanEvidenceSources: number
  humanTrials: number
}

export type PublishedContentCounts = {
  publishedArticles: number
  publishedHerbs: number
  publishedCompounds: number
}

/**
 * Canonical public-facing coverage metrics.
 *
 * Study/source metrics come from the shared public evidence dataset. Published
 * profile counts are supplied by the same final library selectors that drive
 * the public /herbs and /compounds inventories. Article counts come from the
 * same generated content collections that power /articles, so homepage totals
 * update automatically whenever the public editorial library changes.
 */
export function buildPublicSiteMetrics(
  dataset: PublicEvidenceDataset,
  contentCounts: PublishedContentCounts,
): PublicSiteMetrics {
  const { publishedArticles, publishedHerbs, publishedCompounds } = contentCounts

  return {
    publishedArticles,
    publishedHerbs,
    publishedCompounds,
    publishedProfiles: publishedHerbs + publishedCompounds,
    structuredStudies: dataset.metrics.studyCount,
    humanEvidenceSources: dataset.metrics.humanStudyCount,
    humanTrials: dataset.metrics.humanTrialCount,
  }
}

export async function getPublicSiteMetrics(): Promise<PublicSiteMetrics> {
  const [dataset, herbs, compounds] = await Promise.all([
    getPublicEvidenceDataset(),
    loadPublishedHerbs(),
    loadPublishedCompounds(),
  ])

  return buildPublicSiteMetrics(dataset, {
    publishedArticles: allArticleMonographs.length + allBlogPosts.length,
    publishedHerbs: herbs.length,
    publishedCompounds: compounds.length,
  })
}
