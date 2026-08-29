export const QUERY_INTENTS = [
  'informational',
  'safety',
  'comparison',
  'dose',
  'timing',
  'product-quality',
  'mechanism',
  'research',
  'commercial',
] as const

export type QueryIntent = (typeof QUERY_INTENTS)[number]

export interface IntentRoutePolicy {
  routeFamily: string
  pageFormat: string
  commercialEligible: boolean
}

export const INTENT_ROUTE_POLICIES: Record<QueryIntent, IntentRoutePolicy> = {
  informational: { routeFamily: '/herbs|/compounds|/guides', pageFormat: 'answer-first profile or guide', commercialEligible: false },
  safety: { routeFamily: '/safety|/interactions', pageFormat: 'source-backed safety explainer', commercialEligible: false },
  comparison: { routeFamily: '/guides/compare', pageFormat: 'two-sided decision comparison', commercialEligible: true },
  dose: { routeFamily: '/guides', pageFormat: 'studied-dose resource', commercialEligible: true },
  timing: { routeFamily: '/guides', pageFormat: 'evidence-gated timing decision', commercialEligible: true },
  'product-quality': { routeFamily: '/guides/best', pageFormat: 'buying-quality methodology guide', commercialEligible: true },
  mechanism: { routeFamily: '/compounds|/evidence', pageFormat: 'mechanism research reference', commercialEligible: false },
  research: { routeFamily: '/evidence|/learn', pageFormat: 'research synthesis or dataset', commercialEligible: false },
  commercial: { routeFamily: '/guides/best|/guides/compare', pageFormat: 'evidence-first commercial decision page', commercialEligible: true },
}

const INTENT_RULES: Array<{ intent: QueryIntent; re: RegExp }> = [
  { intent: 'comparison', re: /\b(vs|versus|compare|comparison|better than)\b/i },
  { intent: 'safety', re: /\b(safe|safety|side effects?|interaction|contraindication|risk|together)\b/i },
  { intent: 'dose', re: /\b(dose|dosage|how much|\d+\s?(?:mg|g|mcg))\b/i },
  { intent: 'timing', re: /\b(when to take|morning|night|before bed|with food|empty stomach|how long.*work)\b/i },
  { intent: 'product-quality', re: /\b(best form|best extract|brand|third party|coa|standardized|glycinate|citrate|threonate)\b/i },
  { intent: 'mechanism', re: /\b(mechanism|pathway|receptor|nf-?κb|ampk|how does .* work)\b/i },
  { intent: 'research', re: /\b(study|studies|trial|meta-analysis|systematic review|evidence grade|research)\b/i },
  { intent: 'commercial', re: /\b(best supplement|buy|price|product|review|recommended brand)\b/i },
]

export function classifyQueryIntent(query: string): QueryIntent {
  for (const rule of INTENT_RULES) {
    if (rule.re.test(query)) return rule.intent
  }
  return 'informational'
}

export function routePolicyForIntent(intent: QueryIntent): IntentRoutePolicy {
  return INTENT_ROUTE_POLICIES[intent]
}

export interface QueryPageObservation {
  query: string
  intendedUrl: string
  observedUrls: Array<{ url: string; impressions: number; clicks?: number; position?: number }>
  releaseId?: string
}

export interface QueryRoutingDiagnostic {
  query: string
  intendedUrl: string
  preferredUrl: string | null
  stability: number
  cannibalized: boolean
  mismatch: boolean
  actions: string[]
}

export function diagnoseQueryRouting(observation: QueryPageObservation): QueryRoutingDiagnostic {
  const totalImpressions = observation.observedUrls.reduce((sum, row) => sum + row.impressions, 0)
  const ranked = [...observation.observedUrls].sort((a, b) => b.impressions - a.impressions)
  const preferred = ranked[0] ?? null
  const preferredUrl = preferred?.url ?? null
  const stability = totalImpressions > 0 && preferred ? preferred.impressions / totalImpressions : 0
  const meaningfulUrls = observation.observedUrls.filter((row) => row.impressions >= Math.max(5, totalImpressions * 0.15))
  const cannibalized = meaningfulUrls.length > 1
  const mismatch = Boolean(preferredUrl && preferredUrl !== observation.intendedUrl)
  const actions: string[] = []

  if (mismatch) actions.push('align-internal-links-with-intended-url', 'review-content-intent-and-canonical')
  if (cannibalized) actions.push('consolidate-overlapping-intent-or-differentiate-pages')
  if (stability < 0.7 && totalImpressions >= 20) actions.push('monitor-query-to-page-instability')
  if (!actions.length) actions.push('preserve-current-routing')

  return {
    query: observation.query,
    intendedUrl: observation.intendedUrl,
    preferredUrl,
    stability: Number(stability.toFixed(3)),
    cannibalized,
    mismatch,
    actions,
  }
}

export interface ReleaseQuerySnapshot {
  releaseId: string
  diagnostics: QueryRoutingDiagnostic[]
}

export interface CannibalizationChange {
  query: string
  before: boolean
  after: boolean
  introduced: boolean
  resolved: boolean
}

export function compareCannibalization(
  before: ReleaseQuerySnapshot,
  after: ReleaseQuerySnapshot,
): CannibalizationChange[] {
  const beforeByQuery = new Map(before.diagnostics.map((item) => [item.query.toLowerCase(), item]))
  return after.diagnostics.map((current) => {
    const prior = beforeByQuery.get(current.query.toLowerCase())
    const beforeValue = prior?.cannibalized ?? false
    return {
      query: current.query,
      before: beforeValue,
      after: current.cannibalized,
      introduced: !beforeValue && current.cannibalized,
      resolved: beforeValue && !current.cannibalized,
    }
  })
}

export function expectedCtrAtPosition(position: number): number {
  if (!Number.isFinite(position) || position <= 0) return 0
  const anchors: Array<[number, number]> = [
    [1, 0.28], [2, 0.15], [3, 0.1], [4, 0.07], [5, 0.055], [6, 0.045], [7, 0.037], [8, 0.031], [9, 0.027], [10, 0.024], [15, 0.014], [20, 0.009],
  ]
  if (position >= 20) return 0.008
  const upperIndex = anchors.findIndex(([rank]) => rank >= position)
  if (upperIndex <= 0) return anchors[0][1]
  const [upperRank, upperCtr] = anchors[upperIndex]
  const [lowerRank, lowerCtr] = anchors[upperIndex - 1]
  if (upperRank === position) return upperCtr
  const share = (position - lowerRank) / (upperRank - lowerRank)
  return lowerCtr + (upperCtr - lowerCtr) * share
}

export interface CtrObservation {
  url: string
  impressions: number
  clicks: number
  position: number
}

export interface CtrDiagnostic extends CtrObservation {
  actualCtr: number
  expectedCtr: number
  gap: number
  underperforming: boolean
  rewriteEligible: boolean
}

export function diagnoseCtr(observation: CtrObservation): CtrDiagnostic {
  const actualCtr = observation.impressions > 0 ? observation.clicks / observation.impressions : 0
  const expectedCtr = expectedCtrAtPosition(observation.position)
  const gap = expectedCtr - actualCtr
  const underperforming = observation.impressions >= 50 && gap >= 0.01
  return {
    ...observation,
    actualCtr,
    expectedCtr,
    gap,
    underperforming,
    rewriteEligible: underperforming,
  }
}

export interface MetadataExperiment {
  id: string
  url: string
  startedAt: string
  titleBefore: string
  titleAfter: string
  descriptionBefore?: string
  descriptionAfter?: string
  baselineCtr: number
  resultCtr?: number
  status: 'running' | 'won' | 'lost' | 'inconclusive'
}

export function shouldPreserveMetadata(experiments: MetadataExperiment[], url: string): boolean {
  const latest = [...experiments]
    .filter((experiment) => experiment.url === url)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0]
  return latest?.status === 'won' || latest?.status === 'running'
}

export function canStartMetadataRewrite(
  ctr: CtrDiagnostic,
  experiments: MetadataExperiment[],
): boolean {
  return ctr.rewriteEligible && !shouldPreserveMetadata(experiments, ctr.url)
}
