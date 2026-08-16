import SchemaOrg from '@/components/SchemaOrg'

type SchemaGraphScriptProps = {
  graph: Record<string, unknown>
}

const LEGACY_PLACEHOLDER_PUBLICATION_DATE = '2026-01-01'
const SITE_URL = 'https://thehippiescientist.net'
const ORGANIZATION_ID = `${SITE_URL}/#organization`
const USAGE_POLICY_URL = `${SITE_URL}/info/content-licensing/`

export type EntityArtifact = {
  href: string
  absoluteUrl: string
  canonicalUrl: string
  entityId: string
  name: string
}

export function getEntityArtifact(graph: Record<string, unknown>): EntityArtifact | null {
  const nodes = graph['@graph']
  if (!Array.isArray(nodes)) return null

  for (const node of nodes) {
    if (!node || typeof node !== 'object') continue
    const record = node as Record<string, unknown>
    const entityId = typeof record['@id'] === 'string' ? record['@id'] : ''
    const canonicalUrl = typeof record.url === 'string' ? record.url : ''
    if (!entityId.endsWith('#entity') || !canonicalUrl) continue

    try {
      const url = new URL(canonicalUrl)
      const match = url.pathname.match(/^\/(herbs|compounds)\/([^/]+)\/?$/)
      if (!match) continue
      const kind = match[1] === 'herbs' ? 'herb' : 'compound'
      const slug = match[2]
      const href = `/data/ai-entities/${kind}/${slug}.json`
      return {
        href,
        absoluteUrl: `${url.origin}${href}`,
        canonicalUrl: canonicalUrl.endsWith('/') ? canonicalUrl : `${canonicalUrl}/`,
        entityId,
        name: typeof record.name === 'string' ? record.name : slug,
      }
    } catch {
      continue
    }
  }

  return null
}

export function normalizeProfileEntitySemantics(
  graph: Record<string, unknown>,
  artifact: EntityArtifact | null,
): Record<string, unknown> {
  if (!artifact || !artifact.href.includes('/herb/') || !Array.isArray(graph['@graph'])) return graph

  const nodes = graph['@graph'].map((node) => {
    if (!node || typeof node !== 'object') return node
    const record = node as Record<string, unknown>

    if (record['@id'] === artifact.entityId) {
      return { ...record, '@type': 'Substance' }
    }

    const mainEntity = record.mainEntity
    const mainEntityId = mainEntity && typeof mainEntity === 'object'
      ? (mainEntity as Record<string, unknown>)['@id']
      : null
    const about = record.about
    const aboutType = about && typeof about === 'object'
      ? (about as Record<string, unknown>)['@type']
      : null

    if (mainEntityId === artifact.entityId && aboutType === 'MedicalTherapy') {
      return { ...record, about: { '@id': artifact.entityId } }
    }

    return node
  })

  return { ...graph, '@graph': nodes }
}

export function normalizeProfileReviewSemantics(
  graph: Record<string, unknown>,
  artifact: EntityArtifact | null,
): Record<string, unknown> {
  if (!artifact || !Array.isArray(graph['@graph'])) return graph

  const nodes = graph['@graph'].map((node) => {
    if (!node || typeof node !== 'object') return node
    const record = node as Record<string, unknown>
    const id = typeof record['@id'] === 'string' ? record['@id'] : ''

    if (id === `${artifact.canonicalUrl}#webpage` && !record.dateReviewed) {
      const { reviewedBy: _reviewedBy, ...rest } = record
      return rest
    }

    if (id === `${artifact.canonicalUrl}#evidence-review` && 'datePublished' in record) {
      const { datePublished: _datePublished, ...rest } = record
      return rest
    }

    return node
  })

  return { ...graph, '@graph': nodes }
}

export function normalizePlaceholderPublicationDates(
  graph: Record<string, unknown>,
): Record<string, unknown> {
  if (!Array.isArray(graph['@graph'])) return graph

  const nodes = graph['@graph'].map((node) => {
    if (!node || typeof node !== 'object') return node
    const record = node as Record<string, unknown>
    const id = typeof record['@id'] === 'string' ? record['@id'] : ''
    const types = Array.isArray(record['@type']) ? record['@type'] : [record['@type']]

    const isEntryArticle = id.endsWith('#webpage') && types.includes('Article')
    if (isEntryArticle && record.datePublished === LEGACY_PLACEHOLDER_PUBLICATION_DATE) {
      const { datePublished: _datePublished, ...rest } = record
      return rest
    }

    return node
  })

  return { ...graph, '@graph': nodes }
}

export function attachEntityDataset(
  graph: Record<string, unknown>,
  artifact: EntityArtifact | null,
): Record<string, unknown> {
  if (!artifact || !Array.isArray(graph['@graph'])) return graph

  const datasetId = `${artifact.canonicalUrl}#ai-entity-dataset`
  const dataset = {
    '@type': 'Dataset',
    '@id': datasetId,
    name: `${artifact.name} structured evidence data`,
    description: `Machine-readable identity, evidence claims, citations, relationships, safety, and review provenance for ${artifact.name}.`,
    url: artifact.absoluteUrl,
    encodingFormat: 'application/ld+json',
    about: { '@id': artifact.entityId },
    isBasedOn: artifact.canonicalUrl,
    creator: { '@id': ORGANIZATION_ID },
    publisher: { '@id': ORGANIZATION_ID },
    creditText: 'The Hippie Scientist',
    usageInfo: USAGE_POLICY_URL,
    conditionsOfAccess: 'Publicly accessible; reuse remains subject to the site attribution policy and third-party source rights.',
    distribution: {
      '@type': 'DataDownload',
      contentUrl: artifact.absoluteUrl,
      encodingFormat: 'application/ld+json',
    },
  }

  const nodes = graph['@graph'].map((node) => {
    if (!node || typeof node !== 'object') return node
    const record = node as Record<string, unknown>
    if (record['@id'] !== artifact.entityId) return node

    const existingSubjectOf = record.subjectOf
    const datasetRef = { '@id': datasetId }
    const subjectOf = existingSubjectOf
      ? Array.isArray(existingSubjectOf)
        ? existingSubjectOf.some((item) => item && typeof item === 'object' && (item as Record<string, unknown>)['@id'] === datasetId)
          ? existingSubjectOf
          : [...existingSubjectOf, datasetRef]
        : (existingSubjectOf as Record<string, unknown>)['@id'] === datasetId
          ? existingSubjectOf
          : [existingSubjectOf, datasetRef]
      : datasetRef

    return { ...record, subjectOf }
  })

  const existingDataset = nodes.some((node) => node && typeof node === 'object' && (node as Record<string, unknown>)['@id'] === datasetId)
  return { ...graph, '@graph': existingDataset ? nodes : [...nodes, dataset] }
}

export default function SchemaGraphScript({ graph }: SchemaGraphScriptProps) {
  const artifact = getEntityArtifact(graph)
  const normalizedEntityGraph = normalizeProfileEntitySemantics(graph, artifact)
  const normalizedReviewGraph = normalizeProfileReviewSemantics(normalizedEntityGraph, artifact)
  const normalizedPublicationGraph = normalizePlaceholderPublicationDates(normalizedReviewGraph)
  const enrichedGraph = attachEntityDataset(normalizedPublicationGraph, artifact)

  return (
    <>
      {artifact ? (
        <link
          rel="alternate"
          type="application/ld+json"
          href={artifact.href}
          title={`${artifact.name} structured evidence data`}
        />
      ) : null}
      <SchemaOrg graph={enrichedGraph} />
    </>
  )
}
