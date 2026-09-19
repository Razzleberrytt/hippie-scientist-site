import type { Metadata } from 'next'

import { DEPRECATED_HERB_CANONICALS } from './deprecated-herb-canonicals'
import { getHerbCanonicalRouteSlug, getHerbSourceSlug } from './herb-canonical-source-aliases'
import { getHerbMetadataRecord } from './runtime-metadata-cache'
import { normalizeSlug } from './slug-utils'
import { generateDetailMetadata, shouldIndexRoute, SITE_URL } from './seo'
import { withRedirectSourceMetadata } from './redirect-source-metadata'

const HERB_META_DESCRIPTION_OVERRIDES: Record<string, string> = {
  'ashwagandha-withania-somnifera':
    'Ashwagandha alias page for Withania somnifera with canonical safety, dosage, and evidence context pointing to the primary Ashwagandha profile.',
  'milk-thistle':
    'Milk thistle herb profile covering seed-focused use, liver-support context, antioxidant mechanisms, dosage, and safety considerations.',
  'silybum-marianum':
    'Silybum marianum herb profile covering silymarin antioxidant mechanisms, hepatocyte support context, dosage, and safety considerations.',
}

function withMetadataDescriptionOverride(metadata: Metadata, description?: string): Metadata {
  if (!description) return metadata

  return {
    ...metadata,
    description,
    ...(metadata.openGraph ? { openGraph: { ...metadata.openGraph, description } } : {}),
    ...(metadata.twitter ? { twitter: { ...metadata.twitter, description } } : {}),
  }
}

export async function generateHerbRouteMetadata(slug: string): Promise<Metadata> {
  const normalizedSlug = normalizeSlug(slug)
  const canonicalSlug = DEPRECATED_HERB_CANONICALS[normalizedSlug] || normalizedSlug
  const sourceSlug = getHerbSourceSlug(canonicalSlug)
  const routeCanonicalSlug = getHerbCanonicalRouteSlug(canonicalSlug)
  const herb = await getHerbMetadataRecord(sourceSlug)

  if (!herb) {
    return {
      title: 'Herb Not Found',
      robots: { index: false, follow: true },
    }
  }

  const descriptionOverride =
    HERB_META_DESCRIPTION_OVERRIDES[normalizedSlug] || HERB_META_DESCRIPTION_OVERRIDES[canonicalSlug]
  const metadata = withMetadataDescriptionOverride(
    generateDetailMetadata({ ...herb, slug: routeCanonicalSlug }, 'herb'),
    descriptionOverride,
  )

  if (canonicalSlug !== normalizedSlug) {
    const indexDecision = shouldIndexRoute(`/herbs/${canonicalSlug}`, { ...herb, slug: canonicalSlug })
    return withRedirectSourceMetadata(
      {
        ...metadata,
        alternates: { canonical: `${SITE_URL}/herbs/${canonicalSlug}/` },
        robots: { index: indexDecision.index, follow: true },
      },
      `/herbs/${normalizedSlug}/`,
    )
  }

  if (routeCanonicalSlug !== canonicalSlug) {
    const indexDecision = shouldIndexRoute(`/herbs/${routeCanonicalSlug}`, { ...herb, slug: routeCanonicalSlug })
    return withRedirectSourceMetadata(
      {
        ...metadata,
        alternates: { canonical: `${SITE_URL}/herbs/${routeCanonicalSlug}/` },
        robots: { index: indexDecision.index, follow: true },
      },
      `/herbs/${normalizedSlug}/`,
    )
  }

  return withRedirectSourceMetadata(metadata, `/herbs/${normalizedSlug}/`)
}
