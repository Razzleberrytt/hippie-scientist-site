#!/usr/bin/env node
// Fixes the findings from scripts/ci/guard-detail-additive-freshness.mjs by
// unioning each stale herbs-detail/compounds-detail record's `contraindications`
// array with its flat herbs.json/compounds.json counterpart, instead of
// overwriting one with the other.
//
// A plain overwrite in either direction would lose real content: some detail
// files carry independent, more specific interaction prose the flat record
// never had (e.g. magnesium's detail file lists specific drug-interaction
// mechanisms the flat record only summarizes), while the flat record is the
// one that picks up new ADDITIVE-mechanism safety flags as the workbook is
// enriched. Taking the union keeps every existing phrase (detail's own items
// first, to minimize diff noise) and appends whatever flat-record phrases
// aren't already present (case-insensitive, trimmed).
//
// Never fabricates content — every phrase written already existed on one of
// the two source records.
//
// Usage: node scripts/data/backfill-detail-additive-mechanisms.mjs [--dry-run]
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { findStaleDetailRecords } from '../ci/guard-detail-additive-freshness.mjs'

const __filename = fileURLToPath(import.meta.url)
const repoRoot = path.resolve(path.dirname(__filename), '../..')
const dataDir = path.join(repoRoot, 'public/data')
const dryRun = process.argv.includes('--dry-run')

function loadFlatList(fileName) {
  const parsed = JSON.parse(fs.readFileSync(path.join(dataDir, fileName), 'utf8'))
  return Array.isArray(parsed) ? parsed : Object.values(parsed).find(Array.isArray) || []
}

function detailPath(detailDirName, slug) {
  return path.join(dataDir, detailDirName, `${slug}.json`)
}

function unionLists(detailList, flatList) {
  const seen = new Set(detailList.map((s) => String(s).toLowerCase().trim()))
  const merged = [...detailList]
  for (const item of flatList) {
    const key = String(item).toLowerCase().trim()
    if (!key || seen.has(key)) continue
    seen.add(key)
    merged.push(item)
  }
  return merged
}

function fixGroup(flatFileName, detailDirName, tagsBySlug) {
  const flatList = loadFlatList(flatFileName)
  const readDetail = (slug) => {
    const file = detailPath(detailDirName, slug)
    return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null
  }
  const findings = findStaleDetailRecords(flatList, tagsBySlug, readDetail)
  const flatBySlug = new Map(flatList.map((r) => [r.slug, r]))

  for (const finding of findings) {
    const file = detailPath(detailDirName, finding.slug)
    const detail = JSON.parse(fs.readFileSync(file, 'utf8'))
    const flatRecord = flatBySlug.get(finding.slug)
    const flatContraindications = Array.isArray(flatRecord?.contraindications) ? flatRecord.contraindications : []
    const detailContraindications = Array.isArray(detail.contraindications) ? detail.contraindications : []

    const merged = unionLists(detailContraindications, flatContraindications)
    detail.contraindications = merged

    console.log(`  ${finding.slug} (${finding.reason}): ${detailContraindications.length} -> ${merged.length} item(s)`)
    if (!dryRun) {
      fs.writeFileSync(file, `${JSON.stringify(detail, null, 2)}\n`)
    }
  }

  return findings.length
}

function main() {
  const tagsBySlug = JSON.parse(fs.readFileSync(path.join(dataDir, 'entity_risk_tags.json'), 'utf8'))

  console.log(`[backfill-detail-additive-mechanisms]${dryRun ? ' (dry run)' : ''} herbs-detail:`)
  const herbCount = fixGroup('herbs.json', 'herbs-detail', tagsBySlug)

  console.log(`[backfill-detail-additive-mechanisms]${dryRun ? ' (dry run)' : ''} compounds-detail:`)
  const compoundCount = fixGroup('compounds.json', 'compounds-detail', tagsBySlug)

  console.log(`\n[backfill-detail-additive-mechanisms] ${herbCount + compoundCount} file(s) ${dryRun ? 'would be' : ''} updated.`)
}

if (process.argv[1] === __filename) {
  main()
}
