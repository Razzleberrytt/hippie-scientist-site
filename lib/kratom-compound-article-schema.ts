import { SITE_URL } from '@/lib/seo'

// Article monographs own this cluster's published reviews. Do not create a
// second /compounds owner or promote hidden workbook records through schema.
export const kratomCompoundArticles = {
  mitragynine: 'Mitragynine',
  '7-hydroxymitragynine': '7-Hydroxymitragynine',
  'mitragynine-pseudoindoxyl': 'Mitragynine pseudoindoxyl',
  '3-dehydromitragynine': '3-Dehydromitragynine',
  speciociliatine: 'Speciociliatine',
  speciogynine: 'Speciogynine',
  mitraciliatine: 'Mitraciliatine',
} as const

type ClusterSlug = keyof typeof kratomCompoundArticles

function isClusterSlug(slug: string): slug is ClusterSlug {
  return Object.hasOwn(kratomCompoundArticles, slug)
}

function compoundNode(slug: ClusterSlug) {
  const url = `${SITE_URL}/articles/${slug}/`
  return {
    '@type': 'ChemicalSubstance',
    '@id': `${url}#compound`,
    name: kratomCompoundArticles[slug],
    url,
    subjectOf: { '@type': 'Article', '@id': url },
  }
}

export function buildKratomCompoundArticleSchema(slug: string, relatedSlugs: readonly string[] = []) {
  if (!isClusterSlug(slug)) return undefined
  return {
    about: compoundNode(slug),
    // Only authored relationships are emitted; chemical adjacency is not an
    // efficacy, safety, metabolic, or regulatory equivalence assertion.
    mentions: [...new Set(relatedSlugs)]
      .filter((related): related is ClusterSlug => related !== slug && isClusterSlug(related))
      .map(compoundNode),
  }
}
