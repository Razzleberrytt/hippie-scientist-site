#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const argv = process.argv.slice(2)
const flag = (name, fallback = null) => {
  const hit = argv.find((arg) => arg === `--${name}` || arg.startsWith(`--${name}=`))
  if (!hit) return fallback
  const [, value] = hit.split('=')
  return value ?? true
}

const input = path.resolve(process.cwd(), String(flag('input', 'data-sources/ai-performance/search-queries.csv')))
const outDir = path.resolve(process.cwd(), String(flag('out', 'ops/reports')))
const reportDate = String(flag('date', new Date().toISOString().slice(0, 10)))
const jsonPath = path.join(outDir, 'ai-citation-priority-queue.json')
const mdPath = path.join(outDir, 'ai-citation-priority-queue.md')

function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i]
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i += 1 }
      else if (c === '"') quoted = false
      else field += c
    } else if (c === '"') quoted = true
    else if (c === ',') { row.push(field); field = '' }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = '' }
    else if (c !== '\r') field += c
  }
  if (field || row.length) { row.push(field); rows.push(row) }
  return rows.filter((r) => r.some((v) => String(v).trim()))
}

const norm = (v) => String(v ?? '').trim().toLowerCase()
const num = (v) => {
  const n = Number.parseFloat(String(v ?? '').replace(/[,%\s]/g, ''))
  return Number.isFinite(n) ? n : null
}

const aliases = {
  query: ['grounding query', 'query', 'search query'],
  citations: ['citations', 'citation count', 'ai citations'],
  share: ['citation share', 'share'],
  intent: ['intent'],
  topic: ['topic'],
}

function findHeader(headers, names) {
  return headers.find((h) => names.includes(norm(h))) ?? null
}

const CLUSTERS = [
  ['Sleep', /\bsleep\b|\binsomnia\b|\bsleeping\b/i],
  ['Valerian sleep', /\bvalerian\b/i],
  ['Glycine sleep', /\bglycine\b/i],
  ['Anxiety / calm', /\banxiety\b|racing thoughts|calming herbs|herbal remedies/i],
  ['Stress / resilience', /\bstress\b|resilience|cortisol|burnout/i],
  ['Mushroom coffee', /mushroom coffee/i],
]
const clusterOf = (q) => CLUSTERS.find(([, re]) => re.test(q))?.[0] ?? 'Other'

function modeFor(citations, share) {
  if (share == null || share <= 0) return 'Unknown'
  if (share >= 30) return 'Defend'
  if (share < 10) return citations >= 20 ? 'Expand' : 'Monitor'
  return citations >= 100 ? 'Defend + expand' : 'Expand'
}

if (!existsSync(input)) {
  console.error(`Missing Bing AI Search Query export: ${input}`)
  process.exit(1)
}

const rows = parseCsv(readFileSync(input, 'utf8'))
if (rows.length < 2) throw new Error('The query export contains no data rows.')
const headers = rows[0].map((h) => String(h).trim())
const keys = Object.fromEntries(Object.entries(aliases).map(([name, names]) => [name, findHeader(headers, names)]))
if (!keys.query || !keys.citations) throw new Error('Expected Grounding Query and Citations columns were not found.')

const data = rows.slice(1).map((cells) => Object.fromEntries(headers.map((h, i) => [h, cells[i] ?? ''])))
const scored = data.map((row) => {
  const query = String(row[keys.query] ?? '').trim()
  const citations = num(row[keys.citations]) ?? 0
  const share = keys.share ? num(row[keys.share]) : null
  const intent = keys.intent ? String(row[keys.intent] ?? '').trim() || null : null
  const topic = keys.topic ? String(row[keys.topic] ?? '').trim() || null : null
  const impliedPool = share && share > 0 ? citations / (share / 100) : null
  const headroom = impliedPool != null ? Math.max(0, impliedPool - citations) : null
  const headroomPct = share != null ? Math.max(0, 100 - share) : null
  const cluster = clusterOf(query)
  const mode = modeFor(citations, share)
  const volumeScore = Math.min(1, Math.log10(citations + 1) / 4)
  const headroomScore = headroomPct == null ? 0 : headroomPct / 100
  const clusterBonus = cluster === 'Sleep' || cluster === 'Valerian sleep' || cluster === 'Glycine sleep' ? 1.15 : 1
  const expectedUpside = Math.round((headroomScore * 0.7 + volumeScore * 0.3) * clusterBonus * 1000) / 1000
  return {
    query, citations, citationShare: share, impliedCitationPool: impliedPool == null ? null : Math.round(impliedPool * 10) / 10,
    estimatedHeadroom: headroom == null ? null : Math.round(headroom * 10) / 10,
    estimatedHeadroomPct: headroomPct == null ? null : Math.round(headroomPct * 10) / 10,
    cluster, intent, topic, mode, expectedCitationUpside: expectedUpside,
    targetUrl: null,
    targetUrlStatus: 'Unknown — query export has no page-level attribution',
    recommendedAction: mode === 'Defend' ? 'Strengthen evidence, answer extraction, freshness, and internal authority links on the verified canonical winner.' : mode === 'Defend + expand' ? 'Defend the verified winner, then strengthen adjacent distinct intents without creating doorway pages.' : mode === 'Expand' ? 'Identify the verified canonical target, then fill the distinct evidence/comparison gap and reinforce internal links.' : 'Hold for more telemetry before content work.',
  }
}).filter((r) => r.query)

scored.sort((a, b) => b.expectedCitationUpside - a.expectedCitationUpside || b.citations - a.citations || a.query.localeCompare(b.query))
const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  reportDate,
  source: { path: path.relative(process.cwd(), input), kind: 'Bing AI Search Queries / grounding export', pageLevelAttributionAvailable: false },
  governance: { noInventedUrls: true, scientificEvidenceGatesUnchanged: true, purpose: 'prioritization only; not revenue attribution' },
  summary: { queryCount: scored.length, citations: scored.reduce((s, r) => s + r.citations, 0), defend: scored.filter((r) => r.mode.includes('Defend')).length, expand: scored.filter((r) => r.mode === 'Expand' || r.mode === 'Defend + expand').length },
  queue: scored,
}

mkdirSync(outDir, { recursive: true })
writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`)
const lines = [
  '# AI citation priority queue', '',
  `Report date: **${reportDate}**`,
  `Source: \`${report.source.path}\``, '',
  `**${report.summary.queryCount}** queries · **${report.summary.citations.toLocaleString()}** citations · **${report.summary.defend}** defend candidates · **${report.summary.expand}** expand candidates`, '',
  '> Query-only exports do not establish page ownership. Target URLs remain Unknown until verified from page-level telemetry or a deterministic site/query mapping.', '',
  '| Rank | Query | Cluster | Citations | Share | Headroom | Mode |',
  '| ---: | --- | --- | ---: | ---: | ---: | --- |',
  ...scored.slice(0, 50).map((r, i) => `| ${i + 1} | ${r.query.replace(/\|/g, '\\|')} | ${r.cluster} | ${r.citations.toLocaleString()} | ${r.citationShare == null ? '—' : `${r.citationShare}%`} | ${r.estimatedHeadroom == null ? '—' : r.estimatedHeadroom.toLocaleString()} | ${r.mode} |`),
  '', '## Enrichment guardrails', '',
  '- Prefer evidence-rich, structured answers, explicit comparisons, freshness, and clear source provenance.',
  '- Strengthen existing canonical winners before creating new routes.',
  '- Create a new page only for a genuinely distinct user decision or evidence question.',
  '- Do not infer causation from a single report or promise zero negative citation days.',
  '- Keep safety, scientific, accessibility, canonical, and release gates unchanged.',
]
writeFileSync(mdPath, `${lines.join('\n')}\n`)
console.log(JSON.stringify({ jsonPath, mdPath, queryCount: report.summary.queryCount }, null, 2))
