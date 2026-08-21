import { buildStableEntityId } from '../../config/evidence-graph/identity-rules.mjs'
import { edgeId, entityId } from './canonical/ids.mjs'

function clean(value) {
  return String(value ?? '').trim()
}

function buildSubstanceIdMap({ herbs = [], compounds = [] } = {}) {
  const map = new Map()
  const metadata = new Map()

  const add = (record, kind) => {
    const slug = clean(record?.slug)
    if (!slug) return
    const legacyId = entityId(kind, slug)
    const stableId = buildStableEntityId(kind, slug)
    map.set(legacyId, stableId)
    metadata.set(stableId, { legacyCanonicalId: legacyId, canonicalSlug: slug })
  }

  herbs.forEach((record) => add(record, 'herb'))
  compounds.forEach((record) => add(record, 'compound'))
  return { map, metadata }
}

function remapId(value, map) {
  return map.get(value) || value
}

function remapIdArray(values, map) {
  return Array.isArray(values) ? values.map((value) => remapId(value, map)) : values
}

function remapDictionaryKeysAndValues(dictionary, map) {
  const output = {}
  for (const [key, values] of Object.entries(dictionary || {})) {
    output[remapId(key, map)] = remapIdArray(values, map)
  }
  return output
}

/**
 * The canonical claim store still uses deterministic `ent_*` subject IDs while
 * the newer evidence-graph identity foundation exposes human-stable substance
 * IDs such as `herb:ashwagandha` and `compound:magnesium`.
 *
 * Relationship derivation intentionally happens against the legacy IDs first so
 * existing claims continue to join exactly as they do today. This boundary
 * remap then exposes one public substance identity system while retaining the
 * legacy canonical ID as provenance on each remapped substance node.
 */
export function remapResearchGraphToStableSubstanceIds(graph, runtime = {}) {
  const { map, metadata } = buildSubstanceIdMap(runtime)
  if (!map.size) return graph

  const nodes = (graph.nodes || []).map((node) => {
    const stableId = remapId(node.id, map)
    const identity = metadata.get(stableId)
    return {
      ...node,
      id: stableId,
      ...(identity ? identity : {}),
    }
  })

  const edges = (graph.edges || []).map((edge) => {
    const from = remapId(edge.from, map)
    const to = remapId(edge.to, map)
    return {
      ...edge,
      id: edgeId({ from_id: from, rel_type: edge.rel, to_id: to }),
      from,
      to,
    }
  })

  const relatedContent = {}
  for (const [key, rows] of Object.entries(graph.indexes?.relatedContent || {})) {
    relatedContent[remapId(key, map)] = (rows || []).map((row) => ({
      ...row,
      id: remapId(row.id, map),
    }))
  }

  const comparisonOpportunities = (graph.comparisonOpportunities || []).map((row) => ({
    ...row,
    pair: (row.pair || []).map((item) => ({ ...item, id: remapId(item.id, map) })),
    shared: remapIdArray(row.shared, map),
  }))

  return {
    ...graph,
    identityContract: {
      publicSubstanceIds: '<entityType>:<canonical-slug>',
      legacyClaimJoinIds: 'ent_<type>_<hash>',
      note: 'Legacy ent_* IDs remain only as compatibility provenance for canonical claim joins.',
    },
    nodes,
    edges,
    indexes: {
      ...(graph.indexes || {}),
      botanicalsByCompound: remapDictionaryKeysAndValues(graph.indexes?.botanicalsByCompound, map),
      compoundsByBotanical: remapDictionaryKeysAndValues(graph.indexes?.compoundsByBotanical, map),
      relatedContent,
    },
    diagnostics: {
      isolated: (graph.diagnostics?.isolated || []).map((row) => ({ ...row, id: remapId(row.id, map) })),
      overConnected: (graph.diagnostics?.overConnected || []).map((row) => ({ ...row, id: remapId(row.id, map) })),
    },
    comparisonOpportunities,
  }
}
