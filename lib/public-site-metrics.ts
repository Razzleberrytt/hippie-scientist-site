import { loadPublishedCompounds } from '@/app/compounds/library-data'
import { loadPublishedHerbs } from '@/app/herbs/library-data'
import {
  getPublicEvidenceDataset,
  type PublicEvidenceDataset,
} from '@/lib/public-evidence-dataset'

export type PublicSiteMetrics = {
  publishedHerbs: number
  publishedCompounds: number
  publishedProfiles: number
  structuredStudies: number
  humanEvidenceSources: number
  humanTrials: number
}

export type PublishedProfileCounts = {
  publishedHerbs: number
  publishedCompounds: number
}

/**
 * Canonical public-facing coverage metrics.
 *
 * Study/source metrics come from the shared public evidence dataset. Published
 * profile counts are supplied by the same final library selectors that drive
 * the public /herbs and /compounds inventories, so homepage totals cannot
 * outrun what readers can actually browse.
 */
export function buildPublicSiteMetrics(
  dataset: PublicEvidenceDataset,
  profileCounts: PublishedProfileCounts,
): PublicSiteMetrics {
  const { publishedHerbs, publishedCompounds } = profileCounts

  return {
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
    publishedHerbs: herbs.length,
    publishedCompounds: compounds.length,
  })
}
