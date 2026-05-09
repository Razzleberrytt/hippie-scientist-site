import { list, text, unique } from '@/lib/display-utils'
import { safeArray, safeLower, safeScore, safeSlug } from '@/lib/search-safe'
import { calculateDiscoveryScore } from '@/lib/discovery-score'
import {
  getComparisonCandidates as getGraphComparisonCandidates,
  getRelatedProfiles as getGraphRelatedProfiles,
  getStackCandidates as getGraphStackCandidates,
  type GraphCandidate,
  type GraphRelationship,
} from '@/lib/runtime-graph'

const MAX_RELATED_PROFILES = 12
const MAX_COMPARISON_CANDIDATES = 8
const MAX_STACK_CANDIDATES = 6

function normalize(value: unknown) {
  return safeLower(value)
}

function collectSignals(record: any) {
  return unique([
    ...list(record?.primary_effects),
    ...list(record?.primaryEffects),
    ...list(record?.effects),
    ...list(record?.mechanisms),
    ...list(record?.pathways),
    ...list(record?.targets),
    ...list(record?.biologicalTargets),
    ...list(record?.compoundClass),
    ...list(record?.class),
    ...list(record?.foundIn),
    ...list(record?.activeCompounds),
    ...list(record?.traditionalUses),
  ])
    .map(normalize)
    .filter(Boolean)
}

function collectGraphSignals(edge: GraphRelationship | GraphCandidate | undefined) {
  if (!edge) return []

  return unique([
    ...list((edge as GraphRelationship)?.mechanisms),
    ...list((edge as GraphRelationship)?.pathways),
    ...list((edge as GraphRelationship)?.topics),
    ...list((edge as GraphCandidate)?.mechanism_overlap),
    ...list((edge as GraphCandidate)?.pathway_overlap),
    ...list((edge as GraphCandidate)?.topic_overlap),
    ...list((edge as GraphCandidate)?.mechanism_complementarity),
    ...list((edge as GraphCandidate)?.pathway_complementarity),
  ])
    .map(normalize)
    .filter(Boolean)
}

function edgeOtherSlug(edge: GraphRelationship | GraphCandidate, sourceSlug: string) {
  const source = safeSlug(edge?.source)
  const target = safeSlug(edge?.target)

  if (!source || !target) return ''
  if (source === sourceSlug) return target
  if (target === sourceSlug) return source
  return ''
}

function evidenceWeight(value: unknown) {
  const evidence = safeLower(value)

  if (evidence.includes('strong')) return 3
  if (evidence.includes('moderate')) return 2
  if (evidence.includes('limited')) return 1
  if (evidence.includes('mechanistic')) return 0.5
  return 0
}

function graphWeight(edge: GraphRelationship | GraphCandidate | undefined) {
  if (!edge) return 0

  const numericWeight = Number(text(edge.weight))
  const weightedSignal = Number.isFinite(numericWeight) ? Math.min(numericWeight / 25, 10) : 0
  const mechanisms = list((edge as GraphRelationship)?.mechanisms || (edge as GraphCandidate)?.mechanism_overlap).length
  const pathways = list((edge as GraphRelationship)?.pathways || (edge as GraphCandidate)?.pathway_overlap).length
  const complementaryMechanisms = list((edge as GraphCandidate)?.mechanism_complementarity).length
  const complementaryPathways = list((edge as GraphCandidate)?.pathway_complementarity).length
  const rationale = text(edge.rationale) ? 0.75 : 0

  return (
    weightedSignal +
    Math.min(mechanisms, 4) * 2 +
    Math.min(pathways, 4) * 1.5 +
    Math.min(complementaryMechanisms, 3) * 1.5 +
    Math.min(complementaryPathways, 3) +
    evidenceWeight(edge.evidence_context) +
    rationale
  )
}

function hasBiologicalGraphSupport(edge: GraphRelationship | GraphCandidate | undefined) {
  if (!edge) return false

  const mechanismCount = list((edge as GraphRelationship)?.mechanisms || (edge as GraphCandidate)?.mechanism_overlap).length +
    list((edge as GraphCandidate)?.mechanism_complementarity).length
  const pathwayCount = list((edge as GraphRelationship)?.pathways || (edge as GraphCandidate)?.pathway_overlap).length +
    list((edge as GraphCandidate)?.pathway_complementarity).length
  const topicCount = list((edge as GraphRelationship)?.topics || (edge as GraphCandidate)?.topic_overlap).length
  const type = safeLower(edge.type)

  return mechanismCount > 0 || pathwayCount > 0 || (topicCount >= 2 && !type.includes('topic-only'))
}

function collectGraphEdges(record: any) {
  const sourceSlug = safeSlug(record?.slug)
  if (!sourceSlug) return new Map<string, { related?: GraphRelationship; comparison?: GraphCandidate; stack?: GraphCandidate }>()

  const edges = new Map<string, { related?: GraphRelationship; comparison?: GraphCandidate; stack?: GraphCandidate }>()

  const merge = (slug: string, value: { related?: GraphRelationship; comparison?: GraphCandidate; stack?: GraphCandidate }) => {
    if (!slug || slug === sourceSlug) return
    edges.set(slug, { ...(edges.get(slug) || {}), ...value })
  }

  getGraphRelatedProfiles(record, MAX_RELATED_PROFILES).forEach((edge) => {
    merge(edgeOtherSlug(edge, sourceSlug), { related: edge })
  })

  getGraphComparisonCandidates(record, MAX_COMPARISON_CANDIDATES).forEach((edge) => {
    merge(edgeOtherSlug(edge, sourceSlug), { comparison: edge })
  })

  getGraphStackCandidates(record, MAX_STACK_CANDIDATES).forEach((edge) => {
    merge(edgeOtherSlug(edge, sourceSlug), { stack: edge })
  })

  return edges
}

export function getRelatedRuntimeRecords(record: any, records: any[], limit = 6) {
  const sourceSlug = safeSlug(record?.slug)
  const sourceSignals = collectSignals(record)
  const graphEdges = collectGraphEdges(record)
  const requestedLimit = Math.min(MAX_RELATED_PROFILES, Math.max(0, safeScore(limit, 6)))

  if (!sourceSignals.length && graphEdges.size === 0) {
    return []
  }

  const seen = new Set<string>()

  return safeArray(records)
    .filter((candidate: any) => {
      const candidateSlug = safeSlug(candidate?.slug)

      if (!candidate || !candidateSlug || candidateSlug === sourceSlug) {
        return false
      }

      if (seen.has(candidateSlug)) {
        return false
      }

      const candidateSignals = collectSignals(candidate)
      const fallbackMatched = candidateSignals.some((signal) =>
        sourceSignals.includes(signal)
      )
      const graphMatch = graphEdges.get(candidateSlug)
      const graphMatched = Boolean(
        hasBiologicalGraphSupport(graphMatch?.related) ||
        hasBiologicalGraphSupport(graphMatch?.comparison) ||
        hasBiologicalGraphSupport(graphMatch?.stack)
      )

      if (fallbackMatched || graphMatched) {
        seen.add(candidateSlug)
      }

      return fallbackMatched || graphMatched
    })
    .map((candidate: any) => {
      const candidateSignals = collectSignals(candidate)
      const graphMatch = graphEdges.get(safeSlug(candidate?.slug))
      const graphSignals = unique([
        ...collectGraphSignals(graphMatch?.related),
        ...collectGraphSignals(graphMatch?.comparison),
        ...collectGraphSignals(graphMatch?.stack),
      ])

      const overlap = unique([
        ...candidateSignals.filter((signal) => sourceSignals.includes(signal)),
        ...graphSignals,
      ])

      const relationshipKinds = [
        graphMatch?.related ? 'graph-related' : '',
        graphMatch?.comparison ? 'comparison-candidate' : '',
        graphMatch?.stack ? 'stack-candidate' : '',
      ].filter(Boolean)

      const graphScore =
        graphWeight(graphMatch?.related) +
        graphWeight(graphMatch?.comparison) +
        graphWeight(graphMatch?.stack)

      return {
        ...candidate,
        relatedOverlap: overlap,
        relatedGraphKinds: relationshipKinds,
        relatedScore:
          safeScore(overlap.length) +
          calculateDiscoveryScore(record, candidate) +
          graphScore,
      }
    })
    .sort((a: any, b: any) => {
      const scoreDelta = safeScore(b?.relatedScore) - safeScore(a?.relatedScore)

      if (scoreDelta !== 0) {
        return scoreDelta
      }

      const nameDelta = safeLower(a?.name).localeCompare(safeLower(b?.name))
      if (nameDelta !== 0) return nameDelta

      return safeSlug(a?.slug).localeCompare(safeSlug(b?.slug))
    })
    .slice(0, requestedLimit)
}


function getEdgeByKind(
  match: { related?: GraphRelationship; comparison?: GraphCandidate; stack?: GraphCandidate } | undefined,
  kind: 'comparison' | 'stack'
) {
  return kind === 'comparison' ? match?.comparison : match?.stack
}

function collectCandidateSignals(edge: GraphCandidate | undefined, kind: 'comparison' | 'stack') {
  if (!edge) return []

  return unique([
    ...list(edge.mechanism_overlap),
    ...list(edge.pathway_overlap),
    ...list(edge.topic_overlap),
    ...list(edge.ecosystem_overlap),
    ...(kind === 'stack' ? list(edge.mechanism_complementarity) : []),
    ...(kind === 'stack' ? list(edge.pathway_complementarity) : []),
  ]).filter(Boolean)
}

function hasCandidateSupport(edge: GraphCandidate | undefined, kind: 'comparison' | 'stack') {
  if (!edge) return false

  const mechanismOverlap = list(edge.mechanism_overlap).length
  const pathwayOverlap = list(edge.pathway_overlap).length
  const topicOverlap = list(edge.topic_overlap).length + list(edge.ecosystem_overlap).length
  const mechanismComplementarity = list(edge.mechanism_complementarity).length
  const pathwayComplementarity = list(edge.pathway_complementarity).length

  if (kind === 'stack') {
    return mechanismComplementarity > 0 || pathwayComplementarity > 0 || mechanismOverlap >= 2 || pathwayOverlap >= 2
  }

  return mechanismOverlap > 0 || pathwayOverlap > 0 || topicOverlap >= 2
}

function enrichGraphCandidateRecord(candidate: any, edge: GraphCandidate, kind: 'comparison' | 'stack', sourceSignals: string[]) {
  const candidateSignals = collectSignals(candidate)
  const overlap = unique([
    ...candidateSignals.filter((signal) => sourceSignals.includes(signal)),
    ...collectCandidateSignals(edge, kind).map(normalize),
  ])

  const shared = {
    ...candidate,
    graphCandidateType: kind,
    graphCandidateRationale: text(edge.rationale),
    graphEvidenceContext: text(edge.evidence_context),
    graphFraming: text(edge.framing),
    graphSafetyGate: text(edge.safety_gate),
    graphMechanismOverlap: list(edge.mechanism_overlap),
    graphPathwayOverlap: list(edge.pathway_overlap),
    graphEcosystemOverlap: unique([...list(edge.ecosystem_overlap), ...list(edge.topic_overlap)]),
    graphMechanismComplementarity: list(edge.mechanism_complementarity),
    graphPathwayComplementarity: list(edge.pathway_complementarity),
    relatedOverlap: overlap,
    relatedGraphKinds: [kind === 'comparison' ? 'comparison-candidate' : 'stack-candidate'],
    relatedScore: safeScore(overlap.length) + calculateDiscoveryScore({ slug: edge.source }, candidate) + graphWeight(edge),
  }

  return shared
}

export function getComparisonRuntimeRecords(record: any, records: any[], limit = MAX_COMPARISON_CANDIDATES) {
  const sourceSlug = safeSlug(record?.slug)
  const sourceSignals = collectSignals(record)
  const graphEdges = collectGraphEdges(record)
  const requestedLimit = Math.min(MAX_COMPARISON_CANDIDATES, Math.max(0, safeScore(limit, MAX_COMPARISON_CANDIDATES)))

  if (!sourceSlug || graphEdges.size === 0) return []

  const seen = new Set<string>()

  return safeArray(records)
    .map((candidate: any) => {
      const candidateSlug = safeSlug(candidate?.slug)
      if (!candidate || !candidateSlug || candidateSlug === sourceSlug || seen.has(candidateSlug)) return null

      const edge = getEdgeByKind(graphEdges.get(candidateSlug), 'comparison')
      if (!hasCandidateSupport(edge, 'comparison')) return null

      seen.add(candidateSlug)
      return enrichGraphCandidateRecord(candidate, edge as GraphCandidate, 'comparison', sourceSignals)
    })
    .filter(Boolean)
    .sort((a: any, b: any) => {
      const scoreDelta = safeScore(b?.relatedScore) - safeScore(a?.relatedScore)
      if (scoreDelta !== 0) return scoreDelta

      const nameDelta = safeLower(a?.name).localeCompare(safeLower(b?.name))
      if (nameDelta !== 0) return nameDelta

      return safeSlug(a?.slug).localeCompare(safeSlug(b?.slug))
    })
    .slice(0, requestedLimit)
}

export function getStackRuntimeRecords(record: any, records: any[], limit = MAX_STACK_CANDIDATES) {
  const sourceSlug = safeSlug(record?.slug)
  const sourceSignals = collectSignals(record)
  const graphEdges = collectGraphEdges(record)
  const requestedLimit = Math.min(MAX_STACK_CANDIDATES, Math.max(0, safeScore(limit, MAX_STACK_CANDIDATES)))

  if (!sourceSlug || graphEdges.size === 0) return []

  const seen = new Set<string>()

  return safeArray(records)
    .map((candidate: any) => {
      const candidateSlug = safeSlug(candidate?.slug)
      if (!candidate || !candidateSlug || candidateSlug === sourceSlug || seen.has(candidateSlug)) return null

      const edge = getEdgeByKind(graphEdges.get(candidateSlug), 'stack')
      if (!hasCandidateSupport(edge, 'stack')) return null

      seen.add(candidateSlug)
      return enrichGraphCandidateRecord(candidate, edge as GraphCandidate, 'stack', sourceSignals)
    })
    .filter(Boolean)
    .sort((a: any, b: any) => {
      const scoreDelta = safeScore(b?.relatedScore) - safeScore(a?.relatedScore)
      if (scoreDelta !== 0) return scoreDelta

      const nameDelta = safeLower(a?.name).localeCompare(safeLower(b?.name))
      if (nameDelta !== 0) return nameDelta

      return safeSlug(a?.slug).localeCompare(safeSlug(b?.slug))
    })
    .slice(0, requestedLimit)
}

export function getRelatedLabel(record: any) {
  const primary = collectSignals(record)[0]

  if (!primary) {
    return 'Related Research Profiles'
  }

  return `Related to ${text(primary)}`
}
