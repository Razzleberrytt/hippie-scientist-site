#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const MANIFEST_PATH = path.resolve('experiments/crawl-request-indexing/manifest.json')
const ALLOWLIST_PATH = path.resolve('src/lib/index-allowlist.ts')
const EXPECTED = { treatment: 20, control: 20, observational: 57 }
const SITE = 'https://thehippiescientist.net'
const VOLATILE_KEYS = new Set([
  'lastUpdated', 'updatedAt', 'last_updated', 'last_reviewed', 'updated_at', 'reviewedAt',
  'dateModified', 'generated_at', 'generatedAt', 'build_timestamp', 'buildTimestamp',
])

function fail(message) {
  console.error(`[crawl-experiment] FAIL: ${message}`)
  process.exitCode = 1
}

function parseArgs(argv) {
  const args = {}
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]
    if (!token.startsWith('--')) continue
    const [key, inline] = token.slice(2).split('=', 2)
    args[key] = inline ?? argv[index + 1]
    if (inline === undefined) index += 1
  }
  return args
}

function readJsonOptional(relativePath) {
  try {
    return JSON.parse(readFileSync(path.resolve(relativePath), 'utf8'))
  } catch {
    return null
  }
}

function recordForSlug(payload, slug) {
  if (Array.isArray(payload)) return payload.find((row) => row && typeof row === 'object' && row.slug === slug) ?? null
  if (payload && typeof payload === 'object' && payload.slug === slug) return payload
  return null
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

function contentHashForSlug(slug) {
  const layers = {
    base: recordForSlug(readJsonOptional('public/data/herbs.json'), slug),
    summary: recordForSlug(readJsonOptional('public/data/herbs-summary.json'), slug),
    summary_index: recordForSlug(readJsonOptional('public/data/summary-indexes/herbs-summary.json'), slug),
    detail: readJsonOptional(`public/data/herbs-detail/${slug}.json`),
  }
  const present = Object.fromEntries(Object.entries(layers).filter(([, value]) => value && typeof value === 'object'))
  if (!Object.keys(present).length) return null
  return createHash('sha256').update(JSON.stringify(stableContent(present))).digest('hex')
}

function normalizeDate(value) {
  if (!value) return null
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null
}

function normalizePathname(value) {
  if (!value) return null
  try {
    const url = /^https?:\/\//i.test(value) ? new URL(value) : null
    value = url ? url.pathname : value
  } catch {
    return null
  }
  const pathOnly = value.split(/[?#]/)[0]
  const withSlash = pathOnly.startsWith('/') ? pathOnly : `/${pathOnly}`
  return withSlash.length > 1 ? withSlash.replace(/\/+$/, '') : '/'
}

function normalizeCanonicalOwner(value) {
  if (!value) return null
  try {
    const url = new URL(value, SITE)
    return `${url.origin}${normalizePathname(url.pathname)}`
  } catch {
    return null
  }
}

function curatedSlugs(source) {
  const match = source.match(/CURATED_INDEXABLE_HERB_SLUGS\s*=\s*\[([\s\S]*?)\]\s*as const/)
  if (!match) throw new Error('Unable to parse CURATED_INDEXABLE_HERB_SLUGS')
  return new Set([...match[1].matchAll(/['"]([^'"]+)['"]/g)].map((entry) => entry[1]))
}

function extractCanonical(html) {
  const links = html.match(/<link\b[^>]*>/gi) ?? []
  const canonical = links.find((tag) => /\brel=["'][^"']*canonical[^"']*["']/i.test(tag))
  return canonical?.match(/\bhref=["']([^"']+)["']/i)?.[1] ?? null
}

function extractRobots(html) {
  const metas = html.match(/<meta\b[^>]*>/gi) ?? []
  const tag = metas.find((entry) => /\bname=["']robots["']/i.test(entry))
  return tag?.match(/\bcontent=["']([^"']*)["']/i)?.[1]?.toLowerCase() ?? ''
}

function sitemapLastmods(xml) {
  const output = new Map()
  for (const [, block] of xml.matchAll(/<url>([\s\S]*?)<\/url>/gi)) {
    const loc = block.match(/<loc>([\s\S]*?)<\/loc>/i)?.[1]?.trim()?.replaceAll('&amp;', '&')
    const lastmod = normalizeDate(block.match(/<lastmod>([\s\S]*?)<\/lastmod>/i)?.[1]?.trim())
    const pathname = loc ? normalizePathname(loc) : null
    if (pathname && lastmod) output.set(pathname, lastmod)
  }
  return output
}

const args = parseArgs(process.argv.slice(2))
const outDir = args['out-dir'] ? path.resolve(args['out-dir']) : null
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
  if (typeof pathname !== 'string' || !/^\/herbs\/[a-z0-9][a-z0-9-]*$/.test(pathname)) fail(`invalid herb pathname: ${pathname}`)
}

if (manifest.status !== 'active') {
  const causalAssignments = entries.filter((entry) => entry.arm === 'treatment' || entry.arm === 'control')
  if (causalAssignments.length > 0) fail('pending manifest must not contain treatment/control assignments')
  console.log('[crawl-experiment] PASS (unarmed): experiment telemetry and treatment remain disabled until the exact 97-URL registry is imported.')
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

for (const entry of entries) {
  if (!normalizeDate(entry.baseline_last_crawled)) fail(`missing/invalid baseline_last_crawled: ${entry.pathname}`)
  if (!normalizeDate(entry.baseline_lastmod)) fail(`missing/invalid baseline_lastmod: ${entry.pathname}`)
}

const freezeStart = Date.parse(manifest.freeze?.starts_at ?? '')
const freezeEnd = Date.parse(manifest.freeze?.ends_at ?? '')
if (!Number.isFinite(freezeStart) || !Number.isFinite(freezeEnd)) {
  fail('active manifest requires valid freeze.starts_at and freeze.ends_at')
} else {
  const durationDays = (freezeEnd - freezeStart) / 86_400_000
  if (Math.abs(durationDays - 28) > 0.001) fail(`freeze window must be exactly 28 days; found ${durationDays}`)
}

const now = Date.now()
const measurementActive = Number.isFinite(freezeStart) && Number.isFinite(freezeEnd) && now >= freezeStart && now <= freezeEnd
if (!measurementActive) {
  if (now > freezeEnd) {
    console.log('[crawl-experiment] PASS: 28-day follow-up is complete; randomized-page freeze is released.')
  } else {
    fail('active experiment freeze window has not started')
  }
  process.exit(process.exitCode ?? 0)
}

const herbRows = readJsonOptional('public/data/herbs.json')
if (!Array.isArray(herbRows)) throw new Error('public/data/herbs.json must be an array')
const herbs = new Map(herbRows.filter((row) => row?.slug).map((row) => [String(row.slug), row]))
const curated = curatedSlugs(readFileSync(ALLOWLIST_PATH, 'utf8'))
const frozen = entries.filter((entry) => entry.arm === 'treatment' || entry.arm === 'control')
if (frozen.length !== 40) fail(`randomized freeze must contain exactly 40 pages; found ${frozen.length}`)

for (const entry of entries) {
  const slug = entry.pathname.split('/').filter(Boolean).at(-1)
  const record = herbs.get(slug)
  if (!record) {
    fail(`registry URL has no current herb record: ${entry.pathname}`)
    continue
  }
  const remainsIndexable = curated.has(slug) || record.indexability_status === 'PUBLISH'
  if (!remainsIndexable) fail(`experiment URL is no longer sitemap/indexability eligible: ${entry.pathname}`)
}

for (const entry of frozen) {
  const slug = entry.pathname.split('/').filter(Boolean).at(-1)
  if (!entry.baseline_content_sha256) {
    fail(`freeze arm missing baseline_content_sha256: ${entry.pathname}`)
    continue
  }
  const currentHash = contentHashForSlug(slug)
  if (!currentHash || currentHash !== entry.baseline_content_sha256) {
    fail(`28-day substantive-content freeze violated: ${entry.pathname}`)
  }
}

if (outDir) {
  const sitemapPath = path.join(outDir, 'sitemap.xml')
  if (!existsSync(sitemapPath)) {
    fail(`built sitemap missing: ${sitemapPath}`)
  } else {
    const lastmods = sitemapLastmods(readFileSync(sitemapPath, 'utf8'))
    for (const entry of frozen) {
      const slug = entry.pathname.split('/').filter(Boolean).at(-1)
      const htmlPath = path.join(outDir, 'herbs', slug, 'index.html')
      if (!existsSync(htmlPath)) {
        fail(`frozen page missing from static export: ${entry.pathname}`)
        continue
      }
      const html = readFileSync(htmlPath, 'utf8')
      const canonical = normalizeCanonicalOwner(extractCanonical(html))
      const baselineCanonical = normalizeCanonicalOwner(entry.baseline_canonical ?? `${SITE}${entry.pathname}/`)
      if (!canonical || canonical !== baselineCanonical) {
        fail(`canonical-owner freeze violated for ${entry.pathname}: ${canonical ?? '<missing>'}`)
      }
      const robots = extractRobots(html)
      if (robots.includes('noindex')) {
        fail(`indexability freeze violated for ${entry.pathname}: robots=${robots}`)
      }
      const currentLastmod = lastmods.get(entry.pathname) ?? null
      if (currentLastmod !== normalizeDate(entry.baseline_lastmod)) {
        fail(`sitemap lastmod freeze violated for ${entry.pathname}: baseline=${entry.baseline_lastmod} current=${currentLastmod ?? '<missing>'}`)
      }
    }
  }
}

if (!process.exitCode) {
  console.log(`[crawl-experiment] PASS: 20 treatment / 20 randomized control / 57 observational; 40-page freeze holds${outDir ? ' in source data and rendered output' : ' in source data'}.`)
}
