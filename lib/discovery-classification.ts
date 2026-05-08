import { calculateDiscoveryScore } from '@/lib/discovery-score'
import { getEvidenceMaturity, getMechanismDepth, getProfileCompleteness } from '@/lib/semantic-trust-badges'
import { getSafetySensitivity } from '@/lib/safety-classification'

type DiscoveryGroup = {
  title: string
  description: string
  items: any[]
}

function normalize(value: any): string[] {
  if (!value) return []

  const array = Array.isArray(value) ? value : [value]

  return array
    .map(item => String(item).trim().toLowerCase())
    .filter(Boolean)
}

function overlap(a: string[], b: string[]) {
  return a.filter(item => b.includes(item)).length
}

function sortByDiscoveryScore(base: any, items: any[]) {
  return [...items].sort((a, b) => calculateDiscoveryScore(base, b) - calculateDiscoveryScore(base, a))
}

export function classifyDiscoveryGroups(base: any, relatedRecords: any[] = []): DiscoveryGroup[] {
  const baseEffects = normalize(base?.primary_effects || base?.effects)
  const baseMechanisms = normalize(base?.mechanisms)
  const basePathways = normalize(base?.pathways)
  const baseMaturity = getEvidenceMaturity(base)
  const baseCompleteness = getProfileCompleteness(base)
  const baseSafety = getSafetySensitivity(base)
  const baseMechanismDepth = getMechanismDepth(base)

  const mechanismMatches: any[] = []
  const pathwayMatches: any[] = []
  const evidenceMatches: any[] = []
  const safetyMatches: any[] = []
  const completenessMatches: any[] = []
  const contextualMatches: any[] = []

  relatedRecords.forEach(record => {
    const effects = normalize(record?.primary_effects || record?.effects)
    const mechanisms = normalize(record?.mechanisms)
    const pathways = normalize(record?.pathways)

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
  })

  const dedupe = (items: any[]) => {
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
      title: 'Research Context Profiles',
      description: 'Related profiles commonly discussed alongside overlapping mechanisms, effects, evidence patterns, or completeness signals.',
      items: dedupe(contextualMatches).slice(0, 6),
    },
  ].filter(group => group.items.length > 0)
}
