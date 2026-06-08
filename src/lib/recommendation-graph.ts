import { list, text, unique } from '@/lib/display-utils'

export type RecommendationGraphEdge = {
  source: string
  target: string
  score: number
  reasons: string[]
  relationship: 'mechanism' | 'evidence' | 'pathway' | 'effect' | 'ecosystem'
}

function normalize(value: unknown) {
  return text(value).toLowerCase().trim()
}

function signals(record: any) {
  return unique([
    ...list(record?.primary_effects),
    ...list(record?.effects),
    ...list(record?.mechanisms),
    ...list(record?.pathways),
    ...list(record?.topics),
  ].map(normalize).filter(Boolean))
}

function evidenceScore(record: any) {
  const evidence = normalize(record?.evidence_tier || record?.evidenceTier || record?.summary_quality || record?.profile_status)

  if (/strong|clinical|high/.test(evidence)) return 3
  if (/moderate|human/.test(evidence)) return 2
  if (/limited|traditional|early/.test(evidence)) return 1

  return 0
}

function sharedSignals(a: any, b: any) {
  const aSignals = signals(a)
  const bSet = new Set(signals(b))

  return aSignals.filter((signal) => bSet.has(signal))
}

function relationshipType(shared: string[], target: any): RecommendationGraphEdge['relationship'] {
  const mechanismText = list(target?.mechanisms).map(normalize).join(' ')
  const pathwayText = list(target?.pathways).map(normalize).join(' ')
  const effectText = [...list(target?.primary_effects), ...list(target?.effects)].map(normalize).join(' ')

  if (shared.some((item) => mechanismText.includes(item))) return 'mechanism'
  if (shared.some((item) => pathwayText.includes(item))) return 'pathway'
  if (shared.some((item) => effectText.includes(item))) return 'effect'

  return evidenceScore(target) >= 2 ? 'evidence' : 'ecosystem'
}

export function buildRecommendationEdges(source: any, candidates: any[], limit = 12): RecommendationGraphEdge[] {
  if (!source?.slug) return []

  return candidates
    .filter((candidate) => candidate?.slug && candidate.slug !== source.slug)
    .map((candidate) => {
      const shared = sharedSignals(source, candidate)
      const evidence = evidenceScore(candidate)
      const score = shared.length * 2 + evidence
      const relationship = relationshipType(shared, candidate)

      return {
        source: source.slug,
        target: candidate.slug,
        score,
        relationship,
        reasons: [
          ...shared.slice(0, 4),
          evidence >= 2 ? 'stronger evidence context' : '',
        ].filter(Boolean),
      }
    })
    .filter((edge) => edge.score > 0)
    .sort((a, b) => b.score - a.score || a.target.localeCompare(b.target))
    .slice(0, limit)
}

export function getRecommendationGraphRecords(source: any, candidates: any[], limit = 12) {
  const edges = buildRecommendationEdges(source, candidates, limit)
  const bySlug = new Map(candidates.map((candidate) => [candidate.slug, candidate]))

  return edges
    .map((edge) => ({ edge, record: bySlug.get(edge.target) }))
    .filter((item) => item.record)
}
