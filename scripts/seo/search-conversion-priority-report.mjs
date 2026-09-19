#!/usr/bin/env node
/**
 * Build a citation -> search -> click conversion queue.
 *
 * This intentionally does NOT treat AI citations as traffic, rankings, clicks,
 * revenue, or causal lift. Search opportunity remains the primary signal.
 * Fresh citation telemetry may only add a bounded confidence/authority boost
 * to pages that already show measurable search opportunity.
 *
 * Inputs:
 *   ops/reports/search-opportunities.json
 *   config/ai-citation-swarm-priorities.json
 *   config/search-conversion-priorities.json
 *
 * Outputs:
 *   ops/reports/search-conversion-priorities.json
 *   ops/reports/search-conversion-priorities.md
 */

import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const SEARCH_REPORT = path.join(ROOT, 'ops', 'reports', 'search-opportunities.json')
const AI_SIGNALS = path.join(ROOT, 'config', 'ai-citation-swarm-priorities.json')
const CONTROL = path.join(ROOT, 'config', 'search-conversion-priorities.json')
const OUT_JSON = path.join(ROOT, 'ops', 'reports', 'search-conversion-priorities.json')
const OUT_MD = path.join(ROOT, 'ops', 'reports', 'search-conversion-priorities.md')

function readJson(file, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return fallback
  }
}

function normalizePath(input) {
  if (!input) return ''
  try {
    const value = String(input)
    const pathname = value.startsWith('http') ? new URL(value).pathname : value
    const clean = pathname.split('?')[0].split('#')[0]
    if (clean === '/') return '/'
    return clean.endsWith('/') ? clean : clean + '/'
  } catch {
    return String(input)
  }
}

function ageDays(label) {
  const parsed = Date.parse(label)
  if (!Number.isFinite(parsed)) return null
  return Math.floor((Date.now() - parsed) / 86400000)
}

function aiSignalsActive(signals) {
  const maxAge = Number(signals?.freshnessPolicy?.maxAgeDays)
  const age = ageDays(signals?.snapshotLabel)
  return Boolean(
    signals &&
    Array.isArray(signals.defendUrls) &&
    Number.isFinite(maxAge) &&
    age !== null &&
    age >= 0 &&
    age <= maxAge
  )
}

function citationMap(signals) {
  const out = new Map()
  if (!aiSignalsActive(signals)) return out
  for (const row of signals.defendUrls ?? []) {
    const url = normalizePath(row.url)
    if (!url) continue
    out.set(url, {
      citations: Number(row.citations ?? 0),
      citationPriority: Number(row.priority ?? 0),
    })
  }
  return out
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function scoreRow(page, citation) {
  const impressions = Number(page.impressions ?? 0)
  const ctrUpside = Number(page.ctrUpsideClicks ?? 0)
  const rankUpside = Number(page.rankUpsideClicks ?? 0)
  const totalUpside = Number(page.totalUpsideClicks ?? 0)
  const citations = Number(citation?.citations ?? 0)

  // Search opportunity is the base. Citation authority can boost the score by
  // at most 35%; it can never create an opportunity when search upside is zero.
  const searchBase =
    totalUpside * 4 +
    ctrUpside * 2 +
    rankUpside +
    Math.log1p(impressions) * 2

  if (searchBase <= 0) return 0

  const citationBoost = citations > 0
    ? clamp(Math.log10(citations + 1) / 10, 0, 0.35)
    : 0

  return Number((searchBase * (1 + citationBoost)).toFixed(2))
}

function classify(page, citation) {
  const actions = new Set(page.actions ?? [])
  const cited = Number(citation?.citations ?? 0) > 0

  if (cited && actions.has('rewrite-title-and-meta')) return 'citation-to-ctr'
  if (cited && actions.has('striking-distance')) return 'citation-to-rank'
  if (cited && actions.has('needs-substantive-upgrade')) return 'citation-to-content-upgrade'
  if (actions.has('rewrite-title-and-meta')) return 'search-to-ctr'
  if (actions.has('striking-distance')) return 'search-to-rank'
  if (actions.has('needs-substantive-upgrade')) return 'search-to-content-upgrade'
  if (cited) return 'citation-defend-hold'
  return 'hold'
}

function nextAction(segment) {
  switch (segment) {
    case 'citation-to-ctr':
    case 'search-to-ctr':
      return 'Run a metadata experiment: align title/snippet to observed query intent; preserve claims, safety and canonical ownership.'
    case 'citation-to-rank':
    case 'search-to-rank':
      return 'Strengthen query-intent coverage and internal links before creating net-new content.'
    case 'citation-to-content-upgrade':
    case 'search-to-content-upgrade':
      return 'Perform a substantive evidence/content refresh targeted to observed query gaps; do not thin-split the topic.'
    case 'citation-defend-hold':
      return 'Protect the proven citation asset; avoid broad rewrites unless new search evidence justifies one.'
    default:
      return 'Hold until page-level search evidence creates a measurable opportunity.'
  }
}

function buildReport() {
  const search = readJson(SEARCH_REPORT, null)
  const ai = readJson(AI_SIGNALS, null)
  const control = readJson(CONTROL, {})
  const citations = citationMap(ai)

  const pages = Array.isArray(search?.pages) ? search.pages : []
  const ranked = pages
    .map((page) => {
      const url = normalizePath(page.url)
      const citation = citations.get(url) ?? null
      const segment = classify(page, citation)
      return {
        url,
        segment,
        priorityScore: scoreRow(page, citation),
        impressions: Number(page.impressions ?? 0),
        clicks: Number(page.clicks ?? 0),
        ctr: Number(page.ctr ?? 0),
        expectedCtr: Number(page.expectedCtr ?? 0),
        ctrGapPts: Number(page.ctrGapPts ?? 0),
        position: Number(page.position ?? 0),
        ctrUpsideClicks: Number(page.ctrUpsideClicks ?? 0),
        rankUpsideClicks: Number(page.rankUpsideClicks ?? 0),
        totalUpsideClicks: Number(page.totalUpsideClicks ?? 0),
        citations: Number(citation?.citations ?? 0),
        citationPriority: Number(citation?.citationPriority ?? 0),
        actions: page.actions ?? [],
        topQueries: page.topQueries ?? [],
        nextAction: nextAction(segment),
      }
    })
    .sort((a, b) =>
      b.priorityScore - a.priorityScore ||
      b.totalUpsideClicks - a.totalUpsideClicks ||
      b.impressions - a.impressions
    )

  const actionable = ranked.filter((row) => row.priorityScore > 0 && row.segment !== 'hold')
  const citationConversion = actionable.filter((row) => row.citations > 0)
  const ctr = actionable.filter((row) => row.segment.endsWith('to-ctr'))
  const rank = actionable.filter((row) => row.segment.endsWith('to-rank'))
  const content = actionable.filter((row) => row.segment.endsWith('content-upgrade'))

  return {
    generatedAt: new Date().toISOString(),
    mode: pages.length ? 'page-level-search-data' : 'waiting-for-page-level-search-data',
    measurementBoundary: control.measurementBoundary ??
      'AI citations and search metrics are separate observational surfaces; this report does not infer causal lift or revenue.',
    currentDashboardSnapshot: control.currentDashboardSnapshot ?? null,
    rules: {
      primarySignal: 'measured search opportunity',
      citationBoostCapPct: 35,
      pureCitationGrowthPriority: 'deprioritized unless it also closes an evidence/safety gap or protects an existing winner',
      titleRewriteRule: 'only when page-level impressions/CTR/position support it',
      netNewContentRule: 'only for distinct query intent after cannibalization/canonical checks',
    },
    inputStatus: {
      searchOpportunityReportPresent: Boolean(search),
      searchRows: Number(search?.rowsIngested ?? 0),
      aiCitationManifestPresent: Boolean(ai),
      aiCitationManifestActive: aiSignalsActive(ai),
      aiCitationSnapshot: ai?.snapshotLabel ?? null,
    },
    summary: {
      pageCandidates: pages.length,
      actionableCandidates: actionable.length,
      citationToClickCandidates: citationConversion.length,
      ctrCandidates: ctr.length,
      strikingDistanceCandidates: rank.length,
      substantiveUpgradeCandidates: content.length,
    },
    topCitationToClick: citationConversion.slice(0, 25),
    topCtr: ctr.slice(0, 25),
    topStrikingDistance: rank.slice(0, 25),
    topSubstantiveUpgrades: content.slice(0, 25),
    all: ranked,
  }
}

function table(rows) {
  if (!rows.length) return '_No page-level candidates yet._'
  const head = '| Priority | URL | Impr. | CTR | Pos. | Search upside | AI citations | Segment |\n| ---: | --- | ---: | ---: | ---: | ---: | ---: | --- |'
  const body = rows.map((r) =>
    `| ${r.priorityScore} | \`${r.url}\` | ${r.impressions} | ${r.ctr}% | ${r.position} | +${r.totalUpsideClicks} clicks | ${r.citations} | ${r.segment} |`
  )
  return [head, ...body].join('\n')
}

function renderMarkdown(report) {
  const snap = report.currentDashboardSnapshot
  const snapshotBlock = snap
    ? [
        '## Current dashboard signal',
        '',
        `- Bing AI Performance: **${snap.aiPerformance?.citations30d ?? '—'}** citations / **${snap.aiPerformance?.avgCitedPages30d ?? '—'}** average cited pages over 30 days.`,
        `- Bing search: **${snap.searchPerformance?.impressions ?? '—'}** impressions / **${snap.searchPerformance?.clicks ?? '—'}** clicks / **${snap.searchPerformance?.ctrPct ?? '—'}%** CTR.`,
        `- Search window note: ${snap.searchPerformance?.windowNote ?? 'not supplied'}.`,
        '',
      ]
    : []

  return [
    '# Search conversion priorities',
    '',
    `Generated ${report.generatedAt}.`,
    '',
    ...snapshotBlock,
    '## Operating decision',
    '',
    'Optimize **citation → ranking → click conversion** before allocating more discretionary work to citation-count growth alone.',
    '',
    '- Search opportunity is the primary ranking signal.',
    '- Fresh AI-citation telemetry may add at most a 35% bounded boost to a page that already has measurable search upside.',
    '- Do not rewrite high-citation winners merely because they are highly cited.',
    '- Do not create thin pages for query variants; check canonical intent and cannibalization first.',
    '',
    `Mode: **${report.mode}**.`,
    `Actionable page-level candidates: **${report.summary.actionableCandidates}**.`,
    '',
    '## Citation → click candidates',
    '',
    table(report.topCitationToClick),
    '',
    '## CTR candidates',
    '',
    table(report.topCtr),
    '',
    '## Striking-distance candidates',
    '',
    table(report.topStrikingDistance),
    '',
    '## Substantive-upgrade candidates',
    '',
    table(report.topSubstantiveUpgrades),
    '',
    report.mode === 'waiting-for-page-level-search-data'
      ? '> Page-level Bing/Search Console export is still required before titles, snippets, ranking work, or specific URLs can be prioritized from observed search behavior.'
      : '',
    '',
  ].join('\n')
}

const report = buildReport()
fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true })
fs.writeFileSync(OUT_JSON, JSON.stringify(report, null, 2) + '\n')
fs.writeFileSync(OUT_MD, renderMarkdown(report))
console.log(`[search-conversion] mode=${report.mode} actionable=${report.summary.actionableCandidates} citation-to-click=${report.summary.citationToClickCandidates}`)
console.log(`[search-conversion] wrote ${path.relative(ROOT, OUT_JSON)} and ${path.relative(ROOT, OUT_MD)}`)
