#!/usr/bin/env node
/**
 * ai-citation-tracker.mjs
 *
 * Tracks which URLs AI answer engines actually reuse, and how that changes when
 * a page is upgraded. Citation counts are not traffic, but they are the only
 * direct read on whether the library is being treated as a grounding source.
 *
 * Because the vendor reports are rolling windows, every ingest is snapshotted
 * to `ops/ai-citations/history/` — that retained history is what makes velocity
 * measurable at all.
 *
 * It answers:
 *   1. Which URLs earn the most AI citations?
 *   2. What changed since the last snapshot?            (citation velocity)
 *   3. Which pages are cited but get little search traffic?  (adjacent-content gap)
 *   4. Which grounding-query themes recur across cited URLs? (dedicated answers)
 *
 * ── Getting the data ────────────────────────────────────────────────────────
 * Bing Webmaster Tools → AI Performance → Export, then drop the CSV in:
 *
 *   data-sources/ai-performance/
 *
 * Recognized columns (case-insensitive, extras ignored):
 *   URL / Page · Citations / AI Citations / Impressions · Clicks
 *   Query / Grounding Query · Date
 *
 * Usage:
 *   node scripts/seo/ai-citation-tracker.mjs
 *   node scripts/seo/ai-citation-tracker.mjs --label=2026-08-14
 *
 * Output: ops/reports/ai-citations.json + .md, plus a dated snapshot.
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { REPORTS_DIR, ROOT } from '../lib/profile-corpus.mjs'

const argv = process.argv.slice(2)
const flag = (name, fallback) => {
  const hit = argv.find((a) => a === `--${name}` || a.startsWith(`--${name}=`))
  if (!hit) return fallback
  const [, value] = hit.split('=')
  return value === undefined ? true : value
}

const INPUT_DIR = path.resolve(ROOT, String(flag('dir', 'data-sources/ai-performance')))
const HISTORY_DIR = path.join(ROOT, 'ops', 'ai-citations', 'history')
const JSON_PATH = path.join(REPORTS_DIR, 'ai-citations.json')
const MD_PATH = path.join(REPORTS_DIR, 'ai-citations.md')
const SNAPSHOT_LABEL = String(flag('label', new Date().toISOString().slice(0, 10)))

/* ------------------------------------------------------------------- csv -- */

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
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  if (rows.length && rows[0].length) rows[0][0] = rows[0][0].replace(/^\uFEFF/, '')
  return rows.filter((r) => r.some((cell) => cell.trim() !== ''))
}

const ALIASES = {
  url: ['url', 'page', 'address', 'landing page', 'cited url'],
  citations: ['citations', 'ai citations', 'citation count', 'impressions', 'ai impressions', 'references'],
  clicks: ['clicks', 'ai clicks', 'url clicks'],
  query: ['query', 'grounding query', 'grounding queries', 'search query', 'keyword'],
  date: ['date', 'day'],
}

function mapHeader(header) {
  const normalized = header.map((h) => h.trim().toLowerCase())
  const index = {}
  for (const [key, aliases] of Object.entries(ALIASES)) {
    const found = normalized.findIndex((h) => aliases.includes(h))
    if (found >= 0) index[key] = found
  }
  return index
}

const toNumber = (value) => {
  const parsed = Number.parseFloat(String(value ?? '').replace(/[,%\s]/g, ''))
  return Number.isFinite(parsed) ? parsed : 0
}

function normalizePath(page) {
  if (!page) return ''
  try {
    const pathname = page.startsWith('http') ? new URL(page).pathname : page
    return pathname.endsWith('/') ? pathname : `${pathname}/`
  } catch {
    return page
  }
}

function loadExports(dir) {
  if (!existsSync(dir)) return []
  const rows = []
  for (const file of readdirSync(dir)) {
    if (!/\.csv$/i.test(file)) continue
    const parsed = parseCsv(readFileSync(path.join(dir, file), 'utf8'))
    if (parsed.length < 2) continue
    const index = mapHeader(parsed[0])
    if (index.url === undefined && index.query === undefined) continue

    for (const cells of parsed.slice(1)) {
      rows.push({
        source: file,
        url: index.url !== undefined ? normalizePath(cells[index.url]?.trim()) : '',
        query: index.query !== undefined ? (cells[index.query]?.trim() ?? '') : '',
        citations: index.citations !== undefined ? toNumber(cells[index.citations]) : 1,
        clicks: index.clicks !== undefined ? toNumber(cells[index.clicks]) : 0,
        date: index.date !== undefined ? (cells[index.date]?.trim() ?? '') : '',
      })
    }
  }
  return rows
}

/* -------------------------------------------------------------- grouping -- */

/**
 * Reduce a grounding query to its theme so recurring intents surface even when
 * the surface wording differs ("ashwagandha dose for stress" and "how much
 * ashwagandha for anxiety" are one theme worth a dedicated answer).
 */
const THEME_STOPWORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'do', 'does', 'can', 'should', 'i', 'you', 'my',
  'for', 'of', 'to', 'in', 'on', 'with', 'and', 'or', 'what', 'how', 'when',
  'why', 'best', 'good', 'take', 'taking', 'use', 'used', 'it', 'that', 'much',
])

function themeOf(query) {
  const tokens = query
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2 && !THEME_STOPWORDS.has(t))
  return [...new Set(tokens)].sort().slice(0, 4).join(' ')
}

/* -------------------------------------------------------------- history -- */

function loadHistory() {
  if (!existsSync(HISTORY_DIR)) return []
  return readdirSync(HISTORY_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((file) => {
      try {
        return { file, ...JSON.parse(readFileSync(path.join(HISTORY_DIR, file), 'utf8')) }
      } catch {
        return null
      }
    })
    .filter(Boolean)
}

/* ---------------------------------------------------- search cross-check -- */

/** Pull page-level search traffic from the opportunity engine, when present. */
function loadSearchTraffic() {
  const file = path.join(REPORTS_DIR, 'search-opportunities.json')
  if (!existsSync(file)) return null
  try {
    const report = JSON.parse(readFileSync(file, 'utf8'))
    return new Map(report.pages.map((p) => [p.url, p]))
  } catch {
    return null
  }
}

/* ------------------------------------------------------------------ main -- */

function main() {
  const rows = loadExports(INPUT_DIR)

  if (!rows.length) {
    console.log('\nAI citation tracker')
    console.log('='.repeat(60))
    console.log(`No AI performance exports found in ${path.relative(ROOT, INPUT_DIR)}/`)
    console.log('')
    console.log('To populate it:')
    console.log('  1. Bing Webmaster Tools → AI Performance → Export')
    console.log(`  2. Drop the CSV in ${path.relative(ROOT, INPUT_DIR)}/`)
    console.log('  3. Re-run: npm run seo:ai-citations')
    console.log('')
    console.log('Recognized columns: URL | Citations | Clicks | Grounding Query | Date')
    console.log('')
    console.log('Run this on every reporting cycle — the vendor report is a rolling')
    console.log('window, so retained snapshots are the only way to measure velocity.')
    mkdirSync(INPUT_DIR, { recursive: true })
    process.exit(0)
  }

  const byUrl = new Map()
  for (const row of rows) {
    if (!row.url) continue
    if (!byUrl.has(row.url)) byUrl.set(row.url, { url: row.url, citations: 0, clicks: 0, queries: [] })
    const entry = byUrl.get(row.url)
    entry.citations += row.citations
    entry.clicks += row.clicks
    if (row.query) entry.queries.push({ query: row.query, citations: row.citations })
  }

  const history = loadHistory()
  const previous = history.at(-1)
  const previousByUrl = new Map((previous?.urls ?? []).map((u) => [u.url, u]))
  const searchTraffic = loadSearchTraffic()

  const urls = [...byUrl.values()]
    .map((entry) => {
      const before = previousByUrl.get(entry.url)
      const delta = before ? entry.citations - before.citations : null
      const search = searchTraffic?.get(entry.url) ?? null

      const flags = []
      if (before === undefined) flags.push('newly-cited')
      if (delta !== null && delta > 0) flags.push('citations-rising')
      if (delta !== null && delta < 0) flags.push('citations-falling')
      // Cited by AI but not earning clicks: the topic has demand the site is
      // not capturing with its own ranking — build adjacent content.
      if (search && entry.citations >= 5 && search.clicks < 10) flags.push('cited-but-low-traffic')
      if (!search && searchTraffic) flags.push('no-search-data')

      return {
        url: entry.url,
        citations: entry.citations,
        clicks: entry.clicks,
        previousCitations: before?.citations ?? null,
        delta,
        velocityPct:
          before && before.citations > 0 ? Number((((entry.citations - before.citations) / before.citations) * 100).toFixed(1)) : null,
        searchClicks: search?.clicks ?? null,
        searchImpressions: search?.impressions ?? null,
        topQueries: entry.queries.sort((a, b) => b.citations - a.citations).slice(0, 5),
        flags,
      }
    })
    .sort((a, b) => b.citations - a.citations)

  const themes = new Map()
  for (const row of rows) {
    if (!row.query) continue
    const theme = themeOf(row.query)
    if (!theme) continue
    if (!themes.has(theme)) themes.set(theme, { theme, citations: 0, queries: new Set(), urls: new Set() })
    const entry = themes.get(theme)
    entry.citations += row.citations
    entry.queries.add(row.query)
    if (row.url) entry.urls.add(row.url)
  }

  const groundingThemes = [...themes.values()]
    .map((entry) => ({
      theme: entry.theme,
      citations: entry.citations,
      queryCount: entry.queries.size,
      queries: [...entry.queries].slice(0, 8),
      urls: [...entry.urls],
      // A theme grounded across many queries but only one URL is an
      // under-served cluster: worth a dedicated answer page.
      underServed: entry.queries.size >= 3 && entry.urls.size <= 1,
    }))
    .sort((a, b) => b.citations - a.citations)

  const snapshot = {
    label: SNAPSHOT_LABEL,
    capturedAt: new Date().toISOString(),
    totalCitations: urls.reduce((sum, u) => sum + u.citations, 0),
    urls: urls.map(({ url, citations, clicks }) => ({ url, citations, clicks })),
  }
  mkdirSync(HISTORY_DIR, { recursive: true })
  writeFileSync(path.join(HISTORY_DIR, `${SNAPSHOT_LABEL}.json`), `${JSON.stringify(snapshot, null, 2)}\n`)

  const report = {
    generatedAt: new Date().toISOString(),
    inputDir: path.relative(ROOT, INPUT_DIR),
    snapshotLabel: SNAPSHOT_LABEL,
    comparedTo: previous?.label ?? null,
    snapshotsRetained: history.length + 1,
    totals: {
      citedUrls: urls.length,
      citations: snapshot.totalCitations,
      clicks: urls.reduce((sum, u) => sum + u.clicks, 0),
    },
    topCited: urls.slice(0, 25),
    rising: urls.filter((u) => u.delta !== null && u.delta > 0).sort((a, b) => b.delta - a.delta).slice(0, 25),
    falling: urls.filter((u) => u.delta !== null && u.delta < 0).sort((a, b) => a.delta - b.delta).slice(0, 25),
    citedButLowTraffic: urls.filter((u) => u.flags.includes('cited-but-low-traffic')).slice(0, 25),
    underServedThemes: groundingThemes.filter((t) => t.underServed).slice(0, 25),
    groundingThemes: groundingThemes.slice(0, 100),
    urls,
  }

  mkdirSync(REPORTS_DIR, { recursive: true })
  writeFileSync(JSON_PATH, `${JSON.stringify(report, null, 2)}\n`)
  writeFileSync(MD_PATH, renderMarkdown(report))
  printSummary(report)
}

function renderMarkdown(report) {
  const lines = [
    '# AI citation tracker',
    '',
    `Snapshot \`${report.snapshotLabel}\`${report.comparedTo ? ` compared to \`${report.comparedTo}\`` : ' (no prior snapshot)'}.`,
    `**${report.totals.citations}** citations across **${report.totals.citedUrls}** URLs · ${report.snapshotsRetained} snapshots retained.`,
    '',
    '## Most-cited URLs',
    '',
    '| URL | Citations | Δ | Search clicks | Flags |',
    '| --- | ---: | ---: | ---: | --- |',
  ]
  for (const row of report.topCited) {
    lines.push(
      `| \`${row.url}\` | ${row.citations} | ${row.delta ?? '—'} | ${row.searchClicks ?? '—'} | ${row.flags.join(', ')} |`,
    )
  }

  if (report.citedButLowTraffic.length) {
    lines.push(
      '',
      '## Cited by AI, thin on search traffic',
      '',
      'Demand exists but the page is not ranking for it — build adjacent content.',
      '',
      '| URL | Citations | Search clicks |',
      '| --- | ---: | ---: |',
      ...report.citedButLowTraffic.map((r) => `| \`${r.url}\` | ${r.citations} | ${r.searchClicks ?? 0} |`),
    )
  }

  if (report.underServedThemes.length) {
    lines.push(
      '',
      '## Under-served grounding themes',
      '',
      'Recurring question themes grounded against a single URL — candidates for a dedicated answer.',
      '',
      '| Theme | Citations | Queries | Example queries |',
      '| --- | ---: | ---: | --- |',
      ...report.underServedThemes.map(
        (t) => `| ${t.theme} | ${t.citations} | ${t.queryCount} | ${t.queries.slice(0, 3).join('; ')} |`,
      ),
    )
  }

  return `${lines.join('\n')}\n`
}

function printSummary(report) {
  console.log('\nAI citation tracker')
  console.log('='.repeat(60))
  console.log(`Snapshot        ${report.snapshotLabel}${report.comparedTo ? ` (vs ${report.comparedTo})` : ' — first snapshot'}`)
  console.log(`Cited URLs      ${report.totals.citedUrls}`)
  console.log(`Citations       ${report.totals.citations}`)
  console.log(`Snapshots kept  ${report.snapshotsRetained}`)

  console.log('\nMost cited:')
  for (const row of report.topCited.slice(0, 10)) {
    const delta = row.delta === null ? '' : ` (${row.delta >= 0 ? '+' : ''}${row.delta})`
    console.log(`  ${String(row.citations).padStart(6)}${delta.padStart(8)}  ${row.url}`)
  }

  if (report.rising.length) {
    console.log('\nRising fastest:')
    for (const row of report.rising.slice(0, 8)) console.log(`  +${String(row.delta).padStart(5)}  ${row.url}`)
  }
  if (report.falling.length) {
    console.log('\nFalling:')
    for (const row of report.falling.slice(0, 8)) console.log(`  ${String(row.delta).padStart(6)}  ${row.url}`)
  }
  if (report.citedButLowTraffic.length) {
    console.log('\nCited by AI but low search traffic (build adjacent content):')
    for (const row of report.citedButLowTraffic.slice(0, 8)) {
      console.log(`  ${String(row.citations).padStart(6)} citations · ${row.searchClicks ?? 0} clicks  ${row.url}`)
    }
  }
  if (report.underServedThemes.length) {
    console.log('\nUnder-served grounding themes (dedicated answers wanted):')
    for (const theme of report.underServedThemes.slice(0, 8)) {
      console.log(`  ${String(theme.citations).padStart(6)} · ${theme.queryCount} queries · ${theme.theme}`)
    }
  }

  console.log(`\nReports: ${path.relative(ROOT, JSON_PATH)}`)
  console.log(`         ${path.relative(ROOT, MD_PATH)}`)
}

main()
