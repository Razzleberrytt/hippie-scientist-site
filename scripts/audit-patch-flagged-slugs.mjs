#!/usr/bin/env node
// Checks whether any workbook-patch file in data-sources/workbook-patches/
// already recorded a `requires_human_review: true` decision for one or more
// slugs, before a cycle starts drafting new content for those slugs.
//
// This exists because a direct edit (e.g. via edit-entity-master-cell.mjs)
// can silently reverse a deliberate, sourced, human-flagged patch decision
// made through the separate workbook-patch pipeline on the same cell/column —
// see docs/LOOP_NOTES.md, 2026-07-16 "Skipped a creatine/.../.../ contra-
// indications fill" entry, for the incident this script is meant to prevent.
// Run this for every target slug up front, before drafting content, not just
// before opening a PR.
//
// Usage: node scripts/audit-patch-flagged-slugs.mjs <slug> [slug...]
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')
const patchDir = path.join(repoRoot, 'data-sources/workbook-patches')

// Reads and parses every *.json patch file in `dir`. Fails closed: this is a
// pre-drafting safety gate, so a file we can't read or parse must not be
// silently dropped — it could be the one file recording the human-review
// hold a cycle is trying to check for. Throws listing every bad file rather
// than reporting a false-clear "no history found."
export function loadPatchesByFile(dir) {
  const patchesByFile = {}
  const unreadable = []
  for (const name of fs.readdirSync(dir).filter((n) => n.endsWith('.json')).sort()) {
    try {
      patchesByFile[name] = JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'))
    } catch (error) {
      unreadable.push(`${name}: ${error.message}`)
    }
  }
  if (unreadable.length > 0) {
    throw new Error(
      `Could not read/parse ${unreadable.length} workbook-patch file(s), so a human-review hold could be hidden in one of them:\n` +
        unreadable.map((line) => `  - ${line}`).join('\n'),
    )
  }
  return patchesByFile
}

// Pure: given { fileName -> parsed patch JSON } and a list of target slugs,
// return every `changes[]` entry across `status: "applied"` patch files that
// touches one of those slugs.
export function findFlaggedChanges(patchesByFile, slugs) {
  const slugSet = new Set(slugs)
  const hits = []
  for (const [file, patch] of Object.entries(patchesByFile)) {
    if (!patch || patch.status !== 'applied' || !Array.isArray(patch.changes)) continue
    for (const change of patch.changes) {
      if (!change || !slugSet.has(change.slug)) continue
      hits.push({ file, patchId: patch.id, ...change })
    }
  }
  return hits
}

function main() {
  const slugs = process.argv.slice(2).map((s) => s.trim()).filter(Boolean)

  if (slugs.length === 0) {
    console.error('Usage: node scripts/audit-patch-flagged-slugs.mjs <slug> [slug...]')
    process.exit(1)
  }

  if (!fs.existsSync(patchDir)) {
    console.log('[audit:patch-flagged-slugs] No workbook patch directory present — nothing to check.')
    process.exit(0)
  }

  let patchesByFile
  try {
    patchesByFile = loadPatchesByFile(patchDir)
  } catch (error) {
    console.error(`[audit:patch-flagged-slugs] FAIL: ${error.message}`)
    process.exit(1)
  }

  const hits = findFlaggedChanges(patchesByFile, slugs)

  if (hits.length === 0) {
    console.log(`[audit:patch-flagged-slugs] No applied workbook-patch history found for: ${slugs.join(', ')}`)
    process.exit(0)
  }

  const flagged = hits.filter((h) => h.requires_human_review === true)

  console.log(`[audit:patch-flagged-slugs] Found ${hits.length} applied change(s) across ${new Set(hits.map((h) => h.file)).size} patch file(s) for: ${slugs.join(', ')}\n`)

  for (const hit of hits) {
    const marker = hit.requires_human_review === true ? 'REQUIRES HUMAN REVIEW' : 'informational'
    console.log(`- [${marker}] ${hit.slug}.${hit.column} (${hit.file} / ${hit.patchId})`)
    console.log(`    new_value: ${JSON.stringify(hit.new_value)}`)
    if (hit.rationale) console.log(`    rationale: ${hit.rationale}`)
    console.log('')
  }

  if (flagged.length > 0) {
    console.log(
      `[audit:patch-flagged-slugs] HOLD: ${flagged.length} change(s) above are flagged requires_human_review — ` +
        'do not draft content that reverses these without a human decision. Skip the affected slug/column, ' +
        "don't route around the flag.",
    )
    process.exit(2)
  }

  console.log('[audit:patch-flagged-slugs] PASS: no requires_human_review holds for these slugs.')
  process.exit(0)
}

if (process.argv[1] === __filename) {
  main()
}
