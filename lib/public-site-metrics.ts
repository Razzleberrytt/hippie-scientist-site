import { isRedirectedCompoundDuplicate } from '@/lib/deprecated-compound-canonicals'
import { isRedirectedDuplicate } from '@/lib/deprecated-herb-canonicals'
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

/**
 * Canonical public-facing coverage metrics.
 *
 * The evidence dataset is the shared source for study/source metrics. Profile
 * counts additionally suppress known redirect-only herb/compound aliases so a
 * public count cannot claim more published profiles than the browse libraries
 * actually expose as canonical pages.
 */
export function buildPublicSiteMetrics(dataset: PublicEvidenceDataset): PublicSiteMetrics {
  const herbs = dataset.ingredients.filter((ingredient) => ingredient.type === 'herb')
  const compounds = dataset.ingredients.filter((ingredient) => ingredient.type === 'compound')
  const herbSlugs = new Set(herbs.map((ingredient) => ingredient.slug))
  const compoundSlugs = new Set(compounds.map((ingredient) => ingredient.slug))

  const publishedHerbs = herbs.filter(
    (ingredient) => !isRedirectedDuplicate(ingredient.slug, herbSlugs),
  ).length
  const publishedCompounds = compounds.filter(
    (ingredient) => !isRedirectedCompoundDuplicate(ingredient.slug, compoundSlugs),
  ).length

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
  return buildPublicSiteMetrics(await getPublicEvidenceDataset())
}
