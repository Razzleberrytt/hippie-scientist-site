import SchemaOrg from '@/components/SchemaOrg'

type SchemaGraphScriptProps = {
  graph: Record<string, unknown>
}

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
      return {
        ...record,
        // Schema.org `Substance` covers matter of biological origin. Avoid the
        // non-canonical `MedicalSubstance` label previously emitted for herbs.
        '@type': 'Substance',
      }
    }

    const mainEntity = record.mainEntity
    const mainEntityId =
      mainEntity && typeof mainEntity === 'object'
        ? (mainEntity as Record<string, unknown>)['@id']
        : null
    const about = record.about
    const aboutType =
      about && typeof about === 'object'
        ? (about as Record<string, unknown>)['@type']
        : null

    if (mainEntityId === artifact.entityId && aboutType === 'MedicalTherapy') {
      return {
        ...record,
        // The profile page is about the canonical herb entity, not a treatment
        // intervention. Point `about` to the same Substance node used by
        // `mainEntity` so the graph has one consistent identity.
        about: { '@id': artifact.entityId },
      }
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

  const dataset = {
    '@type': 'Dataset',
    '@id': `${artifact.canonicalUrl}#ai-entity-dataset`,
    name: `${artifact.name} structured evidence data`,
    description: `Machine-readable identity, evidence claims, citations, relationships, safety, and review provenance for ${artifact.name}.`,
    url: artifact.absoluteUrl,
    encodingFormat: 'application/ld+json',
    about: { '@id': artifact.entityId },
    isBasedOn: artifact.canonicalUrl,
    creator: {
      '@type': 'Organization',
      name: 'The Hippie Scientist',
      url: 'https://thehippiescientist.net/',
    },
  }

  const nodes = graph['@graph'].map((node) => {
    if (!node || typeof node !== 'object') return node
    const record = node as Record<string, unknown>
    if (record['@id'] !== artifact.entityId) return node

    const existingSubjectOf = record.subjectOf
    const subjectOf = existingSubjectOf
      ? Array.isArray(existingSubjectOf)
        ? [...existingSubjectOf, { '@id': dataset['@id'] }]
        : [existingSubjectOf, { '@id': dataset['@id'] }]
      : { '@id': dataset['@id'] }

    return { ...record, subjectOf }
  })

  return { ...graph, '@graph': [...nodes, dataset] }
}

export default function SchemaGraphScript({ graph }: SchemaGraphScriptProps) {
  const artifact = getEntityArtifact(graph)
  const normalizedGraph = normalizeProfileEntitySemantics(graph, artifact)
  const enrichedGraph = attachEntityDataset(normalizedGraph, artifact)

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
