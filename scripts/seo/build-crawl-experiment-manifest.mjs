#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const EXPECTED_TOTAL = 97
const TREATMENT_N = 20
const CONTROL_N = 20
const DEFAULT_SEED = 'request-indexing-rct-2026-08-27-v1'
const DEFAULT_OUTPUT = 'experiments/crawl-request-indexing/manifest.json'

function parseArgs(argv) {
  const args = {}
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]
    if (!token.startsWith('--')) continue
    const [rawKey, inlineValue] = token.slice(2).split('=', 2)
    args[rawKey] = inlineValue ?? argv[index + 1]
    if (inlineValue === undefined) index += 1
  }
  return args
}

function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    const next = text[index + 1]
    if (char === '"' && quoted && next === '"') {
      field += '"'
      index += 1
    } else if (char === '"') {
      quoted = !quoted
    } else if (char === ',' && !quoted) {
      row.push(field)
      field = ''
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') index += 1
      row.push(field)
      field = ''
      if (row.some((value) => value.trim())) rows.push(row)
      row = []
    } else {
      field += char
    }
  }
  row.push(field)
  if (row.some((value) => value.trim())) rows.push(row)
  if (rows.length < 2) return []

  const headers = rows[0].map((value) => value.trim())
  return rows.slice(1).map((values) =>
    Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])),
  )
}

function parseInput(filePath) {
  const text = readFileSync(filePath, 'utf8')
  if (/\.csv$/i.test(filePath)) return parseCsv(text)

  const parsed = JSON.parse(text)
  if (Array.isArray(parsed)) return parsed
  if (Array.isArray(parsed.entries)) return parsed.entries
  if (Array.isArray(parsed.urls)) return parsed.urls.map((url) => ({ url }))
  if (Array.isArray(parsed.urlList)) return parsed.urlList.map((url) => ({ url }))
  throw new Error('Input must be a CSV, an array, or JSON containing entries/urls/urlList')
}

function pick(row, names) {
  for (const name of names) {
    if (row[name] !== undefined && String(row[name]).trim()) return String(row[name]).trim()
  }
  return null
}

function normalizePathname(value) {
  if (!value) return null
  try {
    const url = value.startsWith('http') ? new URL(value) : null
    value = url ? url.pathname : value
  } catch {
    return null
  }
  const pathOnly = value.split(/[?#]/)[0]
  const withSlash = pathOnly.startsWith('/') ? pathOnly : `/${pathOnly}`
  return withSlash.length > 1 ? withSlash.replace(/\/+$/, '') : '/'
}

function normalizeDate(value) {
  if (!value) return null
  const timestamp = Date.parse(value)
  if (!Number.isFinite(timestamp)) return null
  return new Date(timestamp).toISOString()
}

function lastmodBlock(value, now = new Date()) {
  if (!value) return 'unknown'
  const timestamp = Date.parse(value)
  if (!Number.isFinite(timestamp)) return 'unknown'
  const ageDays = Math.max(0, (now.getTime() - timestamp) / 86_400_000)
  if (ageDays <= 7) return '0-7d'
  if (ageDays <= 30) return '8-30d'
  if (ageDays <= 90) return '31-90d'
  return '91d+'
}

function hashRank(seed, namespace, pathname) {
  return createHash('sha256').update(`${seed}\0${namespace}\0${pathname}`).digest('hex')
}

function loadHerbRecords() {
  const filePath = path.resolve('public/data/herbs.json')
  const parsed = JSON.parse(readFileSync(filePath, 'utf8'))
  if (!Array.isArray(parsed)) throw new Error('public/data/herbs.json must be an array')
  return new Map(parsed.filter((row) => row && row.slug).map((row) => [String(row.slug), row]))
}

const VOLATILE_KEYS = new Set([
  'lastUpdated', 'updatedAt', 'last_updated', 'last_reviewed', 'updated_at', 'reviewedAt',
  'dateModified', 'generated_at', 'generatedAt', 'build_timestamp', 'buildTimestamp',
])

function stableContent(value) {
  if (Array.isArray(value)) return value.map(stableContent)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(
    Object.keys(value)
      .filter((key) => !VOLATILE_KEYS.has(key))
      .sort()
      .map((key) => [key, stableContent(value[key])]),
  )
}

function contentHash(record) {
  return createHash('sha256').update(JSON.stringify(stableContent(record))).digest('hex')
}

function deriveRecordLastmod(record) {
  for (const key of ['lastUpdated', 'updatedAt', 'last_updated', 'last_reviewed', 'updated_at', 'reviewedAt', 'dateModified']) {
    const normalized = normalizeDate(record?.[key])
    if (normalized) return normalized
  }
  return null
}

function assignArms(selected, seed) {
  const blockCounts = new Map()
  let treatment = 0
  let control = 0

  const ordered = [...selected].sort((a, b) =>
    hashRank(seed, 'arm', a.pathname).localeCompare(hashRank(seed, 'arm', b.pathname)),
  )

  for (const entry of ordered) {
    const counts = blockCounts.get(entry.lastmod_block) ?? { treatment: 0, control: 0 }
    let arm
    if (treatment >= TREATMENT_N) arm = 'control'
    else if (control >= CONTROL_N) arm = 'treatment'
    else if (counts.treatment < counts.control) arm = 'treatment'
    else if (counts.control < counts.treatment) arm = 'control'
    else arm = hashRank(seed, 'tie', entry.pathname).at(-1) < '8' ? 'treatment' : 'control'

    if (arm === 'treatment') {
      treatment += 1
      counts.treatment += 1
    } else {
      control += 1
      counts.control += 1
    }
    blockCounts.set(entry.lastmod_block, counts)
    entry.arm = arm
  }

  if (treatment !== TREATMENT_N || control !== CONTROL_N) {
    throw new Error(`Assignment failed: treatment=${treatment}, control=${control}`)
  }
}

const args = parseArgs(process.argv.slice(2))
if (!args.input) {
  console.error('Usage: node scripts/seo/build-crawl-experiment-manifest.mjs --input <eligible-97.csv|json> [--output path] [--seed value]')
  process.exit(2)
}

const seed = args.seed || DEFAULT_SEED
const rows = parseInput(path.resolve(args.input))
const herbs = loadHerbRecords()
const normalized = rows.map((row) => {
  const rawUrl = typeof row === 'string' ? row : pick(row, ['url', 'URL', 'inspectionUrl', 'inspection_url', 'pathname', 'Path'])
  const pathname = normalizePathname(rawUrl)
  if (!pathname || !/^\/herbs\/[^/]+$/.test(pathname)) {
    throw new Error(`Registry row is not a canonical herb path: ${rawUrl ?? '(missing URL)'}`)
  }
  const slug = pathname.split('/').filter(Boolean).at(-1)
  const record = herbs.get(slug)
  if (!record) throw new Error(`No current herb record for ${pathname}`)

  const suppliedLastmod = typeof row === 'string' ? null : pick(row, ['baseline_lastmod', 'lastmod', 'Lastmod', 'last_mod'])
  const baselineLastmod = normalizeDate(suppliedLastmod) ?? deriveRecordLastmod(record)
  const baselineLastCrawled = typeof row === 'string' ? null : normalizeDate(pick(row, ['baseline_last_crawled', 'last_crawled', 'lastCrawled', 'Last crawl', 'last crawl']))
  const suppliedBlock = typeof row === 'string' ? null : pick(row, ['lastmod_block', 'lastmodBlock'])

  return {
    pathname,
    arm: 'observational',
    lastmod_block: suppliedBlock ?? lastmodBlock(baselineLastmod),
    baseline_last_crawled: baselineLastCrawled,
    baseline_lastmod: baselineLastmod,
    baseline_content_sha256: contentHash(record),
  }
})

const deduped = new Map(normalized.map((entry) => [entry.pathname, entry]))
if (deduped.size !== normalized.length) throw new Error('Registry contains duplicate URLs')
if (normalized.length !== EXPECTED_TOTAL) {
  throw new Error(`Expected exactly ${EXPECTED_TOTAL} eligible herb URLs; received ${normalized.length}`)
}

const selectedPaths = new Set(
  [...normalized]
    .sort((a, b) => hashRank(seed, 'sample', a.pathname).localeCompare(hashRank(seed, 'sample', b.pathname)))
    .slice(0, TREATMENT_N + CONTROL_N)
    .map((entry) => entry.pathname),
)
const selected = normalized.filter((entry) => selectedPaths.has(entry.pathname))
assignArms(selected, seed)

const start = new Date()
const end = new Date(start.getTime() + 28 * 86_400_000)
const output = {
  schema_version: 1,
  experiment_id: 'request-indexing-rct-2026-08',
  status: 'active',
  site: 'https://thehippiescientist.net',
  created_at: new Date().toISOString(),
  registry_source: { kind: 'gsc_eligible_herb_registry', expected_total: EXPECTED_TOTAL },
  design: {
    treatment: 'request_indexing', treatment_n: TREATMENT_N,
    control: 'randomized_no_request', control_n: CONTROL_N,
    observational: 'untouched_background_surveillance', observational_n: EXPECTED_TOTAL - TREATMENT_N - CONTROL_N,
    causal_control: 'control', primary_outcome: 'time_to_first_verified_googlebot_html_recrawl', followup_days: 28,
  },
  randomization: { algorithm: 'sha256_rank_then_block_balanced_assignment_v1', seed },
  freeze: {
    duration_days: 28,
    applies_to_arms: ['treatment', 'control'],
    rules: ['no_substantive_edits', 'no_canonical_owner_changes', 'no_indexability_changes', 'no_legitimate_lastmod_changes'],
    starts_at: start.toISOString(),
    ends_at: end.toISOString(),
  },
  entries: normalized.sort((a, b) => a.pathname.localeCompare(b.pathname)),
}

const outputPath = path.resolve(args.output || DEFAULT_OUTPUT)
writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`)
console.log(`Wrote ${outputPath}: treatment=20 control=20 observational=57`)
