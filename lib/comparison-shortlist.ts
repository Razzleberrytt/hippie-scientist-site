import { getValidComparisonSlug } from '@/lib/comparison-utils'
import { isSameComparisonIdentity } from '@/lib/comparison-identity-groups'
import type { RelatedBotanicalCardPerformanceRow } from '@/lib/atlasAnalyticsReport'
import { scoreRelatedBotanical, type RelatedBotanicalRecord, type RelatedBotanicalReason } from '@/lib/related-botanicals'

export type ComparisonIntentSignal = {
  label: string
  score: number
}

export type ComparisonBehaviorSignal = {
  label: string
  score: number
}

export type ComparisonShortlistRow = {
  a: RelatedBotanicalRecord
  b: RelatedBotanicalRecord
  relationshipScore: number
  scientificPriorityScore: number
  editorialIntentScore: number
  observedBehaviorScore: number
  priorityScore: number
  chemistrySupported: boolean
  sharedSpecificEffects: string[]
  evidenceTier: number
  evidenceLabel: string
  intentSignals: ComparisonIntentSignal[]
  behaviorSignals: ComparisonBehaviorSignal[]
  observedBehavior: {
    impressions: number
    clicks: number
    ctr: number
    deepExplorationRate: number
  }
  reasons: RelatedBotanicalReason[]
}

const GENERIC_EFFECTS = new Set(['antioxidant', 'tonic'])
const RECOGNIZABLE_DECISION_COMPOUNDS = new Set([
  'berberine',
  'caffeine',
  'carvacrol',
  'curcumin',
  'ginsenoside rb1',
  'ginsenoside rg1',
  'melatonin',
  'theobromine',
  'thymol',
])

function normalize(value = '') {
  return value
    .trim()
    .toLowerCase()
    .replace(/[()]/g, ' ')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokens(value = '') {
  return normalize(value).split(' ').filter(Boolean)
}

export function evidenceTier(value = '') {
  const text = normalize(value)
  if (!text || text === 'unclassified' || text === 'unknown') return 0
  if (/strong|high|robust|well supported/.test(text)) return 3
  if (/moderate|medium|mixed/.test(text)) return 2
  if (/limited|low|preliminary|emerging|traditional/.test(text)) return 1
  return 1
}

function pairKey(a: string, b: string) {
  return [a, b].sort().join('::')
}

function containsIdentityName(container: string, candidate: string) {
  if (!container || !candidate) return false
  const containerTokens = tokens(container)
  const candidateTokens = tokens(candidate)
  if (candidateTokens.length < 2) return false
  return candidateTokens.every((token) => containerTokens.includes(token))
}

function isGenusVsSpeciesName(aName: string, bName: string) {
  const aTokens = tokens(aName)
  const bTokens = tokens(bName)
  if (aTokens.length === 1 && bTokens.length >= 2 && aTokens[0] === bTokens[0]) return true
  if (bTokens.length === 1 && aTokens.length >= 2 && bTokens[0] === aTokens[0]) return true
  return false
}

export function isAliasPair(a: RelatedBotanicalRecord, b: RelatedBotanicalRecord) {
  if (isSameComparisonIdentity(a.slug, b.slug)) return true

  const aName = normalize(a.name)
  const bName = normalize(b.name)
  const aScientific = normalize(a.scientificName)
  const bScientific = normalize(b.scientificName)

  if (aName && aName === bName) return true
  if (aScientific && bScientific && aScientific === bScientific) return true
  if (aScientific && aScientific === bName) return true
  if (bScientific && bScientific === aName) return true

  if (isGenusVsSpeciesName(aName, bName)) return true
  if (containsIdentityName(a.name, bScientific || b.name) && tokens(bScientific || b.name).length >= 2) return true
  if (containsIdentityName(b.name, aScientific || a.name) && tokens(aScientific || a.name).length >= 2) return true

  return false
}

function sharedNormalized(left: string[] = [], right: string[] = []) {
  const rightSet = new Set(right.map(normalize).filter(Boolean))
  return left.map((value) => ({ normalized: normalize(value), display: value }))
    .filter(({ normalized }) => normalized && rightSet.has(normalized))
}

export function scoreComparisonIntent(
  a: RelatedBotanicalRecord,
  b: RelatedBotanicalRecord,
  chemistrySupported: boolean,
  sharedSpecificEffects: string[],
): { score: number; signals: ComparisonIntentSignal[] } {
  const signals: ComparisonIntentSignal[] = []

  if (sharedSpecificEffects.length) {
    signals.push({
      label: `Shared user goal (${sharedSpecificEffects.slice(0, 3).join(', ')})`,
      score: Math.min(sharedSpecificEffects.length, 3) * 2,
    })
  }

  const recognizableCompounds = sharedNormalized(a.compounds, b.compounds)
    .filter(({ normalized }) => RECOGNIZABLE_DECISION_COMPOUNDS.has(normalized))
  if (recognizableCompounds.length) {
    signals.push({
      label: `Recognizable shared compound (${recognizableCompounds.slice(0, 2).map(({ display }) => display).join(', ')})`,
      score: Math.min(recognizableCompounds.length, 2) * 2,
    })
  }

  const bothHaveSpecificEffects = (a.explicitEffects ?? a.effects).some((value) => !GENERIC_EFFECTS.has(normalize(value)))
    && (b.explicitEffects ?? b.effects).some((value) => !GENERIC_EFFECTS.has(normalize(value)))
  if (bothHaveSpecificEffects && sharedSpecificEffects.length) {
    signals.push({ label: 'Both records have user-facing effect context', score: 1 })
  }

  if (chemistrySupported && sharedSpecificEffects.length === 0) {
    signals.push({ label: 'Chemistry-only editorial penalty', score: -4 })
  }

  const score = signals.reduce((sum, signal) => sum + signal.score, 0)
  return { score, signals }
}

export function scoreObservedComparisonBehavior(
  aSlug: string,
  bSlug: string,
  rows: RelatedBotanicalCardPerformanceRow[] = [],
): {
  score: number
  signals: ComparisonBehaviorSignal[]
  impressions: number
  clicks: number
  ctr: number
  deepExplorationRate: number
} {
  const pairRows = rows.filter((row) =>
    (row.sourceSlug === aSlug && row.targetSlug === bSlug)
    || (row.sourceSlug === bSlug && row.targetSlug === aSlug),
  )
  if (!pairRows.length) {
    return { score: 0, signals: [], impressions: 0, clicks: 0, ctr: 0, deepExplorationRate: 0 }
  }

  const impressions = pairRows.reduce((sum, row) => sum + row.impressions, 0)
  const clicks = pairRows.reduce((sum, row) => sum + row.clicks, 0)
  const ctr = impressions ? clicks / impressions : 0
  const deepClicks = pairRows.reduce((sum, row) => sum + row.deepExplorationRate * row.clicks, 0)
  const deepExplorationRate = clicks ? deepClicks / clicks : 0

  // Shrink low-sample CTR toward zero so one lucky click cannot dominate the queue.
  const confidence = impressions / (impressions + 8)
  const demandScore = confidence * ctr * 8
  const depthScore = confidence * deepExplorationRate * 3
  const clickScore = Math.min(clicks, 4) * 0.75
  const exposureScore = Math.min(Math.log2(impressions + 1), 3) * 0.25
  const score = demandScore + depthScore + clickScore + exposureScore

  const signals: ComparisonBehaviorSignal[] = []
  signals.push({
    label: `Observed related-card demand (${clicks}/${impressions} clicks, ${Math.round(ctr * 100)}% CTR)`,
    score: Number((demandScore + clickScore + exposureScore).toFixed(4)),
  })
  if (clicks > 0) {
    signals.push({
      label: `Post-click research depth (${Math.round(deepExplorationRate * 100)}% reached depth 3+)`,
      score: Number(depthScore.toFixed(4)),
    })
  }

  return {
    score: Number(score.toFixed(4)),
    signals,
    impressions,
    clicks,
    ctr,
    deepExplorationRate,
  }
}

export function buildComparisonShortlist(
  records: RelatedBotanicalRecord[],
  limit = 30,
  behaviorRows: RelatedBotanicalCardPerformanceRow[] = [],
) {
  const seen = new Set<string>()
  const rows: ComparisonShortlistRow[] = []

  for (const a of records) {
    for (const b of records) {
      if (a.slug === b.slug || isAliasPair(a, b)) continue
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
      const scientificPriorityScore = match.score
        + (chemistrySupported ? 4 : 0)
        + tier * 2
        + Math.min(sharedSpecificEffects.length, 3)
      const intent = scoreComparisonIntent(a, b, chemistrySupported, sharedSpecificEffects)
      const behavior = scoreObservedComparisonBehavior(a.slug, b.slug, behaviorRows)
      const priorityScore = scientificPriorityScore + intent.score + behavior.score

      rows.push({
        a,
        b,
        relationshipScore: match.score,
        scientificPriorityScore: Number(scientificPriorityScore.toFixed(4)),
        editorialIntentScore: Number(intent.score.toFixed(4)),
        observedBehaviorScore: behavior.score,
        priorityScore: Number(priorityScore.toFixed(4)),
        chemistrySupported,
        sharedSpecificEffects,
        evidenceTier: tier,
        evidenceLabel: tier === 3 ? 'strong' : tier === 2 ? 'moderate' : tier === 1 ? 'limited' : 'unclassified',
        intentSignals: intent.signals,
        behaviorSignals: behavior.signals,
        observedBehavior: {
          impressions: behavior.impressions,
          clicks: behavior.clicks,
          ctr: behavior.ctr,
          deepExplorationRate: behavior.deepExplorationRate,
        },
        reasons: match.reasons,
      })
    }
  }

  return rows
    .sort((x, y) => y.priorityScore - x.priorityScore
      || y.observedBehaviorScore - x.observedBehaviorScore
      || y.editorialIntentScore - x.editorialIntentScore
      || y.scientificPriorityScore - x.scientificPriorityScore
      || y.relationshipScore - x.relationshipScore
      || x.a.name.localeCompare(y.a.name)
      || x.b.name.localeCompare(y.b.name))
    .slice(0, Math.max(0, limit))
}
