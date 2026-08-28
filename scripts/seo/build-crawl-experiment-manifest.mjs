#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import {
  FREEZE_POLICY_PATHS,
  freezePolicyHash,
  normalizePathname,
  readBuiltSitemap,
  snapshotBuiltHerb,
} from './crawl-experiment-build-snapshot.mjs'

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
    if (rawKey === 'skip-site-build') {
      args[rawKey] = true
      continue
    }
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
  if (/\.csv$/i.test(filePath)) return { rows: parseCsv(text), raw: text }
  const parsed = JSON.parse(text)
  if (Array.isArray(parsed)) return { rows: parsed, raw: text }
  if (Array.isArray(parsed.entries)) return { rows: parsed.entries, raw: text }
  if (Array.isArray(parsed.urls)) return { rows: parsed.urls.map((url) => ({ url })), raw: text }
  if (Array.isArray(parsed.urlList)) return { rows: parsed.urlList.map((url) => ({ url })), raw: text }
  throw new Error('Input must be a CSV, an array, or JSON containing entries/urls/urlList')
}

function pick(row, names) {
  for (const name of names) {
    if (row?.[name] !== undefined && String(row[name]).trim()) return String(row[name]).trim()
  }
  return null
}

function normalizeDate(value) {
  if (!value) return null
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null
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

    entry.arm = arm
    if (arm === 'treatment') {
      treatment += 1
      counts.treatment += 1
    } else {
      control += 1
      counts.control += 1
    }
    blockCounts.set(entry.lastmod_block, counts)
  }
  if (treatment !== TREATMENT_N || control !== CONTROL_N) {
    throw new Error(`Assignment failed: treatment=${treatment}, control=${control}`)
  }
}

function assignPairs(entries, seed) {
  const treatments = entries
    .filter((entry) => entry.arm === 'treatment')
    .sort((a, b) => hashRank(seed, 'pair-treatment', a.pathname).localeCompare(hashRank(seed, 'pair-treatment', b.pathname)))
  const controls = entries
    .filter((entry) => entry.arm === 'control')
    .sort((a, b) => hashRank(seed, 'pair-control', a.pathname).localeCompare(hashRank(seed, 'pair-control', b.pathname)))
  const unused = new Set(controls)

  treatments.forEach((treatment, index) => {
    const sameBlock = controls.find((control) => unused.has(control) && control.lastmod_block === treatment.lastmod_block)
    const control = sameBlock ?? controls.find((candidate) => unused.has(candidate))
    if (!control) throw new Error(`Unable to pair treatment ${treatment.pathname}`)
    unused.delete(control)
    const pairId = `pair-${String(index + 1).padStart(2, '0')}`
    treatment.pair_id = pairId
    control.pair_id = pairId
  })
}

function runProductionBuild() {
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
  execFileSync(npm, ['run', 'build'], { stdio: 'inherit' })
}

const args = parseArgs(process.argv.slice(2))
if (!args.input) {
  console.error('Usage: node scripts/seo/build-crawl-experiment-manifest.mjs --input <eligible-97.csv|json> [--output path] [--seed value] [--build-dir out] [--skip-site-build]')
  process.exit(2)
}

const inputPath = path.resolve(args.input)
if (!existsSync(inputPath)) throw new Error(`Registry input not found: ${inputPath}`)
const { rows, raw } = parseInput(inputPath)
const normalizedRows = rows.map((row) => {
  const rawUrl = typeof row === 'string' ? row : pick(row, ['url', 'URL', 'inspectionUrl', 'inspection_url', 'pathname', 'Path'])
  const pathname = normalizePathname(rawUrl)
  if (!pathname || !/^\/herbs\/[^/]+$/.test(pathname)) {
    throw new Error(`Registry row is not a canonical herb path: ${rawUrl ?? '(missing URL)'}`)
  }
  const baselineLastCrawled = typeof row === 'string'
    ? null
    : normalizeDate(pick(row, ['baseline_last_crawled', 'last_crawled', 'lastCrawled', 'Last crawl', 'last crawl']))
  return { pathname, baseline_last_crawled: baselineLastCrawled }
})

if (normalizedRows.length !== EXPECTED_TOTAL) {
  throw new Error(`Expected exactly ${EXPECTED_TOTAL} eligible herb URLs; received ${normalizedRows.length}`)
}
if (new Set(normalizedRows.map((entry) => entry.pathname)).size !== EXPECTED_TOTAL) {
  throw new Error('Registry contains duplicate URLs')
}

if (!args['skip-site-build']) runProductionBuild()
const buildDir = path.resolve(args['build-dir'] || 'out')
const sitemap = readBuiltSitemap(buildDir)
const preparedAt = new Date()
const entries = normalizedRows.map((row) => {
  const snapshot = snapshotBuiltHerb(row.pathname, buildDir, sitemap)
  return {
    pathname: row.pathname,
    arm: 'observational',
    pair_id: null,
    lastmod_block: lastmodBlock(snapshot.baseline_lastmod, preparedAt),
    baseline_last_crawled: row.baseline_last_crawled,
    baseline_lastmod: snapshot.baseline_lastmod,
    baseline_rendered_sha256: snapshot.rendered_sha256,
    baseline_canonical_url: snapshot.canonical_url,
    experiment_t0: null,
    treatment_requested_at: null,
  }
})

const seed = args.seed || DEFAULT_SEED
const selectedPaths = new Set(
  [...entries]
    .sort((a, b) => hashRank(seed, 'sample', a.pathname).localeCompare(hashRank(seed, 'sample', b.pathname)))
    .slice(0, TREATMENT_N + CONTROL_N)
    .map((entry) => entry.pathname),
)
const selected = entries.filter((entry) => selectedPaths.has(entry.pathname))
assignArms(selected, seed)
assignPairs(selected, seed)

const output = {
  schema_version: 2,
  experiment_id: 'request-indexing-rct-2026-08',
  status: 'prepared',
  site: 'https://thehippiescientist.net',
  created_at: '2026-08-27',
  prepared_at: preparedAt.toISOString(),
  activated_at: null,
  fully_activated_at: null,
  completed_at: null,
  registry_source: {
    kind: 'gsc_eligible_herb_registry',
    expected_total: EXPECTED_TOTAL,
    source_file: path.basename(inputPath),
    source_sha256: createHash('sha256').update(raw).digest('hex'),
  },
  design: {
    treatment: 'request_indexing',
    treatment_n: TREATMENT_N,
    control: 'randomized_no_request',
    control_n: CONTROL_N,
    observational: 'untouched_background_surveillance',
    observational_n: EXPECTED_TOTAL - TREATMENT_N - CONTROL_N,
    causal_control: 'control',
    primary_outcome: 'time_from_pair_experiment_t0_to_first_verified_googlebot_html_recrawl',
    followup_days: 28,
  },
  randomization: {
    algorithm: 'sha256_rank_then_lastmod_block_balanced_pairing_v2',
    seed,
  },
  freeze: {
    duration_days: 28,
    applies_to_arms: ['treatment', 'control'],
    rules: ['no_substantive_edits', 'no_canonical_owner_changes', 'no_indexability_changes', 'no_legitimate_lastmod_changes'],
    baseline_captured_at: preparedAt.toISOString(),
    starts_at: null,
    ends_at: null,
    policy_sha256: freezePolicyHash(),
    policy_paths: FREEZE_POLICY_PATHS,
  },
  entries: entries.sort((a, b) => a.pathname.localeCompare(b.pathname)),
}

const outputPath = path.resolve(args.output || DEFAULT_OUTPUT)
writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`)
console.log(`Prepared ${outputPath}: treatment=20 control=20 observational=57; treatment has NOT started.`)
