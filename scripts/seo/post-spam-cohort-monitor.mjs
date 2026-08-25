#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  COHORT_LABELS,
  SPAM_UPDATE_PERIODS,
  classifyCohort,
  normalizePathname,
  percentChange,
  periodForDate,
} from './post-spam-cohort-lib.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const INPUT = path.join(ROOT, 'data-sources', 'search-console', 'pages-by-date.csv')
const GOVERNED = path.join(ROOT, 'public', 'data', 'enrichment-governed.json')
const REPORT_JSON = path.join(ROOT, 'ops', 'reports', 'post-spam-cohorts.json')
const REPORT_MD = path.join(ROOT, 'ops', 'reports', 'post-spam-cohorts.md')

function parseCsv(content) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let i = 0; i < content.length; i += 1) {
    const char = content[i]
    if (quoted) {
      if (char === '"') {
        if (content[i + 1] === '"') {
          field += '"'
          i += 1
        } else quoted = false
      } else field += char
      continue
    }
    if (char === '"') quoted = true
    else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (char !== '\r') field += char
  }
  if (field.length || row.length) {
    row.push(field)
    rows.push(row)
  }
  if (rows.length && rows[0].length) rows[0][0] = rows[0][0].replace(/^\uFEFF/, '')
  return rows.filter(candidate => candidate.some(cell => String(cell).trim() !== ''))
}

function toNumber(value) {
  const parsed = Number.parseFloat(String(value ?? '').replace(/[,%\s]/g, ''))
  return Number.isFinite(parsed) ? parsed : 0
}

function headerIndex(header) {
  const normalized = header.map(cell => String(cell).trim().toLowerCase())
  const find = aliases => normalized.findIndex(value => aliases.includes(value))
  return {
    date: find(['date', 'day']),
    page: find(['page', 'url', 'landing page']),
    clicks: find(['clicks', 'url clicks']),
    impressions: find(['impressions', 'impression']),
    position: find(['position', 'average position', 'avg. position', 'avg position']),
  }
}

function loadGoverned() {
  if (!existsSync(GOVERNED)) return new Map()
  const rows = JSON.parse(readFileSync(GOVERNED, 'utf8'))
  const map = new Map()
  for (const row of Array.isArray(rows) ? rows : []) {
    const entityType = String(row?.entityType || '').trim().toLowerCase()
    const slug = String(row?.entitySlug || '').trim().toLowerCase()
    if (!['herb', 'compound'].includes(entityType) || !slug) continue
    map.set(`${entityType}:${slug}`, row)
  }
  return map
}

function loadRows() {
  if (!existsSync(INPUT)) return []
  const parsed = parseCsv(readFileSync(INPUT, 'utf8'))
  if (parsed.length < 2) return []
  const [header, ...data] = parsed
  const index = headerIndex(header)
  if (index.date < 0 || index.page < 0 || index.impressions < 0) {
    throw new Error('pages-by-date.csv must contain Date, Page, and Impressions columns')
  }

  return data.map(cells => ({
    date: String(cells[index.date] || '').slice(0, 10),
    page: normalizePathname(cells[index.page]),
    clicks: index.clicks >= 0 ? toNumber(cells[index.clicks]) : 0,
    impressions: toNumber(cells[index.impressions]),
    position: index.position >= 0 ? toNumber(cells[index.position]) : 0,
  })).filter(row => /^\d{4}-\d{2}-\d{2}$/.test(row.date) && row.page && row.impressions > 0)
}

function emptyAggregate() {
  return { clicks: 0, impressions: 0, weightedPosition: 0, pages: new Set() }
}

function round(value, digits = 1) {
  if (!Number.isFinite(value)) return null
  return Number(value.toFixed(digits))
}

function summarizeAggregate(aggregate, daysObserved) {
  const impressions = aggregate.impressions
  return {
    pages: aggregate.pages.size,
    daysObserved,
    clicks: round(aggregate.clicks, 0),
    impressions: round(impressions, 0),
    avgDailyClicks: daysObserved ? round(aggregate.clicks / daysObserved, 2) : 0,
    avgDailyImpressions: daysObserved ? round(impressions / daysObserved, 1) : 0,
    ctrPct: impressions ? round((aggregate.clicks / impressions) * 100, 2) : 0,
    position: impressions ? round(aggregate.weightedPosition / impressions, 1) : null,
  }
}

function buildReport(rows, governedByKey) {
  const globalDates = new Map()
  const aggregates = new Map()
  const pageCohorts = new Map()

  for (const row of rows) {
    const period = periodForDate(row.date)
    if (period === 'outside') continue
    if (!globalDates.has(period)) globalDates.set(period, new Set())
    globalDates.get(period).add(row.date)

    const cohort = pageCohorts.get(row.page) || classifyCohort(row.page, governedByKey)
    pageCohorts.set(row.page, cohort)
    const key = `${cohort}:${period}`
    if (!aggregates.has(key)) aggregates.set(key, emptyAggregate())
    const aggregate = aggregates.get(key)
    aggregate.clicks += row.clicks
    aggregate.impressions += row.impressions
    aggregate.weightedPosition += row.position * row.impressions
    aggregate.pages.add(row.page)
  }

  const cohorts = {}
  for (const cohort of Object.keys(COHORT_LABELS)) {
    const periods = {}
    for (const period of Object.keys(SPAM_UPDATE_PERIODS)) {
      periods[period] = summarizeAggregate(
        aggregates.get(`${cohort}:${period}`) || emptyAggregate(),
        globalDates.get(period)?.size || 0,
      )
    }

    const baseline = periods.baseline
    const post = periods.post
    cohorts[cohort] = {
      label: COHORT_LABELS[cohort],
      periods,
      postVsBaseline: {
        dailyImpressionsPct: round(percentChange(post.avgDailyImpressions, baseline.avgDailyImpressions), 1),
        dailyClicksPct: round(percentChange(post.avgDailyClicks, baseline.avgDailyClicks), 1),
        ctrDeltaPts: round(post.ctrPct - baseline.ctrPct, 2),
        positionDelta: baseline.position == null || post.position == null ? null : round(post.position - baseline.position, 1),
      },
    }
  }

  const observedDates = rows.map(row => row.date).sort()
  const maxDate = observedDates.at(-1) || null
  const postDays = globalDates.get('post')?.size || 0
  const status = postDays < 7 ? 'early-observation' : postDays < 14 ? 'directional' : 'maturing'

  return {
    generatedAt: new Date().toISOString(),
    source: path.relative(ROOT, INPUT),
    observedThrough: maxDate,
    periods: SPAM_UPDATE_PERIODS,
    anomalyPolicy: {
      dates: '2026-08-13..2026-08-17',
      note: 'This period is isolated. The known AI-visibility logging anomaly applies to AI impression trend analysis; standard web-search cohort data is retained here but not used as the baseline.',
    },
    observation: {
      status,
      postDaysObserved: postDays,
      recommendation: postDays < 7
        ? 'Do not label the site or a cohort a spam-update winner/loser yet. Accumulate more post-update days.'
        : 'Use cohort deltas directionally; require sustained movement before pruning or broad template changes.',
    },
    cohortRules: {
      A: 'Publishable governed enrichment plus at least 5 of 6 authority signals: evidence claims, safety specificity, mechanism specificity, source depth, evidence judgment, uncertainty visibility.',
      B: 'Publishable governed enrichment that does not yet meet the A threshold.',
      C: 'Herb/compound profile without publishable governed enrichment.',
      D: 'Comparison/editorial and other non-profile content.',
      E: 'Research, tools, methodology, and evidence routes.',
      F: 'Translated /es, /pt, /fr, or /de routes.',
    },
    cohorts,
  }
}

function formatDelta(value, suffix = '%') {
  if (value == null) return '—'
  return `${value > 0 ? '+' : ''}${value}${suffix}`
}

function renderMarkdown(report) {
  const lines = [
    '# August 2026 spam-update cohort monitor',
    '',
    `Observed through **${report.observedThrough || 'no data'}**. Post-update days observed: **${report.observation.postDaysObserved}**.`,
    '',
    `**Status: ${report.observation.status}.** ${report.observation.recommendation}`,
    '',
    'Measurement windows:',
    '- Baseline: Aug 4-12',
    '- AI reporting anomaly: Aug 13-17 (isolated; not used as baseline)',
    '- Spam update rollout: Aug 18-21',
    '- Post-update: Aug 22 onward',
    '',
    '## Post vs baseline by cohort',
    '',
    '| Cohort | Pages post | Daily impr. Δ | Daily clicks Δ | CTR Δ | Position Δ |',
    '| --- | ---: | ---: | ---: | ---: | ---: |',
  ]

  for (const [key, cohort] of Object.entries(report.cohorts)) {
    const post = cohort.periods.post
    const delta = cohort.postVsBaseline
    lines.push(
      `| ${key}. ${cohort.label} | ${post.pages} | ${formatDelta(delta.dailyImpressionsPct)} | ${formatDelta(delta.dailyClicksPct)} | ${formatDelta(delta.ctrDeltaPts, ' pts')} | ${formatDelta(delta.positionDelta, '')} |`,
    )
  }

  lines.push(
    '',
    'Position Δ is post minus baseline, so a negative value is an average ranking improvement.',
    '',
    '## Period detail',
    '',
    '| Cohort | Period | Days | Impr./day | Clicks/day | CTR | Position |',
    '| --- | --- | ---: | ---: | ---: | ---: | ---: |',
  )

  for (const [key, cohort] of Object.entries(report.cohorts)) {
    for (const period of ['baseline', 'corrupted', 'rollout', 'post']) {
      const row = cohort.periods[period]
      lines.push(`| ${key} | ${SPAM_UPDATE_PERIODS[period].label} | ${row.daysObserved} | ${row.avgDailyImpressions} | ${row.avgDailyClicks} | ${row.ctrPct}% | ${row.position ?? '—'} |`)
    }
  }

  return `${lines.join('\n')}\n`
}

function main() {
  const rows = loadRows()
  if (!rows.length) {
    console.log(`[post-spam-cohorts] no page-by-date data found at ${path.relative(ROOT, INPUT)}`)
    console.log('[post-spam-cohorts] run scripts/seo/fetch-search-console.mjs first')
    return
  }

  const report = buildReport(rows, loadGoverned())
  mkdirSync(path.dirname(REPORT_JSON), { recursive: true })
  writeFileSync(REPORT_JSON, `${JSON.stringify(report, null, 2)}\n`)
  writeFileSync(REPORT_MD, renderMarkdown(report))

  console.log(`[post-spam-cohorts] observed through ${report.observedThrough}; ${report.observation.postDaysObserved} post-update days (${report.observation.status})`)
  for (const [key, cohort] of Object.entries(report.cohorts)) {
    console.log(`  ${key} ${cohort.label}: daily impressions ${formatDelta(cohort.postVsBaseline.dailyImpressionsPct)}`)
  }
  console.log(`[post-spam-cohorts] ${path.relative(ROOT, REPORT_MD)}`)
}

main()
