#!/usr/bin/env node
// data:review-patches — human-readable summary of normalized patches awaiting
// review in data/patches/normalized/. Read-only.
//
// NOTE: the repo already has an unrelated agent `scripts/review-patches.mjs`.
// This one operates on the canonical patch inbox and lives under scripts/data/.

import fs from 'node:fs'
import path from 'node:path'
import { readJson } from './canonical/jsonl.mjs'
import { patchNormalizedDir } from './canonical/paths.mjs'

function main() {
  if (!fs.existsSync(patchNormalizedDir)) {
    console.log('no normalized patches')
    return
  }
  const files = fs
    .readdirSync(patchNormalizedDir)
    .filter((f) => f.endsWith('.json') && !f.startsWith('_') && !f.endsWith('.report.json'))
    .sort()

  if (!files.length) {
    console.log('no normalized patches to review')
    return
  }

  let needsReview = 0
  for (const file of files) {
    const patch = readJson(path.join(patchNormalizedDir, file))
    if (!patch) continue
    const targetDesc = patch.target?.id || patch.target?.slug || patch.target?.canonical_name || patch.target?.alias || '(untargeted)'
    const flag = patch.requires_review ? '⚑ REVIEW' : '  ready '
    if (patch.requires_review) needsReview += 1
    console.log(`${flag}  ${patch.patch_id}`)
    console.log(`         target: ${targetDesc}${patch.target?.entity_type ? ` [${patch.target.entity_type}]` : ''}`)
    console.log(`         operations: ${patch.operations.map((o) => o.op).join(', ')}`)
    console.log(`         sources: ${patch.sources.length}  confidence: ${patch.confidence}  generator: ${patch.generator || 'unknown'}`)
  }
  console.log(`\n${files.length} normalized patch(es); ${needsReview} require review before apply.`)
}

main()
