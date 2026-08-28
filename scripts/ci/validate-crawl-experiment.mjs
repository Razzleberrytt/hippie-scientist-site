#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import path from 'node:path'
import {
  FREEZE_POLICY_PATHS,
  freezePolicyHash,
  readBuiltSitemap,
  snapshotBuiltHerb,
} from '../seo/crawl-experiment-build-snapshot.mjs'

const MANIFEST_PATH = path.resolve('experiments/crawl-request-indexing/manifest.json')
const EXPECTED = { treatment: 20, control: 20, observational: 57 }
const RANDOMIZED_ARMS = new Set(['treatment', 'control'])

function parseArgs(argv) {
  const args = {}
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]
    if (!token.startsWith('--')) continue
    const [key, inlineValue] = token.slice(2).split('=', 2)
    if (key === 'structural-only') {
      args[key] = true
      continue
    }
    args[key] = inlineValue ?? argv[index + 1]
    if (inlineValue === undefined) index += 1
  }
  return args
}

function fail(message) {
  console.error(`[crawl-experiment] FAIL: ${message}`)
  process.exitCode = 1
}

function timestamp(value) {
  const parsed = Date.parse(value ?? '')
  return Number.isFinite(parsed) ? parsed : null
}

function sameNullable(a, b) {
  return (a ?? null) === (b ?? null)
}

const args = parseArgs(process.argv.slice(2))
const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'))
const entries = Array.isArray(manifest.entries) ? manifest.entries : []
const allowedStatuses = ['pending_registry', 'prepared', 'activating', 'active', 'completed']

if (manifest.schema_version !== 2) fail('schema_version must be 2')
if (!allowedStatuses.includes(manifest.status)) fail(`unsupported status: ${manifest.status}`)
if (manifest.registry_source?.expected_total !== 97) fail('registry_source.expected_total must be 97')
if (manifest.design?.treatment_n !== 20 || manifest.design?.control_n !== 20 || manifest.design?.observational_n !== 57) {
  fail('design must remain 20 treatment / 20 randomized control / 57 observational')
}
if (manifest.design?.causal_control !== 'control') fail('only the randomized control arm may be labeled causal control')
if (manifest.freeze?.duration_days !== 28) fail('freeze duration must remain 28 days')

if (manifest.status === 'pending_registry') {
  if (entries.length !== 0) fail('pending_registry manifest must have no assigned entries')
  if (!process.exitCode) console.log('[crawl-experiment] PASS (pending registry): telemetry may collect herb baseline crawls; no causal assignments exist yet.')
  process.exit(process.exitCode ?? 0)
}

if (entries.length !== 97) fail(`prepared/active manifest must contain exactly 97 entries; found ${entries.length}`)
const pathnames = entries.map((entry) => entry.pathname)
if (new Set(pathnames).size !== pathnames.length) fail('manifest contains duplicate pathnames')
for (const pathname of pathnames) {
  if (typeof pathname !== 'string' || !/^\/herbs\/[^/]+$/.test(pathname)) fail(`invalid herb pathname: ${pathname}`)
}

const counts = entries.reduce((acc, entry) => {
  acc[entry.arm] = (acc[entry.arm] ?? 0) + 1
  return acc
}, {})
for (const [arm, expected] of Object.entries(EXPECTED)) {
  if (counts[arm] !== expected) fail(`${arm} count must be ${expected}; found ${counts[arm] ?? 0}`)
}

const pairs = new Map()
for (const entry of entries) {
  if (entry.arm === 'observational') {
    if (entry.pair_id !== null) fail(`observational entry must not have pair_id: ${entry.pathname}`)
    if (entry.experiment_t0 !== null || entry.treatment_requested_at !== null) {
      fail(`observational entry must not have treatment timing: ${entry.pathname}`)
    }
    continue
  }

  if (!entry.pair_id || !/^pair-\d{2}$/.test(entry.pair_id)) fail(`randomized entry missing valid pair_id: ${entry.pathname}`)
  if (!entry.baseline_rendered_sha256 || !/^[0-9a-f]{64}$/.test(entry.baseline_rendered_sha256)) {
    fail(`randomized entry missing baseline_rendered_sha256: ${entry.pathname}`)
  }
  const pair = pairs.get(entry.pair_id) ?? {}
  if (pair[entry.arm]) fail(`duplicate ${entry.arm} in ${entry.pair_id}`)
  pair[entry.arm] = entry
  pairs.set(entry.pair_id, pair)
}
if (pairs.size !== 20) fail(`expected 20 randomized pairs; found ${pairs.size}`)

const recordedTreatmentTimes = []
for (const [pairId, pair] of pairs) {
  if (!pair.treatment || !pair.control) {
    fail(`${pairId} must contain one treatment and one control`)
    continue
  }
  if (pair.control.treatment_requested_at !== null) fail(`control must not have treatment_requested_at: ${pair.control.pathname}`)

  const treatmentAt = pair.treatment.treatment_requested_at
  const treatmentT0 = pair.treatment.experiment_t0
  const controlT0 = pair.control.experiment_t0
  if (treatmentAt === null) {
    if (treatmentT0 !== null || controlT0 !== null) fail(`${pairId} has t0 without recorded treatment`)
  } else {
    const parsed = timestamp(treatmentAt)
    if (parsed === null) fail(`${pairId} has invalid treatment_requested_at`)
    if (treatmentT0 !== treatmentAt || controlT0 !== treatmentAt) {
      fail(`${pairId} treatment and paired control must share the exact treatment t0`)
    }
    if (parsed !== null) recordedTreatmentTimes.push(parsed)
  }
}

const recordedCount = recordedTreatmentTimes.length
if (manifest.status === 'prepared' && recordedCount !== 0) fail('prepared manifest must have 0/20 treatments recorded')
if (manifest.status === 'activating' && (recordedCount < 1 || recordedCount > 19)) fail(`activating manifest must have 1-19 treatments recorded; found ${recordedCount}`)
if (['active', 'completed'].includes(manifest.status) && recordedCount !== 20) fail(`${manifest.status} manifest must have 20/20 treatments recorded`)

if (recordedCount === 0) {
  if (manifest.freeze?.starts_at !== null || manifest.freeze?.ends_at !== null) fail('freeze treatment window must be null before first treatment')
  if (manifest.activated_at !== null || manifest.fully_activated_at !== null) fail('activation timestamps must be null before first treatment')
} else {
  const first = Math.min(...recordedTreatmentTimes)
  const last = Math.max(...recordedTreatmentTimes)
  const expectedStart = new Date(first).toISOString()
  const expectedEnd = new Date(last + manifest.freeze.duration_days * 86_400_000).toISOString()
  if (manifest.freeze?.starts_at !== expectedStart) fail(`freeze.starts_at must equal first treatment time ${expectedStart}`)
  if (manifest.freeze?.ends_at !== expectedEnd) fail(`freeze.ends_at must equal 28 days after last treatment ${expectedEnd}`)
  if (manifest.activated_at !== expectedStart) fail('activated_at must equal first treatment time')
  if (recordedCount === 20 && manifest.fully_activated_at !== new Date(last).toISOString()) fail('fully_activated_at must equal last treatment time')
  if (recordedCount < 20 && manifest.fully_activated_at !== null) fail('fully_activated_at must remain null until 20/20 treatments are recorded')
}

if (manifest.status === 'completed') {
  const completedAt = timestamp(manifest.completed_at)
  const freezeEnd = timestamp(manifest.freeze?.ends_at)
  if (completedAt === null || freezeEnd === null || completedAt < freezeEnd) {
    fail('completed_at must be at or after freeze.ends_at')
  }
} else if (manifest.completed_at !== null) {
  fail('completed_at must be null before completion')
}

const configuredPolicyPaths = Array.isArray(manifest.freeze?.policy_paths) ? manifest.freeze.policy_paths : []
if (JSON.stringify(configuredPolicyPaths) !== JSON.stringify(FREEZE_POLICY_PATHS)) fail('freeze policy_paths differ from the pre-specified audit surface')
if (!manifest.freeze?.policy_sha256 || !/^[0-9a-f]{64}$/.test(manifest.freeze.policy_sha256)) fail('prepared manifest requires freeze.policy_sha256')

const freezeEnd = timestamp(manifest.freeze?.ends_at)
const freezeExpired = manifest.status === 'active' && freezeEnd !== null && Date.now() >= freezeEnd
const enforceFreeze = ['prepared', 'activating'].includes(manifest.status) || (manifest.status === 'active' && !freezeExpired)

if (args['structural-only'] || !enforceFreeze) {
  const suffix = freezeExpired ? ' (28-day freeze elapsed; content lock released)' : ''
  if (!process.exitCode) console.log(`[crawl-experiment] PASS structural: status=${manifest.status}, treatment=${recordedCount}/20${suffix}`)
  process.exit(process.exitCode ?? 0)
}

const currentPolicyHash = freezePolicyHash()
if (currentPolicyHash !== manifest.freeze.policy_sha256) {
  console.warn('[crawl-experiment] NOTE: route-policy source changed; final built randomized-page outcomes will decide whether this contaminates the experiment.')
}

const buildDir = path.resolve(args['build-dir'] || 'out')
let sitemap
try {
  sitemap = readBuiltSitemap(buildDir)
} catch (error) {
  fail(error instanceof Error ? error.message : String(error))
}

if (sitemap) {
  for (const entry of entries.filter((candidate) => RANDOMIZED_ARMS.has(candidate.arm))) {
    try {
      const snapshot = snapshotBuiltHerb(entry.pathname, buildDir, sitemap)
      if (snapshot.rendered_sha256 !== entry.baseline_rendered_sha256) {
        fail(`28-day rendered-content freeze violated: ${entry.pathname}`)
      }
      if (!sameNullable(snapshot.baseline_lastmod, entry.baseline_lastmod)) {
        fail(`lastmod freeze violated for ${entry.pathname}: baseline=${entry.baseline_lastmod ?? 'null'} current=${snapshot.baseline_lastmod ?? 'null'}`)
      }
    } catch (error) {
      fail(error instanceof Error ? error.message : String(error))
    }
  }
}

if (!process.exitCode) {
  console.log(`[crawl-experiment] PASS: status=${manifest.status}, treatment=${recordedCount}/20; 40 randomized pages remain self-canonical, indexable, sitemap-eligible, lastmod-stable, and rendered-content-stable.`)
}
