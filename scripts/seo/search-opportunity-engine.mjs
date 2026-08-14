#!/usr/bin/env node
/**
 * search-opportunity-engine.mjs
 *
 * query → page → impressions → position → CTR → recommended action
 *
 * Existing impressions are the cheapest traffic on the site: the ranking is
 * already paid for. This engine reads Search Console (and Bing Webmaster)
 * exports and ranks what to do next by the traffic each action would unlock,
 * rather than by gut feel.
 *
 * It answers four questions:
 *   1. Which URLs already earn the most impressions?          (upgrade these first)
 *   2. Which rank 4-15?                                        (striking distance)
 *   3. Which under-perform the CTR curve for their position?   (rewrite the title)
 *   4. Which queries have no page that truly targets them?     (content gap)
 *
 * ── Getting the data ────────────────────────────────────────────────────────
 * Search Console → Performance → Export → CSV, then drop the unzipped files in:
 *
 *   data-sources/search-console/
 *     Queries.csv          (Query, Clicks, Impressions, CTR, Position)
 *     Pages.csv            (Page,  Clicks, Impressions, CTR, Position)
 *     queries-by-page.csv  (optional: Query, Page, Clicks, Impressions, CTR, Position)
 *
 * Bing Webmaster Tools exports the same shape and can be dropped in alongside.
 * Column names are matched case-insensitively, so localized headers that keep
 * the English keywords still work.
 *
 * Usage:
 *   node scripts/seo/search-opportunity-engine.mjs
 *   node scripts/seo/search-opportunity-engine.mjs --dir=path/to/exports
 *   node scripts/seo/search-opportunity-engine.mjs --top=50
 *
 * Output: ops/reports/search-opportunities.json + .md
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { REPORTS_DIR, ROOT, percent } from '../lib/profile-corpus.mjs'

const argv = process.argv.slice(2)
const flag = (name, fallback) => {
  const hit = argv.find((a) => a === `--${name}` || a.startsWith(`--${name}=`))
  if (!hit) return fallback
  const [, value] = hit.split('=')
  return value === undefined ? true : value
}

const INPUT_DIR = path.resolve(ROOT, String(flag('dir', 'data-sources/search-console')))
const TOP_N = Number(flag('top', 25))
const JSON_PATH = path.join(REPORTS_DIR, 'search-opportunities.json')
const MD_PATH = path.join(REPORTS_DIR, 'search-opportunities.md')

/* ------------------------------------------------------------------- csv -- */

/** Minimal RFC4180 parser — GSC exports quote any field containing a comma. */
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
        } else {
          quoted = false
        }
      } else {
        field += char
      }
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
    } else if (char !== '\r') {
      field += char
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  // Strip a UTF-8 BOM from the first header cell.
  if (rows.length && rows[0].length) rows[0][0] = rows[0][0].replace(/^\uFEFF/, '')
  return rows.filter((r) => r.some((cell) => cell.trim() !== ''))
}

const COLUMN_ALIASES = {
  query: ['query', 'top queries', 'search query', 'keyword', 'queries'],
  page: ['page', 'top pages', 'landing page', 'url', 'pages', 'address'],
  clicks: ['clicks', 'url clicks'],
  impressions: ['impressions', 'impression'],
  ctr: ['ctr', 'click through rate', 'site ctr'],
  position: ['position', 'average position', 'avg. position', 'avg position'],
}

function mapHeader(header) {
  const normalized = header.map((h) => h.trim().toLowerCase())
  const index = {}
  for (const [key, aliases] of Object.entries(COLUMN_ALIASES)) {
    const found = normalized.findIndex((h) => aliases.includes(h))
    if (found >= 0) index[key] = found
  }
  return index
}

function toNumber(value) {
  if (value == null) return 0
  const cleaned = String(value).replace(/[%\s,]/g, '').replace(/,/g, '')
  const parsed = Number.parseFloat(cleaned)
  return Number.isFinite(parsed) ? parsed : 0
}

/** GSC exports CTR as "3.2%"; treat any value > 1 as already a percentage. */
function toCtrFraction(value) {
  const raw = String(value ?? '')
  const num = toNumber(raw)
  if (raw.includes('%') || num > 1) return num / 100
  return num
}

function loadExports(dir) {
  if (!existsSync(dir)) return []
  const rows = []
  for (const file of readdirSync(dir)) {
    if (!/\.csv$/i.test(file)) continue
    const parsed = parseCsv(readFileSync(path.join(dir, file), 'utf8'))
    if (parsed.length < 2) continue
    const index = mapHeader(parsed[0])
    if (index.impressions === undefined) continue

    for (const cells of parsed.slice(1)) {
      const impressions = toNumber(cells[index.impressions])
      if (!impressions) continue
      rows.push({
        source: file,
        query: index.query !== undefined ? cells[index.query]?.trim() ?? '' : '',
        page: index.page !== undefined ? cells[index.page]?.trim() ?? '' : '',
        clicks: index.clicks !== undefined ? toNumber(cells[index.clicks]) : 0,
        impressions,
        ctr: index.ctr !== undefined ? toCtrFraction(cells[index.ctr]) : 0,
        position: index.position !== undefined ? toNumber(cells[index.position]) : 0,
      })
    }
  }
  return rows
}

/* --------------------------------------------------------- ctr modelling -- */

/**
 * Expected organic CTR by average position. Deliberately conservative — it is
 * only used to rank *relative* under-performance, so the exact curve matters
 * less than its monotonic shape.
 */
const CTR_CURVE = [
  0, 0.28, 0.15, 0.1, 0.07, 0.055, 0.045, 0.037, 0.031, 0.027, 0.024,
  0.021, 0.019, 0.017, 0.015, 0.014, 0.013, 0.012, 0.011, 0.01, 0.009,
]

function expectedCtr(position) {
  if (!position || position < 1) return 0
  const floor = Math.floor(position)
  if (floor >= CTR_CURVE.length - 1) return 0.008
  const lower = CTR_CURVE[floor]
  const upper = CTR_CURVE[floor + 1]
  return lower + (upper - lower) * (position - floor)
}

/* ---------------------------------------------------- intent classifying -- */

/**
 * Commercial-investigation intent monetizes far better than encyclopedia
 * traffic, so it is weighted up when prioritizing actions.
 */
const INTENT_PATTERNS = [
  { intent: 'comparison', weight: 1.6, re: /\b(vs|versus|compared to|or)\b/i },
  { intent: 'best-of', weight: 1.6, re: /\bbest\b/i },
  { intent: 'dosage', weight: 1.5, re: /\b(dosage|dose|how much|mg)\b/i },
  { intent: 'efficacy', weight: 1.4, re: /\b(does .* work|is .* effective|worth it|legit)\b/i },
  { intent: 'safety', weight: 1.3, re: /\b(side effects?|safe|interactions?|contraindication|risk)\b/i },
  { intent: 'timing', weight: 1.2, re: /\b(when to take|how long|before bed|empty stomach)\b/i },
  { intent: 'informational', weight: 1, re: /.*/ },
]

function classifyIntent(query) {
  for (const pattern of INTENT_PATTERNS) {
    if (pattern.re.test(query)) return pattern
  }
  return INTENT_PATTERNS.at(-1)
}

/* ------------------------------------------------------------ opportunity -- */

/**
 * The authoritative list of URLs the site actually ships. Derived from the
 * built export when present, because the route manifest covers only a subset
 * of generated routes. Returns null when nothing reliable is available, which
 * disables the "unknown URL" flag rather than emitting false positives.
 */
function loadKnownUrls() {
  const outDir = path.join(ROOT, 'out')
  if (!existsSync(outDir)) return null

  const urls = new Set()
  const walk = (dir, prefix) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) {
        if (entry.name === 'index.html') urls.add(prefix || '/')
        continue
      }
      if (entry.name.startsWith('_') || entry.name === '.') continue
      walk(path.join(dir, entry.name), `${prefix}${entry.name}/`)
    }
  }
  walk(outDir, '/')
  return urls.size ? urls : null
}

function normalizePath(page) {
  if (!page) return ''
  try {
    const url = page.startsWith('http') ? new URL(page) : null
    const pathname = url ? url.pathname : page
    return pathname.endsWith('/') ? pathname : `${pathname}/`
  } catch {
    return page
  }
}

function buildPageOpportunities(rows, knownUrls) {
  const byPage = new Map()
  for (const row of rows) {
    const key = normalizePath(row.page)
    if (!key) continue
    if (!byPage.has(key)) {
      byPage.set(key, { url: key, clicks: 0, impressions: 0, weightedPosition: 0, queries: [] })
    }
    const entry = byPage.get(key)
    entry.clicks += row.clicks
    entry.impressions += row.impressions
    entry.weightedPosition += row.position * row.impressions
    if (row.query) entry.queries.push(row)
  }

  const results = []
  for (const entry of byPage.values()) {
    const position = entry.impressions ? entry.weightedPosition / entry.impressions : 0
    const ctr = entry.impressions ? entry.clicks / entry.impressions : 0
    const target = expectedCtr(position)
    const ctrGap = target - ctr

    // Clicks unlocked by simply hitting the expected CTR for the current rank.
    const ctrUpside = Math.max(0, Math.round(ctrGap * entry.impressions))
    // Clicks unlocked by moving into the top 3.
    const rankUpside =
      position > 3 && position <= 20
        ? Math.max(0, Math.round((expectedCtr(3) - Math.max(ctr, target)) * entry.impressions))
        : 0

    const actions = []
    if (position >= 4 && position <= 15) actions.push('striking-distance')
    if (ctrGap > 0.01 && entry.impressions >= 50) actions.push('rewrite-title-and-meta')
    if (position > 15 && entry.impressions >= 100) actions.push('needs-substantive-upgrade')
    if (position <= 3 && ctrGap > 0.02) actions.push('rewrite-title-and-meta')
    if (knownUrls && !knownUrls.has(entry.url)) actions.push('url-not-in-current-route-set')
    if (!actions.length) actions.push('hold')

    results.push({
      url: entry.url,
      clicks: entry.clicks,
      impressions: entry.impressions,
      ctr: Number((ctr * 100).toFixed(2)),
      expectedCtr: Number((target * 100).toFixed(2)),
      ctrGapPts: Number((ctrGap * 100).toFixed(2)),
      position: Number(position.toFixed(1)),
      ctrUpsideClicks: ctrUpside,
      rankUpsideClicks: rankUpside,
      totalUpsideClicks: ctrUpside + rankUpside,
      topQueries: entry.queries
        .sort((a, b) => b.impressions - a.impressions)
        .slice(0, 5)
        .map((q) => ({ query: q.query, impressions: q.impressions, position: Number(q.position.toFixed(1)) })),
      actions: [...new Set(actions)],
    })
  }

  return results.sort((a, b) => b.totalUpsideClicks - a.totalUpsideClicks || b.impressions - a.impressions)
}

function buildQueryOpportunities(rows) {
  const byQuery = new Map()
  for (const row of rows) {
    if (!row.query) continue
    const key = row.query.toLowerCase()
    if (!byQuery.has(key)) {
      byQuery.set(key, { query: row.query, clicks: 0, impressions: 0, weightedPosition: 0, pages: new Set() })
    }
    const entry = byQuery.get(key)
    entry.clicks += row.clicks
    entry.impressions += row.impressions
    entry.weightedPosition += row.position * row.impressions
    if (row.page) entry.pages.add(normalizePath(row.page))
  }

  return [...byQuery.values()]
    .map((entry) => {
      const position = entry.impressions ? entry.weightedPosition / entry.impressions : 0
      const intent = classifyIntent(entry.query)
      const ctr = entry.impressions ? entry.clicks / entry.impressions : 0
      const upside = Math.max(0, Math.round((expectedCtr(3) - ctr) * entry.impressions))

      return {
        query: entry.query,
        intent: intent.intent,
        clicks: entry.clicks,
        impressions: entry.impressions,
        ctr: Number((ctr * 100).toFixed(2)),
        position: Number(position.toFixed(1)),
        // Cannibalization: several URLs competing for one query.
        competingPages: entry.pages.size,
        pages: [...entry.pages],
        priority: Math.round(upside * intent.weight),
      }
    })
    .sort((a, b) => b.priority - a.priority)
}

/* ------------------------------------------------------------------ main -- */

function main() {
  const rows = loadExports(INPUT_DIR)
  const knownUrls = loadKnownUrls()

  if (!rows.length) {
    console.log('\nSearch opportunity engine')
    console.log('='.repeat(64))
    console.log(`No Search Console exports found in ${path.relative(ROOT, INPUT_DIR)}/`)
    console.log('')
    console.log('To populate it:')
    console.log('  1. Search Console → Performance → Export → CSV (or Bing Webmaster Tools)')
    console.log(`  2. Unzip into ${path.relative(ROOT, INPUT_DIR)}/`)
    console.log('  3. Re-run: npm run seo:opportunities')
    console.log('')
    console.log('Expected columns (case-insensitive): Query | Page | Clicks | Impressions | CTR | Position')
    mkdirSync(INPUT_DIR, { recursive: true })
    process.exit(0)
  }

  const pages = buildPageOpportunities(rows, knownUrls)
  const queries = buildQueryOpportunities(rows)

  const report = {
    generatedAt: new Date().toISOString(),
    inputDir: path.relative(ROOT, INPUT_DIR),
    rowsIngested: rows.length,
    totals: {
      clicks: rows.reduce((sum, r) => sum + r.clicks, 0),
      impressions: rows.reduce((sum, r) => sum + r.impressions, 0),
    },
    topByImpressions: [...pages].sort((a, b) => b.impressions - a.impressions).slice(0, TOP_N),
    strikingDistance: pages.filter((p) => p.actions.includes('striking-distance')).slice(0, TOP_N),
    titleRewrites: pages.filter((p) => p.actions.includes('rewrite-title-and-meta')).slice(0, TOP_N),
    cannibalization: queries.filter((q) => q.competingPages > 1).slice(0, TOP_N),
    contentGaps: queries.filter((q) => q.position > 20 && q.impressions >= 50).slice(0, TOP_N),
    pages,
    queries,
  }

  mkdirSync(REPORTS_DIR, { recursive: true })
  writeFileSync(JSON_PATH, `${JSON.stringify(report, null, 2)}\n`)
  writeFileSync(MD_PATH, renderMarkdown(report))
  printSummary(report)
}

function table(rows, columns) {
  const lines = [
    `| ${columns.map((c) => c.label).join(' | ')} |`,
    `| ${columns.map((c) => (c.align === 'right' ? '---:' : '---')).join(' | ')} |`,
  ]
  for (const row of rows) lines.push(`| ${columns.map((c) => c.get(row)).join(' | ')} |`)
  return lines.join('\n')
}

function renderMarkdown(report) {
  const pageCols = [
    { label: 'URL', get: (r) => `\`${r.url}\`` },
    { label: 'Impr.', align: 'right', get: (r) => r.impressions },
    { label: 'Clicks', align: 'right', get: (r) => r.clicks },
    { label: 'CTR', align: 'right', get: (r) => `${r.ctr}%` },
    { label: 'Exp.', align: 'right', get: (r) => `${r.expectedCtr}%` },
    { label: 'Pos.', align: 'right', get: (r) => r.position },
    { label: 'Upside', align: 'right', get: (r) => r.totalUpsideClicks },
    { label: 'Action', get: (r) => r.actions.join(', ') },
  ]

  return [
    '# Search opportunity engine',
    '',
    `Generated ${report.generatedAt} from ${report.rowsIngested} exported rows.`,
    `Totals: **${report.totals.clicks}** clicks / **${report.totals.impressions}** impressions.`,
    '',
    `## Top ${report.topByImpressions.length} URLs by impressions`,
    '',
    'Existing impressions are the cheapest traffic available — upgrade these first.',
    '',
    table(report.topByImpressions, pageCols),
    '',
    '## Striking distance (positions 4-15)',
    '',
    'Usually cheaper than net-new content.',
    '',
    table(report.strikingDistance, pageCols),
    '',
    '## Title & meta rewrites (CTR below the curve)',
    '',
    'Traffic without needing a ranking improvement.',
    '',
    table(report.titleRewrites, pageCols),
    '',
    '## Keyword cannibalization',
    '',
    table(report.cannibalization, [
      { label: 'Query', get: (r) => r.query },
      { label: 'Impr.', align: 'right', get: (r) => r.impressions },
      { label: 'Pos.', align: 'right', get: (r) => r.position },
      { label: 'Competing pages', align: 'right', get: (r) => r.competingPages },
      { label: 'URLs', get: (r) => r.pages.map((p) => `\`${p}\``).join('<br>') },
    ]),
    '',
    '## Content gaps (ranking past 20 with real demand)',
    '',
    table(report.contentGaps, [
      { label: 'Query', get: (r) => r.query },
      { label: 'Intent', get: (r) => r.intent },
      { label: 'Impr.', align: 'right', get: (r) => r.impressions },
      { label: 'Pos.', align: 'right', get: (r) => r.position },
      { label: 'Priority', align: 'right', get: (r) => r.priority },
    ]),
    '',
  ].join('\n')
}

function printSummary(report) {
  console.log('\nSearch opportunity engine')
  console.log('='.repeat(64))
  console.log(`Ingested ${report.rowsIngested} rows from ${report.inputDir}/`)
  console.log(`Totals: ${report.totals.clicks} clicks · ${report.totals.impressions} impressions`)
  console.log(`Site-wide CTR: ${percent(report.totals.clicks, report.totals.impressions)}%`)

  const sections = [
    ['Top URLs by impressions', report.topByImpressions],
    ['Striking distance (4-15)', report.strikingDistance],
    ['Title rewrites (CTR gap)', report.titleRewrites],
  ]

  for (const [label, rows] of sections) {
    console.log(`\n${label} — ${rows.length}`)
    for (const row of rows.slice(0, 10)) {
      console.log(
        `  ${String(row.impressions).padStart(7)} impr · pos ${String(row.position).padStart(5)} · ` +
          `CTR ${String(row.ctr).padStart(5)}% (exp ${row.expectedCtr}%) · +${row.totalUpsideClicks} clicks · ${row.url}`,
      )
    }
  }

  if (report.cannibalization.length) {
    console.log(`\nCannibalized queries — ${report.cannibalization.length}`)
    for (const row of report.cannibalization.slice(0, 10)) {
      console.log(`  ${row.query} → ${row.competingPages} pages`)
    }
  }

  console.log(`\nReports: ${path.relative(ROOT, JSON_PATH)}`)
  console.log(`         ${path.relative(ROOT, MD_PATH)}`)
}

main()
