export const FORECAST_METRICS = [
  'impressions',
  'clicks',
  'averagePosition',
  'indexedUrls',
  'crawledNotIndexedUrls',
  'affiliateClicks',
  'emailSignups',
  'revenue',
  'referringDomains',
  'aiCitations',
  'conversionRate',
] as const

export type ForecastMetric = (typeof FORECAST_METRICS)[number]

export interface ClusterMetrics {
  cluster: string
  impressions: number
  clicks: number
  averagePosition: number
  indexedUrls: number
  crawledNotIndexedUrls: number
  affiliateClicks: number
  emailSignups: number
  revenue: number
  referringDomains: number
  aiCitations: number
  conversionRate: number
}

export interface ClusterForecastRow extends ClusterMetrics {
  previous?: ClusterMetrics
  deltas: Partial<Record<ForecastMetric, number>>
  momentumScore: number
}

function safePctChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 1
  return (current - previous) / Math.abs(previous)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function buildClusterForecast(
  current: ClusterMetrics[],
  previous: ClusterMetrics[] = [],
): ClusterForecastRow[] {
  const previousByCluster = new Map(previous.map((row) => [row.cluster, row]))

  return current
    .map((row) => {
      const prior = previousByCluster.get(row.cluster)
      const deltas: Partial<Record<ForecastMetric, number>> = {}

      if (prior) {
        for (const metric of FORECAST_METRICS) {
          if (metric === 'averagePosition') {
            // Lower average position is better, so invert the sign for momentum.
            deltas[metric] = prior.averagePosition - row.averagePosition
          } else if (metric === 'conversionRate') {
            deltas[metric] = row.conversionRate - prior.conversionRate
          } else {
            deltas[metric] = safePctChange(row[metric], prior[metric])
          }
        }
      }

      const impressionMomentum = prior ? safePctChange(row.impressions, prior.impressions) : 0
      const clickMomentum = prior ? safePctChange(row.clicks, prior.clicks) : 0
      const revenueMomentum = prior ? safePctChange(row.revenue, prior.revenue) : 0
      const citationMomentum = prior ? safePctChange(row.aiCitations, prior.aiCitations) : 0
      const backlinkMomentum = prior ? safePctChange(row.referringDomains, prior.referringDomains) : 0
      const positionMomentum = prior ? clamp((prior.averagePosition - row.averagePosition) / 10, -1, 1) : 0

      const momentumScore =
        impressionMomentum * 0.2 +
        clickMomentum * 0.2 +
        revenueMomentum * 0.2 +
        citationMomentum * 0.15 +
        backlinkMomentum * 0.1 +
        positionMomentum * 0.15

      return {
        ...row,
        previous: prior,
        deltas,
        momentumScore: Number(momentumScore.toFixed(4)),
      }
    })
    .sort((a, b) => b.momentumScore - a.momentumScore || b.impressions - a.impressions)
}

export interface BacklogTaskInput {
  id: string | number
  title: string
  expectedImpact?: number
  effort?: number
  cluster?: string
  rationale?: string
}

export interface ScoredBacklogTask extends BacklogTaskInput {
  expectedImpact: number
  effort: number
  scoreCompleteness: 'complete' | 'missing-impact' | 'missing-effort' | 'missing-both'
}

function normalizeTenPointScore(value: number | undefined): number | undefined {
  if (value === undefined || !Number.isFinite(value)) return undefined
  return Number(clamp(value, 1, 10).toFixed(1))
}

export function scoreBacklogTask(task: BacklogTaskInput): ScoredBacklogTask {
  const expectedImpact = normalizeTenPointScore(task.expectedImpact)
  const effort = normalizeTenPointScore(task.effort)

  let scoreCompleteness: ScoredBacklogTask['scoreCompleteness'] = 'complete'
  if (expectedImpact === undefined && effort === undefined) scoreCompleteness = 'missing-both'
  else if (expectedImpact === undefined) scoreCompleteness = 'missing-impact'
  else if (effort === undefined) scoreCompleteness = 'missing-effort'

  return {
    ...task,
    expectedImpact: expectedImpact ?? 1,
    effort: effort ?? 10,
    scoreCompleteness,
  }
}

export function scoreBacklogTasks(tasks: BacklogTaskInput[]): ScoredBacklogTask[] {
  return tasks.map(scoreBacklogTask)
}

export interface ForecastDashboard {
  generatedAt: string
  clusters: ClusterForecastRow[]
  totals: Omit<ClusterMetrics, 'cluster' | 'averagePosition' | 'conversionRate'> & {
    averagePosition: number
    conversionRate: number
  }
}

export function buildForecastDashboard(
  current: ClusterMetrics[],
  previous: ClusterMetrics[] = [],
  generatedAt = new Date().toISOString(),
): ForecastDashboard {
  const clusters = buildClusterForecast(current, previous)
  const totals = current.reduce(
    (acc, row) => {
      acc.impressions += row.impressions
      acc.clicks += row.clicks
      acc.indexedUrls += row.indexedUrls
      acc.crawledNotIndexedUrls += row.crawledNotIndexedUrls
      acc.affiliateClicks += row.affiliateClicks
      acc.emailSignups += row.emailSignups
      acc.revenue += row.revenue
      acc.referringDomains += row.referringDomains
      acc.aiCitations += row.aiCitations
      acc.positionWeight += row.averagePosition * row.impressions
      return acc
    },
    {
      impressions: 0,
      clicks: 0,
      indexedUrls: 0,
      crawledNotIndexedUrls: 0,
      affiliateClicks: 0,
      emailSignups: 0,
      revenue: 0,
      referringDomains: 0,
      aiCitations: 0,
      positionWeight: 0,
    },
  )

  const conversionDenominator = totals.clicks || totals.impressions
  return {
    generatedAt,
    clusters,
    totals: {
      impressions: totals.impressions,
      clicks: totals.clicks,
      averagePosition: totals.impressions ? totals.positionWeight / totals.impressions : 0,
      indexedUrls: totals.indexedUrls,
      crawledNotIndexedUrls: totals.crawledNotIndexedUrls,
      affiliateClicks: totals.affiliateClicks,
      emailSignups: totals.emailSignups,
      revenue: totals.revenue,
      referringDomains: totals.referringDomains,
      aiCitations: totals.aiCitations,
      conversionRate: conversionDenominator
        ? (totals.affiliateClicks + totals.emailSignups) / conversionDenominator
        : 0,
    },
  }
}
