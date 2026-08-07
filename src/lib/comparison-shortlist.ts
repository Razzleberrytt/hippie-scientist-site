import { getValidComparisonSlug } from '@/lib/comparison-utils'
import { scoreRelatedBotanical, type RelatedBotanicalRecord, type RelatedBotanicalReason } from '@/lib/related-botanicals'

export type ComparisonShortlistRow = {
  a: RelatedBotanicalRecord
  b: RelatedBotanicalRecord
  relationshipScore: number
  priorityScore: number
  chemistrySupported: boolean
  sharedSpecificEffects: string[]
  evidenceTier: number
  evidenceLabel: string
  reasons: RelatedBotanicalReason[]
}

const GENERIC_EFFECTS = new Set(['antioxidant', 'tonic'])

function normalize(value = '') {
  return value.trim().toLowerCase()
}

export function evidenceTier(value = '') {
  const text = normalize(value)
  if (!text || text === 'unclassified' || text === 'unknown') return 0
  if (/strong|high|robust|well[- ]?supported/.test(text)) return 3
  if (/moderate|medium|mixed/.test(text)) return 2
  if (/limited|low|preliminary|emerging|traditional/.test(text)) return 1
  return 1
}

function pairKey(a: string, b: string) {
  return [a, b].sort().join('::')
}

export function buildComparisonShortlist(records: RelatedBotanicalRecord[], limit = 30) {
  const seen = new Set<string>()
  const rows: ComparisonShortlistRow[] = []

  for (const a of records) {
    for (const b of records) {
      if (a.slug === b.slug) continue
      const key = pairKey(a.slug, b.slug)
      if (seen.has(key)) continue
      seen.add(key)

      if (getValidComparisonSlug(a.slug, b.slug)) continue
      const match = scoreRelatedBotanical(a, b)
      if (!match) continue

      const chemistrySupported = match.reasons.some((reason) => reason.type === 'compound' || reason.type === 'compound-class')
      const sharedSpecificEffects = match.reasons
        .find((reason) => reason.type === 'explicit-effect')?.values
        .filter((value) => !GENERIC_EFFECTS.has(normalize(value))) ?? []
      const tier = Math.min(evidenceTier(a.evidence), evidenceTier(b.evidence))
      const priorityScore = match.score
        + (chemistrySupported ? 4 : 0)
        + tier * 2
        + Math.min(sharedSpecificEffects.length, 3)

      rows.push({
        a,
        b,
        relationshipScore: match.score,
        priorityScore: Number(priorityScore.toFixed(4)),
        chemistrySupported,
        sharedSpecificEffects,
        evidenceTier: tier,
        evidenceLabel: tier === 3 ? 'strong' : tier === 2 ? 'moderate' : tier === 1 ? 'limited' : 'unclassified',
        reasons: match.reasons,
      })
    }
  }

  return rows
    .sort((x, y) => y.priorityScore - x.priorityScore
      || y.relationshipScore - x.relationshipScore
      || x.a.name.localeCompare(y.a.name)
      || x.b.name.localeCompare(y.b.name))
    .slice(0, Math.max(0, limit))
}
