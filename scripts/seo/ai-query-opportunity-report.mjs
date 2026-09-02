#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const argv = process.argv.slice(2)
const flag = (name, fallback) => {
  const hit = argv.find((arg) => arg === `--${name}` || arg.startsWith(`--${name}=`))
  if (!hit) return fallback
  const [, value] = hit.split('=')
  return value === undefined ? true : value
}

const ROOT = process.cwd()
const INPUT_DIR = path.resolve(ROOT, String(flag('dir', 'data-sources/ai-performance')))
const OUTPUT_DIR = path.resolve(ROOT, String(flag('out', 'ops/reports')))
const JSON_PATH = path.join(OUTPUT_DIR, 'ai-query-opportunities.json')
const MD_PATH = path.join(OUTPUT_DIR, 'ai-query-opportunities.md')

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
  return rows.filter((cells) => cells.some((cell) => String(cell).trim() !== ''))
}

const norm = (value) => String(value ?? '').trim().toLowerCase()
const number = (value) => {
  const parsed = Number.parseFloat(String(value ?? '').replace(/[,%\s]/g, ''))
  return Number.isFinite(parsed) ? parsed : 0
}

function rowObjects(file) {
  const rows = parseCsv(readFileSync(file, 'utf8'))
  if (rows.length < 2) return []
  const headers = rows[0].map((h) => String(h).trim())
  return rows.slice(1).map((cells) => Object.fromEntries(headers.map((header, i) => [header, cells[i] ?? ''])))
}

function findHeader(record, aliases) {
  const keys = Object.keys(record)
  return keys.find((key) => aliases.includes(norm(key))) ?? null
}

function detectCandidate(file) {
  const rows = rowObjects(file)
  if (!rows.length) return null
  const sample = rows[0]
  const dateKey = findHeader(sample, ['date', 'day'])
  const citationsKey = findHeader(sample, ['citations', 'citation count', 'total citations', 'ai citations'])
  const citedPagesKey = findHeader(sample, ['cited pages', 'cited page count', 'pages cited', 'unique cited pages'])
  const queryKey = findHeader(sample, ['grounding query', 'query', 'search query'])
  const intentKey = findHeader(sample, ['intent'])
  const topicKey = findHeader(sample, ['topic'])
  const shareKey = findHeader(sample, ['citation share', 'share'])

  const type = queryKey && citationsKey ? 'query' : dateKey && citationsKey && citedPagesKey ? 'overview' : 'other'
  return { file, rows, type, keys: { dateKey, citationsKey, citedPagesKey, queryKey, intentKey, topicKey, shareKey }, mtimeMs: statSync(file).mtimeMs }
}

function selectCandidates(dir) {
  if (!existsSync(dir)) return { overview: null, query: null }
  const candidates = readdirSync(dir)
    .filter((name) => /\.csv$/i.test(name))
    .map((name) => detectCandidate(path.join(dir, name)))
    .filter(Boolean)

  const overviewCandidates = candidates.filter((c) => c.type === 'overview')
  const queryCandidates = candidates.filter((c) => c.type === 'query')

  const overview = overviewCandidates
    .map((candidate) => {
      const { dateKey } = candidate.keys
      const maxDate = Math.max(...candidate.rows.map((row) => Date.parse(row[dateKey])).filter(Number.isFinite))
      return { ...candidate, maxDate: Number.isFinite(maxDate) ? maxDate : 0 }
    })
    .sort((a, b) => b.maxDate - a.maxDate || b.mtimeMs - a.mtimeMs)[0] ?? null

  const query = queryCandidates.sort((a, b) => b.mtimeMs - a.mtimeMs)[0] ?? null
  return { overview, query }
}

const average = (values) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null
const pctChange = (from, to) => from > 0 ? ((to - from) / from) * 100 : null
const round = (value, digits = 1) => value == null ? null : Number(value.toFixed(digits))

function analyzeOverview(candidate) {
  if (!candidate) return null
  const { dateKey, citationsKey, citedPagesKey } = candidate.keys
  const days = candidate.rows
    .map((row) => ({
      date: new Date(row[dateKey]),
      citations: number(row[citationsKey]),
      citedPages: number(row[citedPagesKey]),
    }))
    .filter((row) => Number.isFinite(row.date.getTime()))
    .sort((a, b) => a.date - b.date)

  if (!days.length) return null
  const first7 = days.slice(0, Math.min(7, days.length))
  const last7 = days.slice(-Math.min(7, days.length))
  const latest = days.at(-1)
  const totalCitations = days.reduce((sum, day) => sum + day.citations, 0)
  const totalCitedPagesAcrossDays = days.reduce((sum, day) => sum + day.citedPages, 0)

  return {
    source: path.basename(candidate.file),
    startDate: days[0].date.toISOString().slice(0, 10),
    endDate: latest.date.toISOString().slice(0, 10),
    dayCount: days.length,
    totalCitations,
    averageDailyCitations: round(average(days.map((d) => d.citations))),
    latestDailyCitations: latest.citations,
    maxDailyCitations: Math.max(...days.map((d) => d.citations)),
    averageCitedPages: round(average(days.map((d) => d.citedPages))),
    latestCitedPages: latest.citedPages,
    maxCitedPages: Math.max(...days.map((d) => d.citedPages)),
    first7AverageCitations: round(average(first7.map((d) => d.citations))),
    last7AverageCitations: round(average(last7.map((d) => d.citations))),
    last7VsFirst7Pct: round(pctChange(average(first7.map((d) => d.citations)), average(last7.map((d) => d.citations)))),
    first7AverageCitedPages: round(average(first7.map((d) => d.citedPages))),
    last7AverageCitedPages: round(average(last7.map((d) => d.citedPages))),
    last7BreadthVsFirst7Pct: round(pctChange(average(first7.map((d) => d.citedPages)), average(last7.map((d) => d.citedPages)))),
    citationsPerCitedPageDay: round(totalCitedPagesAcrossDays ? totalCitations / totalCitedPagesAcrossDays : null, 2),
    days: days.map((day) => ({ date: day.date.toISOString().slice(0, 10), citations: day.citations, citedPages: day.citedPages })),
  }
}

const INTENT_WEIGHT = new Map([
  ['commercial', 1.3],
  ['comparison', 1.2],
  ['research', 1.0],
  ['informational', 0.9],
  ['learn and solve', 0.85],
  ['others', 0.8],
])

const CLUSTERS = [
  ['Valerian sleep', /\bvalerian\b/i],
  ['Mushroom coffee', /mushroom coffee/i],
  ['2C-B', /\b2c[\s-]?b\b|\b2cb\b/i],
  ['ASPD / personality', /\baspd\b|antisocial personality/i],
  ['ADHD', /\badhd\b/i],
  ['Glycine sleep', /\bglycine\b/i],
  ['NMN', /\bnmn\b/i],
  ['Anxiety / calm', /\banxiety\b|racing thoughts|calming herbs|herbal remedies/i],
  ['Stress / resilience', /\bstress\b|resilience|cortisol|burnout|adrenal support|high-pressure|type-a/i],
  ['Broad sleep', /\bsleep\b|\binsomnia\b|\bsleeping\b/i],
  ['Supplement safety / quality', /safety|safe|quality|evaluate|effectiveness|sourcing standards/i],
]

function clusterOf(query) {
  for (const [name, regex] of CLUSTERS) if (regex.test(query)) return name
  return 'Other'
}

function analyzeQueries(candidate, overviewTotal) {
  if (!candidate) return null
  const { queryKey, citationsKey, intentKey, topicKey, shareKey } = candidate.keys
  const rows = candidate.rows.map((row) => {
    const query = String(row[queryKey] ?? '').trim()
    const citations = number(row[citationsKey])
    const citationShare = shareKey ? number(row[shareKey]) : 0
    const intent = intentKey ? String(row[intentKey] ?? '').trim() : ''
    const topic = topicKey ? String(row[topicKey] ?? '').trim() : ''
    const intentWeight = INTENT_WEIGHT.get(norm(intent)) ?? 0.9
    return {
      query,
      citations,
      citationShare,
      intent: intent || null,
      topic: topic || null,
      cluster: clusterOf(query),
      roiProxy: round(citations * (citationShare / 100) * intentWeight, 2),
    }
  }).filter((row) => row.query)

  const totalCitations = rows.reduce((sum, row) => sum + row.citations, 0)
  const aggregate = (key) => {
    const map = new Map()
    for (const row of rows) {
      const label = row[key] || 'Unknown'
      const entry = map.get(label) ?? { label, citations: 0, queries: 0 }
      entry.citations += row.citations
      entry.queries += 1
      map.set(label, entry)
    }
    return [...map.values()].sort((a, b) => b.citations - a.citations)
  }

  return {
    source: path.basename(candidate.file),
    queryCount: rows.length,
    queryCitations: totalCitations,
    overviewCoveragePct: overviewTotal ? round((totalCitations / overviewTotal) * 100, 1) : null,
    topQueries: [...rows].sort((a, b) => b.citations - a.citations).slice(0, 50),
    topRoiProxy: [...rows].sort((a, b) => b.roiProxy - a.roiProxy).slice(0, 50),
    clusters: aggregate('cluster'),
    topics: aggregate('topic'),
    intents: aggregate('intent'),
  }
}

function renderMarkdown(report) {
  const lines = ['# AI query opportunity report', '', `Generated ${report.generatedAt}.`, '']
  if (report.overview) {
    const o = report.overview
    lines.push(
      '## Visibility trend', '',
      `- Window: ${o.startDate} → ${o.endDate} (${o.dayCount} days)`,
      `- Total citations: **${o.totalCitations.toLocaleString()}**`,
      `- Latest day: **${o.latestDailyCitations.toLocaleString()} citations** across **${o.latestCitedPages} cited pages**`,
      `- Last-7-day average: **${o.last7AverageCitations.toLocaleString()}/day** vs **${o.first7AverageCitations.toLocaleString()}/day** in the first seven days (**${o.last7VsFirst7Pct}%**)`,
      `- Last-7-day cited-page breadth: **${o.last7AverageCitedPages} pages/day** vs **${o.first7AverageCitedPages}** initially (**${o.last7BreadthVsFirst7Pct}%**)`,
      '',
    )
  }
  if (report.queries) {
    const q = report.queries
    lines.push(
      '## Query demand', '',
      `The query export contains **${q.queryCitations.toLocaleString()} citations across ${q.queryCount} grounding queries**${q.overviewCoveragePct != null ? `, equal to ${q.overviewCoveragePct}% of the overview citation total. Treat it as a surfaced-query subset rather than a complete citation ledger.` : '.'}`,
      '',
      '### Primary clusters', '',
      '| Cluster | Citations | Queries |', '| --- | ---: | ---: |',
      ...q.clusters.map((row) => `| ${row.label} | ${row.citations.toLocaleString()} | ${row.queries} |`),
      '',
      '### Highest-volume queries', '',
      '| Query | Intent | Citations | Citation share |', '| --- | --- | ---: | ---: |',
      ...q.topQueries.slice(0, 20).map((row) => `| ${row.query.replace(/\|/g, '\\|')} | ${row.intent ?? '—'} | ${row.citations.toLocaleString()} | ${row.citationShare}% |`),
      '',
      '### Highest ROI-proxy queries', '',
      'ROI proxy = citations × citation share × intent weight. It is a prioritization aid, not revenue attribution.', '',
      '| Query | Intent | Citations | Share | ROI proxy |', '| --- | --- | ---: | ---: | ---: |',
      ...q.topRoiProxy.slice(0, 20).map((row) => `| ${row.query.replace(/\|/g, '\\|')} | ${row.intent ?? '—'} | ${row.citations.toLocaleString()} | ${row.citationShare}% | ${row.roiProxy} |`),
      '',
    )
  }
  lines.push(
    '## Operating rule', '',
    'Use these clusters to strengthen existing canonical pages and comparison hubs. Do **not** create one thin page per grounding-query variant. Preserve evidence, safety, canonical, and review gates; measure subsequent citation velocity and breadth against this baseline.', '',
  )
  return `${lines.join('\n')}\n`
}

function main() {
  const { overview, query } = selectCandidates(INPUT_DIR)
  if (!overview && !query) {
    console.error(`No usable Bing AI Performance CSVs found in ${INPUT_DIR}`)
    process.exitCode = 1
    return
  }
  const overviewReport = analyzeOverview(overview)
  const queryReport = analyzeQueries(query, overviewReport?.totalCitations ?? null)
  const report = {
    generatedAt: new Date().toISOString(),
    inputDir: path.relative(ROOT, INPUT_DIR),
    overview: overviewReport,
    queries: queryReport,
  }
  mkdirSync(OUTPUT_DIR, { recursive: true })
  writeFileSync(JSON_PATH, `${JSON.stringify(report, null, 2)}\n`)
  writeFileSync(MD_PATH, renderMarkdown(report))
  console.log(renderMarkdown(report))
  console.log(`Wrote ${path.relative(ROOT, JSON_PATH)} and ${path.relative(ROOT, MD_PATH)}`)
}

main()
