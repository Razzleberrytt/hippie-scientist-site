#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { readJson } from '../data/canonical/jsonl.mjs'
import { verifyFinalizedProfile } from '../data/canonical/evidence-finalize.mjs'

const root = process.cwd()
const reviewDir = path.join(root, 'data/reviews/evidence')

if (!fs.existsSync(reviewDir)) {
  console.log('No evidence review manifests found.')
  process.exit(0)
}

const manifests = fs.readdirSync(reviewDir)
  .filter((filename) => filename.endsWith('.manifest.json'))
  .sort()

const errors = []
let pending = 0
let approved = 0

for (const filename of manifests) {
  const manifestPath = path.join(reviewDir, filename)
  const manifest = readJson(manifestPath)
  const label = path.relative(root, manifestPath)

  if (!manifest || typeof manifest !== 'object') {
    errors.push(`${label}: invalid JSON object`)
    continue
  }
  if (manifest.schema_version !== 1) errors.push(`${label}: schema_version must be 1`)
  if (!manifest.slug || !manifest.entity_id || !manifest.entity_type || !manifest.batch_hash) {
    errors.push(`${label}: slug, entity_id, entity_type, and batch_hash are required`)
  }
  for (const key of ['approved_patch_ids', 'approved_claim_ids', 'approved_source_ids', 'deprecated_claim_ids', 'deprecated_source_ids']) {
    if (!Array.isArray(manifest[key])) errors.push(`${label}: ${key} must be an array`)
  }

  if (manifest.decision === 'pending') {
    pending += 1
    continue
  }
  if (manifest.decision !== 'approved') {
    errors.push(`${label}: decision must be pending or approved`)
    continue
  }

  approved += 1
  if (!String(manifest.reviewer || '').trim()) errors.push(`${label}: approved manifest requires reviewer`)
  if (!manifest.reviewed_at || Number.isNaN(Date.parse(manifest.reviewed_at))) {
    errors.push(`${label}: approved manifest requires a valid reviewed_at timestamp`)
  }

  const detailDir = manifest.entity_type === 'herb' ? 'herbs-detail' : 'compounds-detail'
  const detailPath = path.join(root, 'public/data', detailDir, `${manifest.slug}.json`)
  const record = readJson(detailPath)
  const verification = verifyFinalizedProfile({ record, manifest })
  for (const error of verification.errors) errors.push(`${label}: ${error}`)
}

console.log(`Evidence reviews: ${approved} approved, ${pending} pending, ${errors.length} error(s)`)
if (errors.length) {
  for (const error of errors) console.error(`✗ ${error}`)
  process.exit(1)
}
