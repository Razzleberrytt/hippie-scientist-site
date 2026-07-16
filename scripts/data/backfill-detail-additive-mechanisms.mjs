#!/usr/bin/env node
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

export function unionLists(detailList, flatList) {
  const seen = new Set(detailList.map((item) => String(item).toLowerCase().trim()))
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
  const flatBySlug = new Map(flatList.map((record) => [record.slug, record]))

  for (const finding of findings) {
    const file = detailPath(detailDirName, finding.slug)
    const detail = JSON.parse(fs.readFileSync(file, 'utf8'))
    const flatRecord = flatBySlug.get(finding.slug)
    const flatListValue = Array.isArray(flatRecord?.contraindications) ? flatRecord.contraindications : []
    const detailListValue = Array.isArray(detail.contraindications) ? detail.contraindications : []
    const merged = unionLists(detailListValue, flatListValue)
    detail.contraindications = merged
    console.log(`  ${finding.slug}: ${detailListValue.length} -> ${merged.length}`)
    if (!dryRun) fs.writeFileSync(file, `${JSON.stringify(detail, null, 2)}\n`)
  }

  return findings.length
}

function main() {
  const tagsBySlug = JSON.parse(fs.readFileSync(path.join(dataDir, 'entity_risk_tags.json'), 'utf8'))
  const herbCount = fixGroup('herbs.json', 'herbs-detail', tagsBySlug)
  const compoundCount = fixGroup('compounds.json', 'compounds-detail', tagsBySlug)
  console.log(`[backfill-detail-additive-mechanisms] ${herbCount + compoundCount} file(s) ${dryRun ? 'would be ' : ''}updated.`)
}

if (process.argv[1] === __filename) main()
