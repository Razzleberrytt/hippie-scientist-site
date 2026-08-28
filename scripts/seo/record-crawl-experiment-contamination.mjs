#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { normalizePathname } from './crawl-experiment-build-snapshot.mjs'

const DEFAULT_MANIFEST = 'experiments/crawl-request-indexing/manifest.json'
const ALLOWED_REASON_CODES = new Set([
  'safety_critical',
  'scientific_integrity',
  'legal_compliance',
  'security',
  'emergency_operational',
])

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
  if (!Number.isFinite(timestamp)) throw new Error(`Invalid contamination timestamp: ${value}`)
  return new Date(timestamp).toISOString()
}

const args = parseArgs(process.argv.slice(2))
if (!args.pathname || !args['reason-code'] || !args.reason) {
  console.error('Usage: node scripts/seo/record-crawl-experiment-contamination.mjs --pathname /herbs/<slug> --reason-code <code> --reason <text> [--at ISO-8601] [--manifest path]')
  console.error(`Allowed reason codes: ${[...ALLOWED_REASON_CODES].join(', ')}`)
  process.exit(2)
}

if (!ALLOWED_REASON_CODES.has(args['reason-code'])) {
  throw new Error(`Unsupported contamination reason code: ${args['reason-code']}`)
}

const manifestPath = path.resolve(args.manifest || DEFAULT_MANIFEST)
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
if (manifest.schema_version !== 2) throw new Error('Contamination recording requires schema_version 2')
if (!['prepared', 'activating', 'active'].includes(manifest.status)) {
  throw new Error(`Contamination can only be recorded while the randomized-page freeze is enforced; status=${manifest.status}`)
}

const pathname = normalizePathname(args.pathname)
const entry = manifest.entries.find(
  (candidate) => candidate.pathname === pathname && (candidate.arm === 'treatment' || candidate.arm === 'control'),
)
if (!entry) throw new Error(`${pathname} is not a randomized treatment/control URL`)
if (entry.contamination) throw new Error(`${pathname} already has a contamination record; refusing to overwrite it`)

entry.contamination = {
  recorded_at: isoTimestamp(args.at),
  reason_code: args['reason-code'],
  reason: String(args.reason).trim(),
  excluded_from_causal_analysis: true,
}

if (!entry.contamination.reason) throw new Error('Contamination reason must not be empty')

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
console.log(
  `Recorded contamination for ${pathname}: ${entry.contamination.reason_code}; randomized unit is explicitly excluded from causal analysis so the required correction may proceed.`,
)
