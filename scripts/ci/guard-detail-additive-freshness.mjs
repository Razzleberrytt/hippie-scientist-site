#!/usr/bin/env node
// Detects the recurring "detail-file staleness" bug documented in
// docs/LOOP_NOTES.md (2026-07-13 "citicoline" entries; 2026-07-16 "closed the
// last documented..." entry): getHerbBySlug()/getCompoundBySlug() in
// src/lib/runtime-data.ts blanket-overlay herbs-detail/{slug}.json /
// compounds-detail/{slug}.json over the flat herbs.json/compounds.json record
// via a plain Object.assign for any entity that isn't a registered cluster
// member (lib/runtime-record-resolver.mjs only does field-level trust
// resolution for CLUSTER_MEMBER_RUNTIME_DECISION records). Two concrete ways
// that bites:
//
//   1. The detail file's own `contraindications` array already exists (e.g.
//      from an earlier detail-backfill) but predates a newly-added
//      ADDITIVE-mechanism safety flag on the flat record — the only
//      mechanisms (serotonergic/anticoagulant/cns_sedation/blood_glucose/
//      blood_pressure) that actually render a live "Interactions" section via
//      lib/interaction-risk.ts. The live page silently keeps showing the
//      stale text and an enrichment fix never reaches production.
//   2. The detail file has an explicit `"contraindications": []` — an empty
//      array is still a present key, so Object.assign clobbers the flat
//      record's real safety text with nothing.
//
// Neither is caught by typecheck, lint, or the existing data validators,
// which only check the flat public/data files against the workbook — not
// against public/data/*-detail overlays. Run via `npm run data:sync-detail-
// backfill` to fix a flagged slug (regenerates herbs-detail/compounds-detail
// from the current flat records).
//
// Usage: node scripts/ci/guard-detail-additive-freshness.mjs
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { KEYWORDS } from '../data/build-interaction-data.mjs'
import { CLUSTER_MEMBER_RUNTIME_DECISION } from '../../config/cluster-member-runtime-trust.mjs'

const __filename = fileURLToPath(import.meta.url)
const repoRoot = path.resolve(path.dirname(__filename), '../..')
const dataDir = path.join(repoRoot, 'public/data')

const ADDITIVE_MECHS = new Set(['serotonergic', 'anticoagulant', 'cns_sedation', 'blood_glucose', 'blood_pressure'])

function loadFlatList(fileName) {
  const parsed = JSON.parse(fs.readFileSync(path.join(dataDir, fileName), 'utf8'))
  return Array.isArray(parsed) ? parsed : Object.values(parsed).find(Array.isArray) || []
}

function makeDetailReader(detailDirName) {
  const dir = path.join(dataDir, detailDirName)
  return (slug) => {
    const file = path.join(dir, `${slug}.json`)
    if (!fs.existsSync(file)) return null
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  }
}

// Pure: given a list of flat records (herbs.json or compounds.json), the
// shared entity_risk_tags.json map, and a detail-record reader, return every
// slug whose detail file would silently override the flat record's
// additive-mechanism safety content when merged by getHerbBySlug/
// getCompoundBySlug's blanket Object.assign.
export function findStaleDetailRecords(flatRecords, tagsBySlug, readDetail) {
  const findings = []
  for (const record of flatRecords) {
    if (!record?.slug || record.runtime_export_decision === CLUSTER_MEMBER_RUNTIME_DECISION) continue

    const detail = readDetail(record.slug)
    if (!detail || !('contraindications' in detail)) continue // absent key: Object.assign never touches base's value
    const detailList = Array.isArray(detail.contraindications) ? detail.contraindications : []

    if (detailList.length === 0) {
      if (Array.isArray(record.contraindications) && record.contraindications.length > 0) {
        findings.push({ slug: record.slug, reason: 'empty_override', missing: [] })
      }
      continue
    }

    const additiveMechs = (tagsBySlug[record.slug] || [])
      .filter((t) => t.pair_behavior === 'additive' && ADDITIVE_MECHS.has(t.risk_mechanism))
      .map((t) => t.risk_mechanism)
    if (additiveMechs.length === 0) continue

    const detailText = detailList.join(' ').toLowerCase()
    const missing = additiveMechs.filter((mech) => !KEYWORDS[mech].some((k) => detailText.includes(k)))
    if (missing.length > 0) {
      findings.push({ slug: record.slug, reason: 'stale_mechanism', missing })
    }
  }
  return findings
}

function main() {
  const herbs = loadFlatList('herbs.json')
  const compounds = loadFlatList('compounds.json')
  const tagsBySlug = JSON.parse(fs.readFileSync(path.join(dataDir, 'entity_risk_tags.json'), 'utf8'))

  const herbFindings = findStaleDetailRecords(herbs, tagsBySlug, makeDetailReader('herbs-detail'))
  const compoundFindings = findStaleDetailRecords(compounds, tagsBySlug, makeDetailReader('compounds-detail'))
  const findings = [...herbFindings, ...compoundFindings]

  if (findings.length === 0) {
    console.log('[guard:detail-additive-freshness] PASS: no stale herbs-detail/compounds-detail additive-mechanism overrides found.')
    process.exit(0)
  }

  console.error(`[guard:detail-additive-freshness] FAIL: ${findings.length} detail-file override(s) would hide current safety content:\n`)
  for (const f of findings) {
    if (f.reason === 'empty_override') {
      console.error(`  - ${f.slug}: detail file has an empty "contraindications": [] that clobbers a non-empty flat record`)
    } else {
      console.error(`  - ${f.slug}: detail file's contraindications is missing newly-added mechanism(s): ${f.missing.join(', ')}`)
    }
  }
  console.error('\nFix with: node scripts/data/sync-detail-backfill.mjs (or npm run data:sync-detail-backfill), then re-run this guard.')
  process.exit(1)
}

if (process.argv[1] === __filename) {
  main()
}
