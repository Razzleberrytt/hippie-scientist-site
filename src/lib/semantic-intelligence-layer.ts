import { list, text, unique } from '@/lib/display-utils'
import { mechanismEcosystems } from '@/lib/mechanism-ecosystems'
import { buildAdaptiveTraversal } from '@/lib/adaptive-semantic-traversal'

export type SemanticIntelligenceSignal = {
  label: string
  score: number
  reason: string
  type: 'evidence' | 'mechanism' | 'ecosystem' | 'continuity' | 'diversity'
}

export type SemanticIntelligenceReport = {
  totalScore: number
  priority: 'high' | 'moderate' | 'exploratory'
  signals: SemanticIntelligenceSignal[]
  recommendedRouteType: 'profile' | 'compare' | 'stack' | 'ecosystem' | 'best-for'
}

function normalize(value: unknown) {
  return text(value).toLowerCase().trim()
}

function collectSignals(record: any) {
  return unique([
    record?.slug,
    record?.name,
    record?.displayName,
    record?.summary,
    ...list(record?.primary_effects),
    ...list(record?.effects),
    ...list(record?.mechanisms),
    ...list(record?.pathways),
    ...list(record?.topics),
  ].map(normalize).filter(Boolean))
}

function evidenceScore(record: any): SemanticIntelligenceSignal {
  const evidence = normalize(record?.evidence_tier || record?.evidenceTier || record?.summary_quality || record?.profile_status)

  if (/strong|clinical|human|high|complete/.test(evidence)) {
    return {
      label: 'Evidence maturity',
      score: 8,
      reason: 'Profile contains stronger evidence or maturity signals.',
      type: 'evidence',
    }
  }

  if (/moderate|mixed|limited|traditional/.test(evidence)) {
    return {
      label: 'Evidence context',
      score: 5,
      reason: 'Profile contains usable but more cautious evidence signals.',
      type: 'evidence',
    }
  }

  return {
    label: 'Exploratory evidence',
    score: 2,
    reason: 'Profile should be treated as exploratory until evidence context improves.',
    type: 'evidence',
  }
}

function mechanismScore(record: any): SemanticIntelligenceSignal {
  const mechanisms = unique([
    ...list(record?.mechanisms),
    ...list(record?.pathways),
    ...list(record?.primary_effects),
  ].map(normalize).filter(Boolean))

  return {
    label: 'Mechanism density',
    score: Math.min(10, mechanisms.length * 2),
    reason: mechanisms.length >= 4
      ? 'Profile has enough mapped mechanism/pathway signals for stronger semantic traversal.'
      : 'Profile has limited mechanism density and should be routed cautiously.',
    type: 'mechanism',
  }
}

function ecosystemScore(record: any): SemanticIntelligenceSignal {
  const recordSignals = collectSignals(record)
  const matches = mechanismEcosystems.filter((ecosystem) => {
    const ecosystemSignals = [ecosystem.slug, ecosystem.title, ...ecosystem.pathways, ...ecosystem.compounds].map(normalize)
    return recordSignals.some((signal) =>
      ecosystemSignals.some((candidate) => candidate.includes(signal) || signal.includes(candidate)),
    )
  })

  return {
    label: 'Ecosystem alignment',
    score: Math.min(10, matches.length * 3),
    reason: matches.length > 0
      ? `Connected to ${matches.length} mechanism ecosystem${matches.length === 1 ? '' : 's'}.`
      : 'No strong mechanism ecosystem alignment detected yet.',
    type: 'ecosystem',
  }
}

function diversityScore(record: any, candidates: any[]): SemanticIntelligenceSignal {
  const traversal = buildAdaptiveTraversal(record, candidates, 10)
  const types = new Set(traversal.map((item) => item.type))

  return {
    label: 'Traversal diversity',
    score: Math.min(10, types.size * 2),
    reason: types.size >= 3
      ? 'Traversal can branch across multiple semantic route types.'
      : 'Traversal is currently narrow and may benefit from broader ecosystem links.',
    type: 'diversity',
  }
}

export function buildSemanticIntelligenceReport(record: any, candidates: any[] = []): SemanticIntelligenceReport {
  const signals = [
    evidenceScore(record),
    mechanismScore(record),
    ecosystemScore(record),
    diversityScore(record, candidates),
  ]

  const totalScore = signals.reduce((sum, signal) => sum + signal.score, 0)
  const priority = totalScore >= 26 ? 'high' : totalScore >= 16 ? 'moderate' : 'exploratory'
  const strongest = signals.slice().sort((a, b) => b.score - a.score)[0]

  const recommendedRouteType: SemanticIntelligenceReport['recommendedRouteType'] =
    strongest?.type === 'ecosystem'
      ? 'ecosystem'
      : strongest?.type === 'diversity'
        ? 'compare'
        : strongest?.type === 'mechanism'
          ? 'profile'
          : 'best-for'

  return {
    totalScore,
    priority,
    signals,
    recommendedRouteType,
  }
}

export function rankSemanticCandidates(source: any, candidates: any[] = [], limit = 12) {
  return candidates
    .map((candidate) => ({
      candidate,
      report: buildSemanticIntelligenceReport(candidate, candidates.filter((item) => item?.slug !== candidate?.slug)),
      traversalScore: buildAdaptiveTraversal(source, [candidate], 1)[0]?.score || 0,
    }))
    .sort((a, b) =>
      (b.report.totalScore + b.traversalScore) - (a.report.totalScore + a.traversalScore) ||
      text(a.candidate?.name || a.candidate?.slug).localeCompare(text(b.candidate?.name || b.candidate?.slug)),
    )
    .slice(0, limit)
}
