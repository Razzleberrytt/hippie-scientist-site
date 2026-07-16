#!/usr/bin/env node
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

export function findStaleDetailRecords(flatRecords, tagsBySlug, readDetail) {
  const findings = []
  for (const record of flatRecords) {
    if (!record?.slug || record.runtime_export_decision === CLUSTER_MEMBER_RUNTIME_DECISION) continue
    const detail = readDetail(record.slug)
    if (!detail || !('contraindications' in detail)) continue
    const detailList = Array.isArray(detail.contraindications) ? detail.contraindications : []

    if (detailList.length === 0) {
      if (Array.isArray(record.contraindications) && record.contraindications.length > 0) {
        findings.push({ slug: record.slug, reason: 'empty_override', missing: [] })
      }
      continue
    }

    const additiveMechs = (tagsBySlug[record.slug] || [])
      .filter((tag) => tag.pair_behavior === 'additive' && ADDITIVE_MECHS.has(tag.risk_mechanism))
      .map((tag) => tag.risk_mechanism)
    if (additiveMechs.length === 0) continue

    const detailText = detailList.join(' ').toLowerCase()
    const missing = additiveMechs.filter((mechanism) => !KEYWORDS[mechanism].some((keyword) => detailText.includes(keyword)))
    if (missing.length > 0) findings.push({ slug: record.slug, reason: 'stale_mechanism', missing })
  }
  return findings
}

function main() {
  const herbs = loadFlatList('herbs.json')
  const compounds = loadFlatList('compounds.json')
  const tagsBySlug = JSON.parse(fs.readFileSync(path.join(dataDir, 'entity_risk_tags.json'), 'utf8'))
  const findings = [
    ...findStaleDetailRecords(herbs, tagsBySlug, makeDetailReader('herbs-detail')),
    ...findStaleDetailRecords(compounds, tagsBySlug, makeDetailReader('compounds-detail')),
  ]

  if (findings.length === 0) {
    console.log('[guard:detail-additive-freshness] PASS: no stale detail safety overrides found.')
    return
  }

  console.error(`[guard:detail-additive-freshness] FAIL: ${findings.length} stale detail override(s):`)
  for (const finding of findings) {
    const reason = finding.reason === 'empty_override'
      ? 'empty contraindications array overrides a non-empty flat record'
      : `missing additive mechanism(s): ${finding.missing.join(', ')}`
    console.error(`  - ${finding.slug}: ${reason}`)
  }
  console.error('\nFix with: npm run data:backfill-detail-additive-mechanisms')
  process.exit(1)
}

if (process.argv[1] === __filename) main()
