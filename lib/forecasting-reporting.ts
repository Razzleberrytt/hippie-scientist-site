import {
  buildForecastDashboard,
  scoreBacklogTasks,
  type BacklogTaskInput,
  type ClusterMetrics,
  type ForecastDashboard,
  type ScoredBacklogTask,
} from './forecasting-dashboard'

export interface ForecastReportInput {
  current: ClusterMetrics[]
  previous?: ClusterMetrics[]
  backlog?: BacklogTaskInput[]
  generatedAt?: string
}

export interface ForecastReportArtifact {
  dashboard: ForecastDashboard
  backlog: ScoredBacklogTask[]
  scoreWarnings: string[]
}

export function buildForecastReportArtifact(input: ForecastReportInput): ForecastReportArtifact {
  const dashboard = buildForecastDashboard(
    input.current,
    input.previous ?? [],
    input.generatedAt ?? new Date().toISOString(),
  )
  const backlog = scoreBacklogTasks(input.backlog ?? [])
  const scoreWarnings = backlog
    .filter((task) => task.scoreCompleteness !== 'complete')
    .map((task) => `Task ${task.id}: ${task.scoreCompleteness}`)

  return { dashboard, backlog, scoreWarnings }
}

function number(value: number, digits = 0): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value)
}

function money(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

function percent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

export function renderForecastReportMarkdown(report: ForecastReportArtifact): string {
  const { dashboard } = report
  const lines = [
    '# Content Cluster Forecasting Dashboard',
    '',
    `Generated: ${dashboard.generatedAt}`,
    '',
    '## Cluster metrics',
    '',
    '| Cluster | Impressions | Clicks | Avg position | Indexed | Crawled-not-indexed | Affiliate clicks | Email signups | Revenue | Referring domains | AI citations | Conversion | Momentum |',
    '|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|',
  ]

  if (!dashboard.clusters.length) {
    lines.push('| _No cluster rows supplied_ | 0 | 0 | 0 | 0 | 0 | 0 | 0 | $0.00 | 0 | 0 | 0.0% | 0.00 |')
  } else {
    for (const row of dashboard.clusters) {
      lines.push(
        `| ${row.cluster.replace(/\|/g, '\\|')} | ${number(row.impressions)} | ${number(row.clicks)} | ${number(row.averagePosition, 1)} | ${number(row.indexedUrls)} | ${number(row.crawledNotIndexedUrls)} | ${number(row.affiliateClicks)} | ${number(row.emailSignups)} | ${money(row.revenue)} | ${number(row.referringDomains)} | ${number(row.aiCitations)} | ${percent(row.conversionRate)} | ${number(row.momentumScore, 2)} |`,
      )
    }
  }

  lines.push(
    '',
    '## Site totals',
    '',
    `- Impressions: **${number(dashboard.totals.impressions)}**`,
    `- Clicks: **${number(dashboard.totals.clicks)}**`,
    `- Weighted average position: **${number(dashboard.totals.averagePosition, 1)}**`,
    `- Indexed URLs: **${number(dashboard.totals.indexedUrls)}**`,
    `- Crawled-not-indexed URLs: **${number(dashboard.totals.crawledNotIndexedUrls)}**`,
    `- Affiliate clicks: **${number(dashboard.totals.affiliateClicks)}**`,
    `- Email signups: **${number(dashboard.totals.emailSignups)}**`,
    `- Revenue: **${money(dashboard.totals.revenue)}**`,
    `- Referring domains: **${number(dashboard.totals.referringDomains)}**`,
    `- AI citations: **${number(dashboard.totals.aiCitations)}**`,
    `- Conversion rate: **${percent(dashboard.totals.conversionRate)}**`,
    '',
    '## Backlog impact and effort',
    '',
    '| Task | Cluster | Expected impact (1–10) | Effort (1–10) | Score completeness |',
    '|---|---|---:|---:|---|',
  )

  if (!report.backlog.length) {
    lines.push('| _No backlog tasks supplied_ | — | — | — | — |')
  } else {
    for (const task of report.backlog) {
      lines.push(
        `| ${String(task.id)} — ${task.title.replace(/\|/g, '\\|')} | ${task.cluster ?? '—'} | ${task.expectedImpact.toFixed(1)} | ${task.effort.toFixed(1)} | ${task.scoreCompleteness} |`,
      )
    }
  }

  if (report.scoreWarnings.length) {
    lines.push(
      '',
      '> Scoring warning: missing impact/effort values are deliberately assigned conservative fallback values for display. Fill the missing fields before using these scores for implementation ordering.',
      '',
      ...report.scoreWarnings.map((warning) => `- ${warning}`),
    )
  }

  lines.push(
    '',
    'Impact and effort are recorded separately here. Confidence weighting and the `(impact × confidence) / effort` ordering formula begin at backlog items 801–803 and are intentionally not introduced by this 786–800 report.',
    '',
  )

  return lines.join('\n')
}
