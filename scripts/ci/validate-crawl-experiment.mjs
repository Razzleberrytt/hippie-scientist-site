#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const MANIFEST_PATH = path.resolve('experiments/crawl-request-indexing/manifest.json')
const HERBS_PATH = path.resolve('public/data/herbs.json')
const ALLOWLIST_PATH = path.resolve('src/lib/index-allowlist.ts')
const EXPECTED = { treatment: 20, control: 20, observational: 57 }
const FREEZE_POLICY_PATHS = [
  'app/herbs/[slug]/page.tsx',
  'app/sitemap.ts',
  'src/lib/seo.ts',
  'src/lib/index-allowlist.ts',
  'lib/sitemap-route-visibility.ts',
  'public/_redirects',
]
const VOLATILE_KEYS = new Set([
  'lastUpdated', 'updatedAt', 'last_updated', 'last_reviewed', 'updated_at', 'reviewedAt',
  'dateModified', 'generated_at', 'generatedAt', 'build_timestamp', 'buildTimestamp',
])

function fail(message) {
  console.error(`[crawl-experiment] FAIL: ${message}`)
  process.exitCode = 1
}

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

function freezePolicyHash() {
  const hash = createHash('sha256')
  for (const relativePath of FREEZE_POLICY_PATHS) {
    hash.update(relativePath)
    hash.update('\0')
    hash.update(readFileSync(path.resolve(relativePath)))
    hash.update('\0')
  }
  return hash.digest('hex')
}

function normalizeDate(value) {
  if (!value) return null
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null
}

function recordLastmod(record) {
  for (const key of ['lastUpdated', 'updatedAt', 'last_updated', 'last_reviewed', 'updated_at', 'reviewedAt', 'dateModified']) {
    const normalized = normalizeDate(record?.[key])
    if (normalized) return normalized
  }
  return null
}

function curatedSlugs(source) {
  const match = source.match(/CURATED_INDEXABLE_HERB_SLUGS\s*=\s*\[([\s\S]*?)\]\s*as const/)
  if (!match) throw new Error('Unable to parse CURATED_INDEXABLE_HERB_SLUGS')
  return new Set([...match[1].matchAll(/['"]([^'"]+)['"]/g)].map((entry) => entry[1]))
}

const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'))
const entries = Array.isArray(manifest.entries) ? manifest.entries : []

if (manifest.schema_version !== 1) fail('schema_version must be 1')
if (!['pending_registry', 'active'].includes(manifest.status)) fail(`unsupported status: ${manifest.status}`)
if (manifest.registry_source?.expected_total !== 97) fail('registry_source.expected_total must be 97')
if (manifest.design?.treatment_n !== 20 || manifest.design?.control_n !== 20 || manifest.design?.observational_n !== 57) {
  fail('design must remain 20 treatment / 20 randomized control / 57 observational')
}
if (manifest.design?.causal_control !== 'control') fail('only the randomized control arm may be labeled causal control')
if (manifest.freeze?.duration_days !== 28) fail('freeze duration must remain 28 days')

const pathnames = entries.map((entry) => entry.pathname)
if (new Set(pathnames).size !== pathnames.length) fail('manifest contains duplicate pathnames')
for (const pathname of pathnames) {
  if (typeof pathname !== 'string' || !/^\/herbs\/[^/]+$/.test(pathname)) fail(`invalid herb pathname: ${pathname}`)
}

if (manifest.status !== 'active') {
  const causalAssignments = entries.filter((entry) => entry.arm === 'treatment' || entry.arm === 'control')
  if (causalAssignments.length > 0) fail('pending manifest must not contain treatment/control assignments')
  console.log('[crawl-experiment] PASS (unarmed): telemetry may run; causal experiment remains disabled until exact 97-URL registry is imported.')
  process.exit(process.exitCode ?? 0)
}

if (entries.length !== 97) fail(`active manifest must contain exactly 97 entries; found ${entries.length}`)
const counts = entries.reduce((acc, entry) => {
  acc[entry.arm] = (acc[entry.arm] ?? 0) + 1
  return acc
}, {})
for (const [arm, expected] of Object.entries(EXPECTED)) {
  if (counts[arm] !== expected) fail(`${arm} count must be ${expected}; found ${counts[arm] ?? 0}`)
}

const freezeStart = Date.parse(manifest.freeze?.starts_at ?? '')
const freezeEnd = Date.parse(manifest.freeze?.ends_at ?? '')
if (!Number.isFinite(freezeStart) || !Number.isFinite(freezeEnd)) {
  fail('active manifest requires valid freeze.starts_at and freeze.ends_at')
} else {
  const durationDays = (freezeEnd - freezeStart) / 86_400_000
  if (Math.abs(durationDays - 28) > 0.001) fail(`freeze window must be exactly 28 days; found ${durationDays}`)
}

const configuredPolicyPaths = Array.isArray(manifest.freeze?.policy_paths) ? manifest.freeze.policy_paths : []
if (JSON.stringify(configuredPolicyPaths) !== JSON.stringify(FREEZE_POLICY_PATHS)) {
  fail('freeze policy_paths differ from the pre-specified route-policy surface')
}
if (!manifest.freeze?.policy_sha256) {
  fail('active manifest requires freeze.policy_sha256')
} else {
  const currentPolicyHash = freezePolicyHash()
  if (currentPolicyHash !== manifest.freeze.policy_sha256) {
    fail('canonical/indexability route-policy freeze violated')
  }
}

const herbRows = JSON.parse(readFileSync(HERBS_PATH, 'utf8'))
if (!Array.isArray(herbRows)) throw new Error('public/data/herbs.json must be an array')
const herbs = new Map(herbRows.filter((row) => row?.slug).map((row) => [String(row.slug), row]))
const curated = curatedSlugs(readFileSync(ALLOWLIST_PATH, 'utf8'))

for (const entry of entries) {
  const slug = entry.pathname.split('/').filter(Boolean).at(-1)
  const record = herbs.get(slug)
  if (!record) {
    fail(`registry URL has no current herb record: ${entry.pathname}`)
    continue
  }

  const remainsIndexable = curated.has(slug) || record.indexability_status === 'PUBLISH'
  if (!remainsIndexable) fail(`experiment URL is no longer sitemap/indexability eligible: ${entry.pathname}`)

  if (entry.arm !== 'treatment' && entry.arm !== 'control') continue

  if (!entry.baseline_content_sha256) {
    fail(`freeze arm missing baseline_content_sha256: ${entry.pathname}`)
  } else if (contentHash(record) !== entry.baseline_content_sha256) {
    fail(`28-day content freeze violated: ${entry.pathname}`)
  }

  const currentLastmod = recordLastmod(record)
  if ((entry.baseline_lastmod ?? null) !== currentLastmod) {
    fail(`lastmod freeze violated for ${entry.pathname}: baseline=${entry.baseline_lastmod ?? 'null'} current=${currentLastmod ?? 'null'}`)
  }
}

if (!process.exitCode) {
  console.log('[crawl-experiment] PASS: active registry is 20 treatment / 20 randomized control / 57 observational; content, lastmod, indexability, and route-policy freezes hold.')
}
