#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import {
  demoteFromIndex,
  evaluateCorpus,
  evaluateRecord,
  recordIsPublished,
  scrubInternalLanguage,
} from '../lib/production-content-invariants.mjs'

const root = process.cwd()
const dataDir = path.resolve(root, process.argv.find((arg) => arg.startsWith('--data-dir='))?.slice(11) || 'public/data')
const refreshDerived = process.argv.includes('--refresh-derived')
const reportPath = path.join(root, 'reports/production-invariant-enforcement.json')

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return fallback }
}
function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)
}
function detailDir(kind) {
  const plural = path.join(dataDir, kind === 'herb' ? 'herbs-detail' : 'compounds-detail')
  const singular = path.join(dataDir, kind === 'herb' ? 'herb-detail' : 'compound-detail')
  return fs.existsSync(plural) ? plural : singular
}
function listDetails(kind) {
  const dir = detailDir(kind)
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir).filter((name) => name.endsWith('.json')).sort().map((name) => ({ kind, name, file: path.join(dir, name), record: readJson(path.join(dir, name), {}) }))
}
function run(command) {
  execSync(command, { cwd: root, stdio: 'inherit', env: process.env })
}

const entries = [...listDetails('herb'), ...listDetails('compound')]
const originalByFile = new Map(entries.map((entry) => [entry.file, entry.record]))
const scrubbedEntries = entries.map((entry) => ({ ...entry, record: scrubInternalLanguage(entry.record) }))

// Duplicate canonical IDs are a corpus-level invariant, so calculate them once
// and attribute them to the affected record before deciding publication status.
const corpusIssues = evaluateCorpus(scrubbedEntries)
const corpusByKey = new Map()
for (const finding of corpusIssues) {
  const key = `${finding.kind}:${finding.slug}`
  if (!corpusByKey.has(key)) corpusByKey.set(key, [])
  corpusByKey.get(key).push(finding)
}

const demotions = []
const scrubbed = []
const finalByKindSlug = new Map()
for (const entry of scrubbedEntries) {
  const key = `${entry.kind}:${entry.record.slug || ''}`
  let record = entry.record
  const wasPublished = recordIsPublished(record)
  const issues = corpusByKey.get(key) || evaluateRecord(record, entry.kind)
  const blocking = issues.filter((finding) => finding.blocking)
  if (wasPublished && blocking.length) {
    record = demoteFromIndex(record, new Set(blocking.map((finding) => finding.code)))
    demotions.push({
      kind: entry.kind,
      slug: record.slug,
      url: `/${entry.kind === 'herb' ? 'herbs' : 'compounds'}/${record.slug}/`,
      codes: [...new Set(blocking.map((finding) => finding.code))],
      details: blocking.map((finding) => finding.detail),
    })
  }
  if (JSON.stringify(record) !== JSON.stringify(originalByFile.get(entry.file))) scrubbed.push(`${entry.kind}:${record.slug}`)
  writeJson(entry.file, record)
  finalByKindSlug.set(`${entry.kind}:${record.slug}`, record)
}

// Keep collection-level route/indexability records synchronized with detail
// governance so sitemap/search builders cannot accidentally republish a profile
// that the detail-level invariant gate demoted.
for (const [kind, fileName] of [['herb', 'herbs.json'], ['compound', 'compounds.json']]) {
  const file = path.join(dataDir, fileName)
  const rows = readJson(file, [])
  if (!Array.isArray(rows)) continue
  let changed = false
  const nextRows = rows.map((raw) => {
    const row = scrubInternalLanguage(raw)
    const detail = finalByKindSlug.get(`${kind}:${row.slug || ''}`)
    let next = row
    if (detail && !recordIsPublished(detail) && recordIsPublished(row)) {
      const reasons = (detail.indexability_reasons || []).filter((reason) => String(reason).startsWith('production-invariant:'))
      next = demoteFromIndex(row, new Set(reasons.map((reason) => String(reason).slice('production-invariant:'.length).toUpperCase())))
      next.indexability_reasons = [...new Set([...(next.indexability_reasons || []), ...reasons])]
      changed = true
    }
    if (JSON.stringify(next) !== JSON.stringify(raw)) changed = true
    return next
  })
  if (changed) writeJson(file, nextRows)
}

const report = {
  generatedAt: new Date().toISOString(),
  scannedProfiles: entries.length,
  scrubbedProfiles: new Set(scrubbed).size,
  demotedProfiles: demotions.length,
  demotions,
  refreshedDerivedData: false,
  policy: 'Invariant-breaking records remain available to the research system but are forced to noindex/NEEDS_REVIEW before route, sitemap and search manifests are generated.',
}

// The deploy pipeline normally builds derived maps before Next.js. When this
// enforcement is invoked from the final production-build step, a demotion would
// otherwise leave those maps stale. Refresh them only when a demotion happened.
// Crucially, the summary refresh runs in preserve-governed-state mode: the
// invariant gate is authoritative at this point and no downstream derived-data
// builder may re-run mutating governance/postprocess stages that could republish
// a record the gate just demoted.
if (refreshDerived && demotions.length) {
  console.log(`[production-invariants] refreshing derived route/search/sitemap data after ${demotions.length} demotion(s)`)
  run('node scripts/data/build-related-runtime-maps.mjs --data-dir=public/data')
  run('node scripts/data/build-runtime-summary-indexes.mjs --data-dir=public/data --preserve-governed-state')
  run('node scripts/data/build-route-manifest.mjs --data-dir=public/data')
  run('node scripts/data/build-internal-link-engine.mjs --data-dir=public/data')
  run('node scripts/data/build-sitemap-manifest.mjs --data-dir=public/data')
  run('node scripts/data/build-export-batches.mjs --data-dir=public/data')
  run('node scripts/data/build-semantic-snapshots.mjs --data-dir=public/data')
  run('node scripts/data/build-search-index.mjs --data-dir=public/data')
  report.refreshedDerivedData = true
}

writeJson(reportPath, report)
console.log(`[production-invariants] scanned ${report.scannedProfiles}; scrubbed=${report.scrubbedProfiles}; demoted=${report.demotedProfiles}`)
if (demotions.length) console.log(`[production-invariants] first demotion: ${demotions[0].url} — ${demotions[0].codes.join(', ')}`)
console.log(`[production-invariants] report: ${path.relative(root, reportPath)}`)
