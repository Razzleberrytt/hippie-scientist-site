#!/usr/bin/env node
/**
 * Regenerate herbs-detail/compounds-detail so they pick up
 * apply-governance-overlay.mjs's backfillEmptyDetailFields() (which copies
 * fields like dosage/typical_dosage/contraindications from a flat record into
 * an EXISTING detail file), without leaving behind the flat-file "governance
 * overlay drift" that a plain `npm run data:build` introduces on
 * herbs.json/compounds.json/manifests — drift that `data:build:core` (what
 * CI/deploy actually runs; see CLAUDE.md) never produces and that
 * guard-no-full-build-drift correctly rejects.
 *
 * Why this is needed at all: that backfill step only runs as part of the
 * FULL data:build pipeline, never data:build:core. So a workbook edit landed
 * via the fast/core path (the documented day-to-day enrichment flow) can
 * leave herbs-detail/compounds-detail stale indefinitely unless someone
 * separately runs the full pipeline and hand-picks the detail diffs back out
 * from its drift on everything else. See docs/LOOP_NOTES.md ("detail-file
 * staleness") for the incidents this caused.
 *
 * This mirrors the exact sequence a full `data:build` runs up through the
 * governance overlay (fresh workbook parse -> postprocess -> overlay) so the
 * detail-file backfill is byte-identical to what the full pipeline would
 * produce, then restores every file the full pipeline touches OTHER than
 * herbs-detail/compounds-detail to their pre-run state, and finally runs
 * data:build:core's full sequence (starting with ANOTHER fresh workbook
 * parse, not just the restored snapshot) so herbs.json/compounds.json/
 * summary-indexes/search-index reflect the current workbook exactly as
 * CI/deploy would generate them — this second parse is what keeps detail
 * files and summary/search data consistent with each other even if the
 * workbook was edited only moments before this script ran (the restored
 * snapshot alone could otherwise be one step behind). Never touches the
 * workbook and never fabricates content — every field it copies already
 * exists on the flat record.
 *
 * IMPORTANT: run this from a clean working tree (or at least with no
 * intended-but-uncommitted changes to the files it snapshots/restores below)
 * — anything not in that list that the full-pipeline steps touch will be
 * left as-is, and anything already dirty in RESTORE_PATHS before this runs
 * will be reverted to that dirty state, not to HEAD.
 *
 * Usage: node scripts/data/sync-detail-backfill.mjs
 *   (or: npm run data:sync-detail-backfill)
 * Safe to run any time; a clean, already-in-sync tree produces zero diffs.
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const repoRoot = process.cwd()
const dataDir = path.join(repoRoot, 'public/data')

// Everything the full pipeline steps below touch OTHER than
// herbs-detail/compounds-detail. Restored after the run so only the detail
// backfill survives; data:build:core regenerates the flat/summary files
// afterward so they stay exactly what CI/deploy would produce.
const RESTORE_PATHS = [
  'public/data/herbs.json',
  'public/data/compounds.json',
  'public/data/_meta/build-info.json',
  'ops/audit/governance-overlay-report.json',
]

function snapshot() {
  const snap = new Map()
  for (const rel of RESTORE_PATHS) {
    const abs = path.join(repoRoot, rel)
    snap.set(rel, fs.existsSync(abs) ? fs.readFileSync(abs) : null)
  }
  return snap
}

function restore(snap) {
  for (const [rel, contents] of snap.entries()) {
    const abs = path.join(repoRoot, rel)
    if (contents === null) continue
    fs.writeFileSync(abs, contents)
  }
}

const before = snapshot()

execFileSync('node', ['scripts/data/build-runtime-from-workbook.mjs', '--out', 'public/data'], {
  cwd: repoRoot,
  stdio: 'inherit',
})
execFileSync('node', ['scripts/data/postprocess-workbook-payloads.mjs'], {
  cwd: repoRoot,
  stdio: 'inherit',
})
execFileSync('node', ['scripts/data/apply-governance-overlay.mjs', `--data-dir=${dataDir}`], {
  cwd: repoRoot,
  stdio: 'inherit',
})

restore(before)

// Regenerate herbs.json/compounds.json from the workbook again (rather than
// trusting the "before" snapshot to still be current) so a workbook edit
// made just before this script ran is reflected consistently in BOTH the
// detail files above and the flat/summary/search files below — otherwise a
// stale snapshot restore here would leave detail pages one step ahead of
// summary/search data.
execFileSync('node', ['scripts/data/build-runtime-from-workbook.mjs', '--out', 'public/data'], {
  cwd: repoRoot,
  stdio: 'inherit',
})
execFileSync('node', ['scripts/data/build-runtime-summary-indexes.mjs', `--data-dir=${dataDir}`], {
  cwd: repoRoot,
  stdio: 'inherit',
})
execFileSync('node', ['scripts/data/build-export-batches.mjs', `--data-dir=${dataDir}`], {
  cwd: repoRoot,
  stdio: 'inherit',
})
execFileSync('node', ['scripts/data/build-search-index.mjs', `--data-dir=${dataDir}`], {
  cwd: repoRoot,
  stdio: 'inherit',
})

const status = execFileSync('git', ['status', '--porcelain', '--', 'public/data/herbs-detail', 'public/data/compounds-detail'], {
  cwd: repoRoot,
  encoding: 'utf8',
})
const changed = status.split('\n').map((l) => l.trim()).filter(Boolean)

console.log('')
console.log(`[sync-detail-backfill] ${changed.length} detail file(s) changed:`)
changed.forEach((line) => console.log(`  ${line}`))
if (changed.length === 0) {
  console.log('[sync-detail-backfill] Detail files already in sync with herbs.json/compounds.json.')
}
