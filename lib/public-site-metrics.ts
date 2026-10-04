import { allArticleMonographs, allBlogPosts } from '../.content-collections/generated'
import { loadCanonicalCompounds, loadPublishedCompounds } from '@/app/compounds/library-data'
import { loadPublishedHerbs } from '@/app/herbs/library-data'
import {
  getPublicEvidenceDataset,
  type PublicEvidenceDataset,
} from '@/lib/public-evidence-dataset'

export type PublicSiteMetrics = {
  publishedArticles: number
  publishedHerbs: number
  publishedCompounds: number
  totalCompounds: number
  publishedProfiles: number
  structuredStudies: number
  humanEvidenceSources: number
  humanTrials: number
}

export type ContentCounts = {
  publishedArticles: number
  publishedHerbs: number
  publishedCompounds: number
  totalCompounds: number
}

/**
 * Canonical public-facing coverage metrics.
 *
 * Study/source metrics come from the shared public evidence dataset. Published
 * profile counts are supplied by the final library selectors that drive public
 * inventories. The total compound count comes from the broader canonical runtime
 * inventory, which includes tracked compounds regardless of indexability while
 * excluding known redirect/alias duplicates. Article counts come from the same
 * generated content collections that power /articles.
 */
export function buildPublicSiteMetrics(
  dataset: PublicEvidenceDataset,
  contentCounts: ContentCounts,
): PublicSiteMetrics {
  const { publishedArticles, publishedHerbs, publishedCompounds, totalCompounds } = contentCounts

  return {
    publishedArticles,
    publishedHerbs,
    publishedCompounds,
    totalCompounds,
    publishedProfiles: publishedHerbs + publishedCompounds,
    structuredStudies: dataset.metrics.studyCount,
    humanEvidenceSources: dataset.metrics.humanStudyCount,
    humanTrials: dataset.metrics.humanTrialCount,
  }
}

export async function getPublicSiteMetrics(): Promise<PublicSiteMetrics> {
  const [dataset, herbs, publishedCompounds, canonicalCompounds] = await Promise.all([
    getPublicEvidenceDataset(),
    loadPublishedHerbs(),
    loadPublishedCompounds(),
    loadCanonicalCompounds(),
  ])

  return buildPublicSiteMetrics(dataset, {
    publishedArticles: allArticleMonographs.length + allBlogPosts.length,
    publishedHerbs: herbs.length,
    publishedCompounds: publishedCompounds.length,
    totalCompounds: canonicalCompounds.length,
  })
}
