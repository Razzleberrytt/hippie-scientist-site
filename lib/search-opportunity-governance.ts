import {
  canStartMetadataRewrite,
  classifyQueryIntent,
  diagnoseCtr,
  routePolicyForIntent,
  shouldPreserveMetadata,
  type CtrDiagnostic,
  type MetadataExperiment,
  type QueryIntent,
} from './search-intent-routing'

export interface SearchOpportunityPage {
  url: string
  clicks: number
  impressions: number
  position: number
  ctr?: number
  actions?: string[]
}

export interface SearchOpportunityQuery {
  query: string
  clicks: number
  impressions: number
  position: number
  ctr?: number
  competingPages?: number
  pages?: string[]
  priority?: number
}

export interface SearchOpportunityReport {
  generatedAt?: string
  pages: SearchOpportunityPage[]
  queries: SearchOpportunityQuery[]
}

export type QueryIntentMap = Record<string, string>

export interface QueryGovernanceRow {
  query: string
  intent: QueryIntent
  intendedRouteFamily: string
  pageFormat: string
  intendedUrl: string | null
  observedPages: string[]
  cannibalized: boolean
  mismatch: boolean
  mismatchReason: 'single-wrong-url' | 'intended-url-absent' | null
  pageSetStability: number | null
  actions: string[]
}

export interface PageMetadataGovernanceRow extends CtrDiagnostic {
  preserveMetadata: boolean
  rewriteEligible: boolean
  actions: string[]
}

export interface SearchGovernanceArtifact {
  generatedAt: string
  sourceGeneratedAt?: string
  pages: PageMetadataGovernanceRow[]
  queries: QueryGovernanceRow[]
  summary: {
    queryCount: number
    cannibalizedQueries: number
    routingMismatches: number
    unstableQueries: number
    ctrUnderperformers: number
    metadataProtected: number
    metadataRewriteEligible: number
  }
}

function normalizePath(value: string): string {
  if (!value) return ''
  try {
    const pathname = /^https?:\/\//i.test(value) ? new URL(value).pathname : value
    const clean = pathname.split(/[?#]/)[0]
    if (!clean) return '/'
    return clean.endsWith('/') ? clean : `${clean}/`
  } catch {
    return value
  }
}

function normalizedIntentMap(map: QueryIntentMap): Map<string, string> {
  return new Map(
    Object.entries(map).map(([query, url]) => [query.trim().toLowerCase(), normalizePath(url)]),
  )
}

function pageSetStability(current: string[], previous: string[] | undefined): number | null {
  if (!previous) return null
  const a = new Set(current.map(normalizePath).filter(Boolean))
  const b = new Set(previous.map(normalizePath).filter(Boolean))
  const union = new Set([...a, ...b])
  if (union.size === 0) return 1
  const intersection = [...a].filter((value) => b.has(value)).length
  return Number((intersection / union.size).toFixed(3))
}

export function buildSearchGovernanceArtifact(input: {
  current: SearchOpportunityReport
  previous?: SearchOpportunityReport
  intentMap?: QueryIntentMap
  experiments?: MetadataExperiment[]
  generatedAt?: string
}): SearchGovernanceArtifact {
  const experiments = input.experiments ?? []
  const intentMap = normalizedIntentMap(input.intentMap ?? {})
  const previousQueries = new Map(
    (input.previous?.queries ?? []).map((row) => [row.query.trim().toLowerCase(), row]),
  )

  const pages = input.current.pages.map((page): PageMetadataGovernanceRow => {
    const diagnostic = diagnoseCtr({
      url: normalizePath(page.url),
      impressions: page.impressions,
      clicks: page.clicks,
      position: page.position,
    })
    const preserveMetadata = shouldPreserveMetadata(experiments, diagnostic.url)
    const rewriteEligible = canStartMetadataRewrite(diagnostic, experiments)
    const actions: string[] = []
    if (preserveMetadata) actions.push('preserve-winning-or-running-metadata')
    else if (rewriteEligible) actions.push('eligible-for-measured-metadata-rewrite')
    else if (diagnostic.underperforming) actions.push('underperforming-but-not-rewrite-eligible')
    else actions.push('preserve-current-metadata')

    return { ...diagnostic, preserveMetadata, rewriteEligible, actions }
  })

  const queries = input.current.queries.map((row): QueryGovernanceRow => {
    const queryKey = row.query.trim().toLowerCase()
    const intent = classifyQueryIntent(row.query)
    const routePolicy = routePolicyForIntent(intent)
    const intendedUrl = intentMap.get(queryKey) ?? null
    const observedPages = [...new Set((row.pages ?? []).map(normalizePath).filter(Boolean))]
    const cannibalized = observedPages.length > 1 || (row.competingPages ?? 0) > 1
    let mismatchReason: QueryGovernanceRow['mismatchReason'] = null

    if (intendedUrl && observedPages.length === 1 && observedPages[0] !== intendedUrl) {
      mismatchReason = 'single-wrong-url'
    } else if (intendedUrl && observedPages.length > 0 && !observedPages.includes(intendedUrl)) {
      mismatchReason = 'intended-url-absent'
    }

    const stability = pageSetStability(
      observedPages,
      previousQueries.get(queryKey)?.pages,
    )
    const actions: string[] = []
    if (mismatchReason) actions.push('align-internal-links-canonical-and-content-intent')
    if (cannibalized) actions.push('differentiate-or-consolidate-competing-pages')
    if (stability !== null && stability < 0.7) actions.push('query-to-page-instability-after-release')
    if (!actions.length) actions.push('preserve-current-routing')

    return {
      query: row.query,
      intent,
      intendedRouteFamily: routePolicy.routeFamily,
      pageFormat: routePolicy.pageFormat,
      intendedUrl,
      observedPages,
      cannibalized,
      mismatch: mismatchReason !== null,
      mismatchReason,
      pageSetStability: stability,
      actions,
    }
  })

  return {
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    sourceGeneratedAt: input.current.generatedAt,
    pages,
    queries,
    summary: {
      queryCount: queries.length,
      cannibalizedQueries: queries.filter((row) => row.cannibalized).length,
      routingMismatches: queries.filter((row) => row.mismatch).length,
      unstableQueries: queries.filter((row) => row.pageSetStability !== null && row.pageSetStability < 0.7).length,
      ctrUnderperformers: pages.filter((row) => row.underperforming).length,
      metadataProtected: pages.filter((row) => row.preserveMetadata).length,
      metadataRewriteEligible: pages.filter((row) => row.rewriteEligible).length,
    },
  }
}

export function renderSearchGovernanceMarkdown(report: SearchGovernanceArtifact): string {
  const lines = [
    '# Search Intent, Routing & CTR Governance',
    '',
    `Generated: ${report.generatedAt}`,
    report.sourceGeneratedAt ? `Source Search Console report: ${report.sourceGeneratedAt}` : '',
    '',
    '## Summary',
    '',
    `- Queries evaluated: **${report.summary.queryCount}**`,
    `- Cannibalized queries: **${report.summary.cannibalizedQueries}**`,
    `- Intended-URL mismatches: **${report.summary.routingMismatches}**`,
    `- Unstable query-to-page sets: **${report.summary.unstableQueries}**`,
    `- CTR underperformers: **${report.summary.ctrUnderperformers}**`,
    `- Protected winning/running metadata: **${report.summary.metadataProtected}**`,
    `- Metadata rewrites eligible for a measured experiment: **${report.summary.metadataRewriteEligible}**`,
    '',
    '## Query routing',
    '',
    '| Query | Intent | Intended format | Intended URL | Observed pages | Cannibalized | Stability | Action |',
    '|---|---|---|---|---|---|---:|---|',
  ].filter(Boolean)

  for (const row of report.queries) {
    lines.push(
      `| ${row.query.replace(/\|/g, '\\|')} | ${row.intent} | ${row.pageFormat.replace(/\|/g, '\\|')} | ${row.intendedUrl ?? '—'} | ${row.observedPages.join('<br>') || '—'} | ${row.cannibalized ? 'yes' : 'no'} | ${row.pageSetStability === null ? '—' : row.pageSetStability.toFixed(2)} | ${row.actions.join(', ')} |`,
    )
  }

  lines.push(
    '',
    '## CTR / metadata governance',
    '',
    '| URL | Impressions | Position | Actual CTR | Expected CTR | Gap | Protected | Rewrite eligible |',
    '|---|---:|---:|---:|---:|---:|---|---|',
  )

  for (const row of report.pages) {
    lines.push(
      `| ${row.url} | ${row.impressions.toLocaleString()} | ${row.position.toFixed(1)} | ${(row.actualCtr * 100).toFixed(2)}% | ${(row.expectedCtr * 100).toFixed(2)}% | ${(row.gap * 100).toFixed(2)} pts | ${row.preserveMetadata ? 'yes' : 'no'} | ${row.rewriteEligible ? 'yes' : 'no'} |`,
    )
  }

  lines.push(
    '',
    'Routing mismatches are only asserted when the Search Console observation is unambiguous: a single wrong URL wins, or the intended URL is absent from the observed set. Multi-URL queries are flagged as cannibalized without inventing a preferred-page distribution that the source report does not contain.',
    '',
  )

  return lines.join('\n')
}
