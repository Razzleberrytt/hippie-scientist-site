#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { normalizePathname } from './crawl-experiment-build-snapshot.mjs'

const DEFAULT_MANIFEST = 'experiments/crawl-request-indexing/manifest.json'

function parseArgs(argv) {
  const args = {}
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]
    if (!token.startsWith('--')) continue
    const [key, inlineValue] = token.slice(2).split('=', 2)
    args[key] = inlineValue ?? argv[index + 1]
    if (inlineValue === undefined) index += 1
  }
  return args
}

function isoTimestamp(value) {
  const timestamp = value ? Date.parse(value) : Date.now()
  if (!Number.isFinite(timestamp)) throw new Error(`Invalid treatment timestamp: ${value}`)
  return new Date(timestamp).toISOString()
}

function updateFreezeWindow(manifest) {
  const treatments = manifest.entries.filter((entry) => entry.arm === 'treatment')
  const timestamps = treatments.map((entry) => entry.treatment_requested_at).filter(Boolean)
  if (timestamps.length === 0) {
    manifest.freeze.starts_at = null
    manifest.freeze.ends_at = null
    manifest.activated_at = null
    manifest.fully_activated_at = null
    return
  }

  const sorted = timestamps.map(Date.parse).sort((a, b) => a - b)
  const first = sorted[0]
  const last = sorted.at(-1)
  manifest.freeze.starts_at = new Date(first).toISOString()
  manifest.freeze.ends_at = new Date(last + manifest.freeze.duration_days * 86_400_000).toISOString()
  manifest.activated_at = new Date(first).toISOString()
  manifest.fully_activated_at = timestamps.length === 20 ? new Date(last).toISOString() : null
  manifest.status = timestamps.length === 20 ? 'active' : 'activating'
}

const args = parseArgs(process.argv.slice(2))
if (!args.pathname) {
  console.error('Usage: node scripts/seo/record-crawl-experiment-treatment.mjs --pathname /herbs/<slug> [--at ISO-8601] [--manifest path]')
  process.exit(2)
}

const manifestPath = path.resolve(args.manifest || DEFAULT_MANIFEST)
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
if (manifest.schema_version !== 2) throw new Error('Treatment recording requires schema_version 2')
if (!['prepared', 'activating'].includes(manifest.status)) {
  throw new Error(`Treatment can only be recorded while prepared/activating; status=${manifest.status}`)
}

const pathname = normalizePathname(args.pathname)
const treatment = manifest.entries.find((entry) => entry.pathname === pathname && entry.arm === 'treatment')
if (!treatment) throw new Error(`${pathname} is not a randomized treatment URL`)
if (!treatment.pair_id) throw new Error(`${pathname} has no randomized pair_id`)
if (treatment.treatment_requested_at || treatment.experiment_t0) {
  throw new Error(`Treatment timestamp is already recorded for ${pathname}; refusing to overwrite it`)
}

const control = manifest.entries.find((entry) => entry.arm === 'control' && entry.pair_id === treatment.pair_id)
if (!control) throw new Error(`No paired control found for ${treatment.pair_id}`)
if (control.experiment_t0) throw new Error(`Paired control ${control.pathname} already has experiment_t0`)

const at = isoTimestamp(args.at)
treatment.treatment_requested_at = at
treatment.experiment_t0 = at
control.experiment_t0 = at
updateFreezeWindow(manifest)

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
const completed = manifest.entries.filter((entry) => entry.arm === 'treatment' && entry.treatment_requested_at).length
console.log(`Recorded ${pathname} at ${at}; pair=${treatment.pair_id}; treatments=${completed}/20; status=${manifest.status}`)
