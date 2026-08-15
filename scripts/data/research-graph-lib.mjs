import { edgeId, entityId } from './canonical/ids.mjs'

function clean(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function slugify(value) {
  return clean(value)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function asArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (value == null || value === '') return []
  return [value]
}

function canonicalGrade(value) {
  const text = clean(value).toUpperCase()
  if (/^A(?:\b|[+-])/.test(text)) return 'A'
  if (/^B(?:\b|[+-])/.test(text)) return 'B'
  if (/^C(?:\b|[+-])/.test(text)) return 'C'
  if (/^D(?:\b|[+-])/.test(text)) return 'D'
  if (/AVOID|INSUFFICIENT/.test(text)) return 'Avoid/Insufficient'
  return ''
}

function addNode(nodes, node) {
  if (!node?.id) return
  const existing = nodes.get(node.id)
  nodes.set(node.id, existing ? { ...node, ...existing, ...node } : node)
}

function addEdge(edges, edge) {
  if (!edge?.from || !edge?.to || !edge?.rel) return
  const id = edge.id || edgeId({ from_id: edge.from, rel_type: edge.rel, to_id: edge.to })
  const existing = edges.get(id)
  if (!existing) {
    edges.set(id, { id, sourceClaimIds: [], sourceIds: [], ...edge })
    return
  }
  edges.set(id, {
    ...existing,
    ...edge,
    sourceClaimIds: [...new Set([...(existing.sourceClaimIds || []), ...(edge.sourceClaimIds || [])])],
    sourceIds: [...new Set([...(existing.sourceIds || []), ...(edge.sourceIds || [])])],
  })
}

function runtimeEntityNode(record, kind) {
  const slug = clean(record?.slug)
  if (!slug) return null
  return {
    id: entityId(kind, slug),
    kind,
    slug,
    label: clean(record?.displayName || record?.name || record?.compoundName || slug),
    evidenceGrade: canonicalGrade(record?.evidence_grade || record?.evidenceGrade || record?.evidence_tier),
    safetyFlags: asArray(record?.safety_flags || record?.safetyFlags || record?.contraindications).map(clean).filter(Boolean),
  }
}

function claimStudyId(claim) {
  return clean(claim?.qualifiers?.study_id || claim?.qualifiers?.studyId)
}

function claimDirection(claim) {
  return clean(claim?.qualifiers?.direction)
}

function claimNodeKind(predicate) {
  if (predicate === 'affects_mechanism') return 'pathway'
  if (predicate === 'supports_outcome' || predicate === 'targets_condition') return 'outcome'
  if (predicate === 'has_safety_warning' || predicate === 'contraindicated_in') return 'safety'
  return 'entity'
}

function objectNodeForClaim(claim) {
  if (claim?.object_id) {
    return {
      id: clean(claim.object_id),
      kind: claimNodeKind(claim.predicate),
      label: clean(claim?.qualifiers?.object_label || claim?.qualifiers?.label || claim.object_id),
    }
  }

  const literal = typeof claim?.object_literal === 'string' ? clean(claim.object_literal) : ''
  if (!literal) return null
  const kind = claimNodeKind(claim.predicate)
  return {
    id: entityId(kind === 'pathway' ? 'mechanism' : kind === 'outcome' ? 'effect' : 'safety_issue', slugify(literal)),
    kind,
    slug: slugify(literal),
    label: literal,
  }
}

function relationForClaim(predicate) {
  if (predicate === 'affects_mechanism') return 'affects_pathway'
  if (predicate === 'supports_outcome') return 'studied_for_outcome'
  if (predicate === 'targets_condition') return 'targets_outcome'
  if (predicate === 'has_safety_warning') return 'has_safety_issue'
  if (predicate === 'contraindicated_in') return 'contraindicated_in'
  if (predicate === 'interacts_with') return 'interacts_with'
  if (predicate === 'contains') return 'contains_compound'
  return ''
}

function pairKey(a, b) {
  return [a, b].sort().join('|')
}

function buildComparisonOpportunities({ nodes, edges }) {
  const opportunities = new Map()
  const entityNodes = [...nodes.values()].filter((node) => node.kind === 'herb' || node.kind === 'compound')
  const byId = new Map(entityNodes.map((node) => [node.id, node]))
  const compoundsByHerb = new Map()
  const pathwaysByEntity = new Map()
  const outcomesByEntity = new Map()
  const safetyByEntity = new Map()

  const addIndex = (map, key, value) => {
    if (!key || !value) return
    map.set(key, new Set([...(map.get(key) || []), value]))
  }

  for (const edge of edges.values()) {
    if (edge.rel === 'contains_compound') addIndex(compoundsByHerb, edge.from, edge.to)
    if (edge.rel === 'affects_pathway') addIndex(pathwaysByEntity, edge.from, edge.to)
    if (edge.rel === 'studied_for_outcome' || edge.rel === 'targets_outcome') addIndex(outcomesByEntity, edge.from, edge.to)
    if (edge.rel === 'has_safety_issue' || edge.rel === 'contraindicated_in') addIndex(safetyByEntity, edge.from, edge.to)
  }

  function addOpportunity(aId, bId, type, rationale, shared = []) {
    if (aId === bId || !byId.has(aId) || !byId.has(bId)) return
    const key = pairKey(aId, bId)
    const a = byId.get(aId)
    const b = byId.get(bId)
    const current = opportunities.get(key) || {
      pair: [a, b].sort((x, y) => x.slug.localeCompare(y.slug)).map((node) => ({ id: node.id, slug: node.slug, label: node.label, kind: node.kind, evidenceGrade: node.evidenceGrade })),
      types: [],
      rationales: [],
      shared: [],
      moatScore: 0,
    }
    if (!current.types.includes(type)) current.types.push(type)
    if (!current.rationales.includes(rationale)) current.rationales.push(rationale)
    current.shared = [...new Set([...current.shared, ...shared])]
    current.moatScore = Math.min(100, current.moatScore + ({
      shared_active_compounds: 30,
      similar_mechanism_different_evidence: 25,
      same_goal_different_mechanism: 30,
      same_mechanism_different_safety: 35,
    }[type] || 10))
    opportunities.set(key, current)
  }

  const herbs = entityNodes.filter((node) => node.kind === 'herb')
  for (let i = 0; i < herbs.length; i += 1) {
    for (let j = i + 1; j < herbs.length; j += 1) {
      const a = herbs[i]
      const b = herbs[j]
      const sharedCompounds = [...(compoundsByHerb.get(a.id) || [])].filter((id) => compoundsByHerb.get(b.id)?.has(id))
      if (sharedCompounds.length >= 1) {
        addOpportunity(a.id, b.id, 'shared_active_compounds', `${a.label} and ${b.label} share ${sharedCompounds.length} mapped active compound${sharedCompounds.length === 1 ? '' : 's'}.`, sharedCompounds)
      }
    }
  }

  for (let i = 0; i < entityNodes.length; i += 1) {
    for (let j = i + 1; j < entityNodes.length; j += 1) {
      const a = entityNodes[i]
      const b = entityNodes[j]
      const aPathways = pathwaysByEntity.get(a.id) || new Set()
      const bPathways = pathwaysByEntity.get(b.id) || new Set()
      const sharedPathways = [...aPathways].filter((id) => bPathways.has(id))
      const aOutcomes = outcomesByEntity.get(a.id) || new Set()
      const bOutcomes = outcomesByEntity.get(b.id) || new Set()
      const sharedOutcomes = [...aOutcomes].filter((id) => bOutcomes.has(id))

      if (sharedPathways.length && a.evidenceGrade && b.evidenceGrade && a.evidenceGrade !== b.evidenceGrade) {
        addOpportunity(a.id, b.id, 'similar_mechanism_different_evidence', `${a.label} and ${b.label} share a mechanism/pathway signal but have different evidence grades (${a.evidenceGrade} vs ${b.evidenceGrade}).`, sharedPathways)
      }

      if (sharedOutcomes.length && aPathways.size && bPathways.size && sharedPathways.length === 0) {
        addOpportunity(a.id, b.id, 'same_goal_different_mechanism', `${a.label} and ${b.label} are studied for the same outcome through different mapped mechanisms.`, sharedOutcomes)
      }

      if (sharedPathways.length) {
        const aSafety = safetyByEntity.get(a.id) || new Set()
        const bSafety = safetyByEntity.get(b.id) || new Set()
        const safetyDifference = [...aSafety].some((id) => !bSafety.has(id)) || [...bSafety].some((id) => !aSafety.has(id))
        if (safetyDifference) {
          addOpportunity(a.id, b.id, 'same_mechanism_different_safety', `${a.label} and ${b.label} share a mapped mechanism but have different safety-warning relationships.`, sharedPathways)
        }
      }
    }
  }

  return [...opportunities.values()]
    .sort((a, b) => b.moatScore - a.moatScore || a.pair[0].slug.localeCompare(b.pair[0].slug))
}

function buildIndexes(nodes, edges) {
  const botanicalsByCompound = {}
  const compoundsByBotanical = {}
  const recommendations = {}
  const degree = new Map()

  for (const edge of edges.values()) {
    degree.set(edge.from, (degree.get(edge.from) || 0) + 1)
    degree.set(edge.to, (degree.get(edge.to) || 0) + 1)
    if (edge.rel === 'contains_compound') {
      compoundsByBotanical[edge.from] = [...new Set([...(compoundsByBotanical[edge.from] || []), edge.to])]
      botanicalsByCompound[edge.to] = [...new Set([...(botanicalsByCompound[edge.to] || []), edge.from])]
    }
  }

  const weights = {
    contains_compound: 5,
    studied_for_outcome: 4,
    affects_pathway: 3,
    pathway_associated_outcome: 3,
    study_investigates_ingredient: 2,
    study_reports_outcome: 2,
    has_safety_issue: 2,
  }

  for (const node of nodes.values()) {
    const candidates = new Map()
    for (const edge of edges.values()) {
      if (edge.from !== node.id && edge.to !== node.id) continue
      const other = edge.from === node.id ? edge.to : edge.from
      if (!nodes.has(other)) continue
      candidates.set(other, (candidates.get(other) || 0) + (weights[edge.rel] || 1))
    }
    recommendations[node.id] = [...candidates.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([id, score]) => ({ id, score, label: nodes.get(id)?.label || id, kind: nodes.get(id)?.kind || 'entity' }))
  }

  const isolated = [...nodes.values()].filter((node) => !degree.get(node.id)).map((node) => ({ id: node.id, kind: node.kind, slug: node.slug, label: node.label }))
  const overConnected = [...degree.entries()]
    .filter(([, count]) => count >= 50)
    .sort((a, b) => b[1] - a[1])
    .map(([id, count]) => ({ id, degree: count, label: nodes.get(id)?.label || id, kind: nodes.get(id)?.kind || 'entity' }))

  return { botanicalsByCompound, compoundsByBotanical, recommendations, isolated, overConnected }
}

export function buildResearchRelationshipGraph({ herbs = [], compounds = [], herbCompoundMap = [], claims = [] } = {}) {
  const nodes = new Map()
  const edges = new Map()

  for (const row of herbs) {
    const node = runtimeEntityNode(row, 'herb')
    if (node) addNode(nodes, node)
  }
  for (const row of compounds) {
    const node = runtimeEntityNode(row, 'compound')
    if (node) addNode(nodes, node)
  }

  for (const relation of herbCompoundMap) {
    const herbSlug = clean(relation?.herb_slug || relation?.herbSlug)
    const compoundSlug = clean(relation?.compound_slug || relation?.compoundSlug)
    if (!herbSlug || !compoundSlug) continue
    const herbId = entityId('herb', herbSlug)
    const compoundId = entityId('compound', compoundSlug)
    if (!nodes.has(herbId)) addNode(nodes, { id: herbId, kind: 'herb', slug: herbSlug, label: clean(relation?.herb || herbSlug) })
    if (!nodes.has(compoundId)) addNode(nodes, { id: compoundId, kind: 'compound', slug: compoundSlug, label: clean(relation?.compound || compoundSlug) })
    addEdge(edges, {
      from: herbId,
      to: compoundId,
      rel: 'contains_compound',
      origin: 'runtime_relationship',
      evidence: 'mapped botanical constituent relationship',
    })
  }

  const claimsByStudySubject = new Map()
  for (const claim of claims) {
    const subjectId = clean(claim?.subject_id)
    if (!subjectId) continue
    const subjectKnown = nodes.get(subjectId)
    if (!subjectKnown) {
      addNode(nodes, { id: subjectId, kind: subjectId.startsWith('ent_herb_') ? 'herb' : subjectId.startsWith('ent_compound_') ? 'compound' : 'entity', label: subjectId })
    }

    const objectNode = objectNodeForClaim(claim)
    if (objectNode) addNode(nodes, objectNode)
    const relation = relationForClaim(claim?.predicate)
    if (relation && objectNode) {
      addEdge(edges, {
        from: subjectId,
        to: objectNode.id,
        rel: relation,
        origin: 'claim',
        evidenceLevel: clean(claim?.evidence_level),
        direction: claimDirection(claim),
        sourceClaimIds: [clean(claim?.id)].filter(Boolean),
        sourceIds: asArray(claim?.source_ids).map(clean).filter(Boolean),
      })
    }

    const studyId = claimStudyId(claim)
    if (studyId) {
      addNode(nodes, { id: studyId, kind: 'study', label: studyId })
      addEdge(edges, {
        from: studyId,
        to: subjectId,
        rel: 'study_investigates_ingredient',
        origin: 'claim_qualifier',
        evidenceLevel: clean(claim?.evidence_level),
        sourceClaimIds: [clean(claim?.id)].filter(Boolean),
        sourceIds: asArray(claim?.source_ids).map(clean).filter(Boolean),
      })
      if (objectNode && (claim?.predicate === 'supports_outcome' || claim?.predicate === 'targets_condition')) {
        addEdge(edges, {
          from: studyId,
          to: objectNode.id,
          rel: 'study_reports_outcome',
          origin: 'claim_qualifier',
          evidenceLevel: clean(claim?.evidence_level),
          direction: claimDirection(claim),
          sourceClaimIds: [clean(claim?.id)].filter(Boolean),
          sourceIds: asArray(claim?.source_ids).map(clean).filter(Boolean),
        })
      }

      const groupKey = `${studyId}|${subjectId}`
      claimsByStudySubject.set(groupKey, [...(claimsByStudySubject.get(groupKey) || []), { claim, objectNode }])
    }
  }

  // A pathway→outcome edge is deliberately emitted only when the same study ID
  // and same ingredient connect a mechanism claim and an outcome claim. The
  // relationship is associative, not causal, so mechanisms never masquerade as
  // proven benefits.
  for (const rows of claimsByStudySubject.values()) {
    const pathways = rows.filter(({ claim, objectNode }) => claim?.predicate === 'affects_mechanism' && objectNode)
    const outcomes = rows.filter(({ claim, objectNode }) => (claim?.predicate === 'supports_outcome' || claim?.predicate === 'targets_condition') && objectNode)
    for (const pathway of pathways) {
      for (const outcome of outcomes) {
        addEdge(edges, {
          from: pathway.objectNode.id,
          to: outcome.objectNode.id,
          rel: 'pathway_associated_outcome',
          origin: 'same_study_association',
          sourceClaimIds: [clean(pathway.claim?.id), clean(outcome.claim?.id)].filter(Boolean),
          sourceIds: [...new Set([
            ...asArray(pathway.claim?.source_ids).map(clean),
            ...asArray(outcome.claim?.source_ids).map(clean),
          ].filter(Boolean))],
          caveat: 'Association inferred from claims sharing the same study and ingredient; not a causal clinical-effect claim.',
        })
      }
    }
  }

  const comparisonOpportunities = buildComparisonOpportunities({ nodes, edges })
  const indexes = buildIndexes(nodes, edges)

  const edgeCounts = {}
  for (const edge of edges.values()) edgeCounts[edge.rel] = (edgeCounts[edge.rel] || 0) + 1

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    semantics: {
      pathway_associated_outcome: 'Same-study association only; does not assert that the pathway causes the outcome.',
      study_investigates_ingredient: 'Derived from claim.qualifiers.study_id.',
      study_reports_outcome: 'Derived from an outcome claim carrying claim.qualifiers.study_id.',
    },
    summary: {
      nodes: nodes.size,
      edges: edges.size,
      edgeCounts,
      comparisonOpportunities: comparisonOpportunities.length,
      isolatedEntities: indexes.isolated.length,
      overConnectedEntities: indexes.overConnected.length,
    },
    nodes: [...nodes.values()].sort((a, b) => a.id.localeCompare(b.id)),
    edges: [...edges.values()].sort((a, b) => a.id.localeCompare(b.id)),
    indexes: {
      botanicalsByCompound: indexes.botanicalsByCompound,
      compoundsByBotanical: indexes.compoundsByBotanical,
      relatedContent: indexes.recommendations,
    },
    diagnostics: {
      isolated: indexes.isolated,
      overConnected: indexes.overConnected,
    },
    comparisonOpportunities,
  }
}
