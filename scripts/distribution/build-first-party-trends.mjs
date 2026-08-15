#!/usr/bin/env node
/**
 * Build monthly first-party research trend reports from pre-aggregated activity.
 *
 * Input intentionally contains no user IDs and no raw free-text health queries.
 * Supported row types:
 *   search        key = canonical ingredient/topic slug
 *   comparison    key = canonical-a|canonical-b
 *   interaction   key = canonical-a|canonical-b (ingredient entities only)
 *   evidence-upgrade / evidence-controversy = editorial aggregate signals
 */
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const inputPath = path.resolve(process.argv[2] || 'data/analytics/research-activity.json')
const outDir = path.resolve(process.env.RESEARCH_TRENDS_OUTPUT || 'artifacts/research-trends')
const minPublicCount = Math.max(3, Number(process.env.RESEARCH_TRENDS_MIN_COUNT || 5))

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return fallback }
}
function validPeriod(value) { return /^\d{4}-(0[1-9]|1[0-2])$/.test(String(value || '')) }
function canonicalKey(value) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9|._-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}
function previousPeriod(period) {
  const [year, month] = period.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 2, 1))
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}
function top(rows, type, period, limit = 10) {
  return rows
    .filter((row) => row.type === type && row.period === period && row.count >= minPublicCount)
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key))
    .slice(0, limit)
    .map(({ key, count }) => ({ key, count }))
}
function fastestGrowing(rows, period, types = ['search','comparison','interaction']) {
  const prior = previousPeriod(period)
  const current = new Map()
  const previous = new Map()
  for (const row of rows) {
    if (!types.includes(row.type)) continue
    const id = `${row.type}:${row.key}`
    if (row.period === period) current.set(id, row)
    if (row.period === prior) previous.set(id, row)
  }
  const result = []
  for (const [id, row] of current) {
    const oldCount = previous.get(id)?.count || 0
    if (row.count < minPublicCount) continue
    const absoluteGrowth = row.count - oldCount
    const growthPct = oldCount > 0 ? (absoluteGrowth / oldCount) * 100 : null
    if (absoluteGrowth <= 0) continue
    result.push({ type: row.type, key: row.key, count: row.count, previousCount: oldCount, absoluteGrowth, growthPct: growthPct == null ? null : Number(growthPct.toFixed(1)) })
  }
  return result.sort((a, b) => b.absoluteGrowth - a.absoluteGrowth || (b.growthPct ?? 9999) - (a.growthPct ?? 9999)).slice(0, 15)
}

const input = readJson(inputPath, null)
if (!input || !Array.isArray(input.rows)) throw new Error('research activity input must contain a rows array')
if (input.privacy?.containsUserIds === true || input.privacy?.containsRawHealthQueries === true) {
  throw new Error('privacy gate: user-level identifiers or raw health queries are not permitted in research trend input')
}

const allowedTypes = new Set(['search','comparison','interaction','evidence-upgrade','evidence-controversy'])
const rows = []
const errors = []
for (const [index, raw] of input.rows.entries()) {
  const type = String(raw.type || '')
  const period = String(raw.period || '')
  const key = canonicalKey(raw.key)
  const count = Number(raw.count)
  if (!allowedTypes.has(type)) { errors.push(`[${index}] unsupported type ${type}`); continue }
  if (!validPeriod(period)) { errors.push(`[${index}] invalid period ${period}`); continue }
  if (!key || /\s/.test(key)) { errors.push(`[${index}] key must be a canonical aggregate slug/pair`); continue }
  if (!Number.isInteger(count) || count < 0) { errors.push(`[${index}] count must be a non-negative integer`); continue }
  if ((type === 'comparison' || type === 'interaction') && key.split('|').filter(Boolean).length !== 2) {
    errors.push(`[${index}] ${type} keys must contain exactly two canonical entities joined by |`)
    continue
  }
  rows.push({ type, period, key, count })
}
if (errors.length) {
  console.error(`[research-trends] ${errors.length} validation error(s)`)
  errors.forEach((error) => console.error(`[research-trends]   ${error}`))
  process.exit(1)
}

const periods = [...new Set(rows.map((row) => row.period))].sort()
const period = process.env.RESEARCH_TRENDS_PERIOD || periods.at(-1) || new Date().toISOString().slice(0, 7)
const report = {
  generatedAt: new Date().toISOString(),
  period,
  status: rows.length ? 'review-required' : 'no-data',
  privacy: {
    aggregationOnly: true,
    minimumPublishedCount: minPublicCount,
    userIdentifiersPublished: false,
    rawHealthQueriesPublished: false,
  },
  mostSearched: top(rows, 'search', period),
  mostCompared: top(rows, 'comparison', period),
  mostCheckedInteractions: top(rows, 'interaction', period),
  fastestGrowingResearchTopics: fastestGrowing(rows, period),
  mostImprovedEvidence: top(rows, 'evidence-upgrade', period),
  mostControversialEvidence: top(rows, 'evidence-controversy', period),
  publicationRule: 'Publish only aggregate rows meeting the minimum-count threshold; never publish user-level activity or raw health/medication queries.',
}

fs.mkdirSync(outDir, { recursive: true })
const jsonPath = path.join(outDir, `${period}.json`)
const mdPath = path.join(outDir, `${period}.md`)
fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`)

function section(title, values, formatter = (row) => `${row.key} — ${row.count}`) {
  return `## ${title}\n\n${values.length ? values.map((row, i) => `${i + 1}. ${formatter(row)}`).join('\n') : '_No publishable aggregate data for this period._'}\n`
}
const markdown = `# Research trends — ${period}\n\n**Status:** ${report.status}  \n**Privacy floor:** at least ${minPublicCount} aggregate events per published row.\n\n${section('Most searched supplements / topics', report.mostSearched)}\n${section('Most compared supplements', report.mostCompared)}\n${section('Most checked ingredient interactions', report.mostCheckedInteractions)}\n${section('Fastest-growing research topics', report.fastestGrowingResearchTopics, (row) => `${row.type}: ${row.key} — ${row.count} (${row.absoluteGrowth >= 0 ? '+' : ''}${row.absoluteGrowth} vs prior month${row.growthPct == null ? '' : `, ${row.growthPct}%`})`)}\n${section('Most improved evidence', report.mostImprovedEvidence)}\n${section('Most controversial evidence', report.mostControversialEvidence)}\n## Publication note\n\nThis report contains aggregate, non-sensitive usage signals only. It must not be expanded with user-level search strings, medication names tied to users, IP addresses, or other identifiable/sensitive event data.\n`
fs.writeFileSync(mdPath, markdown)
console.log(`[research-trends] ${period}: searches=${report.mostSearched.length}, comparisons=${report.mostCompared.length}, interactions=${report.mostCheckedInteractions.length}`)
console.log(`[research-trends] output: ${path.relative(root, jsonPath)}`)
