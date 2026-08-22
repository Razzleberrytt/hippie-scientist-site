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

const AUXILIARY_CODES = new Set([
  'SAFETY_CLAIM_WITHOUT_SAFETY_SOURCE',
  'DOSE_STATEMENT_WITHOUT_DOSE_SOURCE',
])
const SAFETY_LIMITATION = 'No source-verified safety conclusion is included in this profile. Absence of a listed risk should not be interpreted as evidence of safety.'
const DOSE_LIMITATION = 'No source-verified dosing conclusion is included in this profile.'

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

function claimIdFromDetail(detail, label) {
  const match = String(detail || '').match(new RegExp(`${label} claim\\s+(\\S+)`, 'i'))
  return match?.[1] || ''
}

function syncEvidenceClaims(record) {
  if (!record?.evidence || !Array.isArray(record?.claimMap)) return record
  const ids = record.claimMap.map((claim) => String(claim?.id || '').trim()).filter(Boolean)
  return {
    ...record,
    evidence: {
      ...record.evidence,
      claimCount: ids.length,
      claimIds: ids,
    },
  }
}

/**
 * A missing citation for a removable side-field is not the same defect as an
 * unsupported core efficacy claim. Suppress the unsupported public statement,
 * keep a transparent limitation for safety/dose context, and then re-run the
 * invariant evaluator. Structural citation defects and unsupported human
 * efficacy claims are never auto-remediated here.
 */
function suppressUnsupportedAuxiliaryClaims(record, issues) {
  let next = structuredClone(record)
  let changed = false
  const suppressed = []

  for (const finding of issues) {
    if (!AUXILIARY_CODES.has(finding.code)) continue
    const detail = String(finding.detail || '')

    if (finding.code === 'SAFETY_CLAIM_WITHOUT_SAFETY_SOURCE') {
      const claimId = claimIdFromDetail(detail, 'Safety')
      if (claimId && Array.isArray(next.claimMap)) {
        const before = next.claimMap.length
        next.claimMap = next.claimMap.filter((claim) => String(claim?.id || '') !== claimId)
        if (next.claimMap.length !== before) {
          changed = true
          suppressed.push({ code: finding.code, action: 'removed-unsupported-safety-claim', claimId })
        }
      }

      if (/Published safety section has no safety-classified source/i.test(detail)) {
        for (const field of ['safety', 'contraindications', 'interactions', 'side_effects', 'sideEffects']) {
          if (!(field in next)) continue
          const empty = Array.isArray(next[field]) ? [] : ''
          if (JSON.stringify(next[field]) !== JSON.stringify(empty)) {
            next[field] = empty
            changed = true
          }
        }
        if (String(next.safetyNotes || '').trim() !== SAFETY_LIMITATION) {
          next.safetyNotes = SAFETY_LIMITATION
          changed = true
        }
        suppressed.push({ code: finding.code, action: 'suppressed-unverified-safety-section' })
      }
    }

    if (finding.code === 'DOSE_STATEMENT_WITHOUT_DOSE_SOURCE') {
      const claimId = claimIdFromDetail(detail, 'Dose')
      if (claimId && Array.isArray(next.claimMap)) {
        const before = next.claimMap.length
        next.claimMap = next.claimMap.filter((claim) => String(claim?.id || '') !== claimId)
        if (next.claimMap.length !== before) {
          changed = true
          suppressed.push({ code: finding.code, action: 'removed-unsupported-dose-claim', claimId })
        }
      }

      if (/Profile dose statement has no dose-bearing source/i.test(detail)) {
        for (const field of ['dosage', 'typical_dosage']) {
          if (!(field in next)) continue
          if (String(next[field] || '').trim() !== DOSE_LIMITATION) {
            next[field] = DOSE_LIMITATION
            changed = true
          }
        }
        suppressed.push({ code: finding.code, action: 'suppressed-unverified-profile-dose' })
      }
    }
  }

  if (changed) next = syncEvidenceClaims(next)
  return { record: next, changed, suppressed }
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
const remediations = []
const scrubbed = []
const finalByKindSlug = new Map()
for (const entry of scrubbedEntries) {
  const key = `${entry.kind}:${entry.record.slug || ''}`
  let record = entry.record
  const wasPublished = recordIsPublished(record)
  let issues = corpusByKey.get(key) || evaluateRecord(record, entry.kind)
  let blocking = issues.filter((finding) => finding.blocking)

  if (wasPublished && blocking.length) {
    const remediation = suppressUnsupportedAuxiliaryClaims(record, blocking)
    if (remediation.changed) {
      record = remediation.record
      remediations.push({
        kind: entry.kind,
        slug: record.slug,
        url: `/${entry.kind === 'herb' ? 'herbs' : 'compounds'}/${record.slug}/`,
        actions: remediation.suppressed,
      })

      // Re-evaluate the repaired record. Preserve corpus-level duplicate errors,
      // because evaluateRecord intentionally operates on one record at a time.
      const duplicateIssues = blocking.filter((finding) => finding.code === 'DUPLICATE_CANONICAL_ENTITY')
      issues = [...duplicateIssues, ...evaluateRecord(record, entry.kind)]
      blocking = issues.filter((finding) => finding.blocking)
    }
  }

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
  remediatedProfiles: remediations.length,
  remediations,
  demotedProfiles: demotions.length,
  demotions,
  refreshedDerivedData: false,
  policy: 'Unsupported auxiliary safety/dose statements are suppressed and re-evaluated; structural citation defects and unsupported human efficacy claims remain hard noindex blockers.',
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
console.log(`[production-invariants] scanned ${report.scannedProfiles}; scrubbed=${report.scrubbedProfiles}; remediated=${report.remediatedProfiles}; demoted=${report.demotedProfiles}`)
if (demotions.length) {
  const counts = new Map()
  for (const row of demotions) for (const code of row.codes || []) counts.set(code, (counts.get(code) || 0) + 1)
  console.log(`[production-invariants] demotion codes: ${[...counts].sort((a, b) => b[1] - a[1]).map(([code, count]) => `${code}=${count}`).join(', ')}`)
  console.log(`[production-invariants] first demotion: ${demotions[0].url} — ${demotions[0].codes.join(', ')}`)
}
console.log(`[production-invariants] report: ${path.relative(root, reportPath)}`)
