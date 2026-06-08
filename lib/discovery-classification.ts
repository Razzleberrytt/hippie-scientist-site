import { calculateDiscoveryScore } from '@/lib/discovery-score'
import { getEvidenceMaturity, getMechanismDepth, getProfileCompleteness } from '@/lib/semantic-trust-badges'
import { getSafetySensitivity } from '@/lib/safety-classification'
import { scoreSemanticRecommendation } from '@/lib/semantic-orchestration'

import type { RuntimeRecord } from '@/types/content'

type DiscoveryGroup = {
  title: string
  description: string
  items: RuntimeRecord[]
}

function normalize(value: unknown): string[] {
  if (!value) return []

  const array = Array.isArray(value) ? value : [value]

  return array
    .map(item => String(item).trim().toLowerCase())
    .filter(Boolean)
}

function overlap(a: string[], b: string[]) {
  return a.filter(item => b.includes(item)).length
}

function evidenceSensitiveAdjustment(base: RuntimeRecord, candidate: RuntimeRecord) {
  const baseMaturity = getEvidenceMaturity(base)
  const candidateMaturity = getEvidenceMaturity(candidate)
  const baseSafety = getSafetySensitivity(base)
  const candidateSafety = getSafetySensitivity(candidate)
  const baseMechanismDepth = getMechanismDepth(base)
  const candidateMechanismDepth = getMechanismDepth(candidate)
  const candidateCompleteness = getProfileCompleteness(candidate)

  let score = 0

  if (baseMaturity === 'mature') {
    if (candidateMaturity === 'mature') score += 8
    if (candidateMaturity === 'exploratory') score -= 3
  }

  if (baseMaturity === 'moderate') {
    if (candidateMaturity === 'moderate' || candidateMaturity === 'mature') score += 4
  }

  if (baseMaturity === 'exploratory') {
    if (candidateMechanismDepth !== 'light') score += 7
    if (candidateMaturity === 'mature' && baseMechanismDepth === 'light') score -= 2
    if (candidateCompleteness === 'sparse') score -= 2
  }

  if (baseSafety !== 'low') {
    if (candidateSafety !== 'low') score += 6
    if (candidateSafety === 'low') score -= 2
  }

  return score
}

function semanticOrchestrationAdjustment(base: RuntimeRecord, candidate: RuntimeRecord) {
  const scored = scoreSemanticRecommendation(base, candidate)

  return scored.score * 22 + scored.signals.authorityScore * 8 + scored.signals.discoveryScore * 10
}

function sortByDiscoveryScore(base: RuntimeRecord, items: RuntimeRecord[]) {
  return [...items].sort((a, b) => {
    const scoreB =
      calculateDiscoveryScore(base, b) +
      evidenceSensitiveAdjustment(base, b) +
      semanticOrchestrationAdjustment(base, b)

    const scoreA =
      calculateDiscoveryScore(base, a) +
      evidenceSensitiveAdjustment(base, a) +
      semanticOrchestrationAdjustment(base, a)

    if (scoreB !== scoreA) return scoreB - scoreA

    return String(a?.name || a?.slug || '').localeCompare(String(b?.name || b?.slug || ''))
  })
}

export function rankEvidenceSensitiveRelatedRecords(base: RuntimeRecord, relatedRecords: RuntimeRecord[] = [], limit = 8) {
  const seen = new Set<string>()

  return sortByDiscoveryScore(base, relatedRecords)
    .filter(record => {
      const key = `${record?.entityType || ''}:${record?.slug || record?.name || ''}`
      if (!record?.slug || seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, Math.max(0, limit))
}

export function classifyDiscoveryGroups(base: RuntimeRecord, relatedRecords: RuntimeRecord[] = []): DiscoveryGroup[] {
  const baseEffects = normalize(base?.primary_effects || base?.effects)
  const baseMechanisms = normalize(base?.mechanisms)
  const basePathways = normalize(base?.pathways)
  const baseMaturity = getEvidenceMaturity(base)
  const baseCompleteness = getProfileCompleteness(base)
  const baseSafety = getSafetySensitivity(base)
  const baseMechanismDepth = getMechanismDepth(base)

  const mechanismMatches: RuntimeRecord[] = []
  const pathwayMatches: RuntimeRecord[] = []
  const evidenceMatches: RuntimeRecord[] = []
  const safetyMatches: RuntimeRecord[] = []
  const completenessMatches: RuntimeRecord[] = []
  const contextualMatches: RuntimeRecord[] = []
  const orchestrationMatches: RuntimeRecord[] = []
  const authorityMatches: RuntimeRecord[] = []

  relatedRecords.forEach(record => {
    const effects = normalize(record?.primary_effects || record?.effects)
    const mechanisms = normalize(record?.mechanisms)
    const pathways = normalize(record?.pathways)
    const semanticScore = scoreSemanticRecommendation(base, record)

    const mechanismOverlap = overlap(baseMechanisms, mechanisms)
    const pathwayOverlap = overlap(basePathways, pathways)
    const effectOverlap = overlap(baseEffects, effects)
    const recordMaturity = getEvidenceMaturity(record)
    const recordSafety = getSafetySensitivity(record)
    const recordCompleteness = getProfileCompleteness(record)
    const recordMechanismDepth = getMechanismDepth(record)

    if (mechanismOverlap >= 2 || (baseMaturity === 'exploratory' && recordMechanismDepth !== 'light')) {
      mechanismMatches.push(record)
    }

    if (pathwayOverlap >= 1) {
      pathwayMatches.push(record)
    }

    if (recordMaturity === baseMaturity || (baseMaturity === 'mature' && recordMaturity === 'mature')) {
      evidenceMatches.push(record)
    }

    if (baseSafety !== 'low' && recordSafety !== 'low') {
      safetyMatches.push(record)
    }

    if (recordCompleteness === baseCompleteness || (baseCompleteness === 'complete' && recordCompleteness === 'complete')) {
      completenessMatches.push(record)
    }

    if (effectOverlap >= 1 || mechanismOverlap >= 1 || pathwayOverlap >= 1 || baseMechanismDepth === recordMechanismDepth) {
      contextualMatches.push(record)
    }

    if (semanticScore.score >= 0.18) {
      orchestrationMatches.push(record)
    }

    if (semanticScore.signals.authorityScore >= 0.55 || semanticScore.signals.discoveryScore >= 0.55) {
      authorityMatches.push(record)
    }
  })

  const dedupe = (items: RuntimeRecord[]) => {
    const seen = new Set()

    return sortByDiscoveryScore(base, items).filter(item => {
      if (!item?.slug || seen.has(item.slug)) return false
      seen.add(item.slug)
      return true
    })
  }

  return [
    {
      title: baseMaturity === 'exploratory' ? 'Mechanistic Neighbors' : 'Mechanistically Adjacent',
      description: baseMaturity === 'exploratory'
        ? 'Exploratory profiles are paired with records that offer richer mechanism or pathway context.'
        : 'These profiles share overlapping signaling pathways or biological-response mechanisms.',
      items: dedupe(mechanismMatches).slice(0, 4),
    },
    {
      title: 'Pathway Companions',
      description: 'Frequently explored in overlapping pathway-oriented research contexts.',
      items: dedupe(pathwayMatches).slice(0, 4),
    },
    {
      title: 'Similar Evidence Maturity',
      description: 'Profiles are grouped by comparable human-research depth, evidence maturity, and profile completeness.',
      items: dedupe([...evidenceMatches, ...completenessMatches]).slice(0, 4),
    },
    {
      title: 'Safety-Adjacent Profiles',
      description: 'Caution-sensitive profiles surface neighbors with similarly visible safety or interaction context.',
      items: dedupe(safetyMatches).slice(0, 4),
    },
    {
      title: 'Authority-Weighted Discovery',
      description: 'Profiles are ranked by shared outcomes, mechanism continuity, ecosystem density, safety calibration, and discovery score.',
      items: dedupe([...authorityMatches, ...orchestrationMatches]).slice(0, 6),
    },
    {
      title: 'Research Context Profiles',
      description: 'Related profiles commonly discussed alongside overlapping mechanisms, effects, evidence patterns, or completeness signals.',
      items: dedupe(contextualMatches).slice(0, 6),
    },
  ].filter(group => group.items.length > 0)
}
