#!/usr/bin/env node
// data:patches:apply / data:patches:dry-run — apply normalized patches to
// canonical data transactionally.
//
// Dry-run by default. --apply commits. Workflow on --apply:
//   snapshot → apply batch → validate resulting dataset → (if valid) write
//   canonical + rebuild SQLite + regenerate sample export → move applied/rejected
//   → append immutable audit-log entry. If validation fails, nothing is written.
//
// Exit codes: 0 ok; 1 rejections or validation failure; 2 usage error.

import fs from 'node:fs'
import path from 'node:path'
import { loadDataset, writeEntities, writeClaims, writeEdges, writeSources } from './canonical/store.mjs'
import { readJson, writeJson, ensureDir } from './canonical/jsonl.mjs'
import { applyBatch, batchHash } from './canonical/apply.mjs'
import { validateDataset } from './canonical/validate.mjs'
import { createSnapshot } from './canonical/snapshot.mjs'
import { recordAudit } from './canonical/audit-log.mjs'
import { normalizedPatchSchema } from './canonical/schema.mjs'
import { buildDatabase } from './build-sqlite.mjs'
import { exportSampleSiteData } from './export-site-data.mjs'
import {
  patchNormalizedDir,
  patchAppliedDir,
  patchRejectedDir,
} from './canonical/paths.mjs'

function parseArgs(argv) {
  const args = { apply: false, file: null, force: false, allowDestructive: false, rebuild: true }
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i]
    if (a === '--apply') args.apply = true
    else if (a === '--dry-run') args.apply = false
    else if (a === '--force') args.force = true
    else if (a === '--allow-destructive') args.allowDestructive = true
    else if (a === '--no-rebuild') args.rebuild = false
    else if (a === '--file') { args.file = argv[i + 1]; i += 1 }
    else if (a.startsWith('--file=')) args.file = a.slice('--file='.length)
  }
  return args
}

function loadNormalizedPatches(file) {
  const files = file
    ? [file]
    : (fs.existsSync(patchNormalizedDir)
      ? fs.readdirSync(patchNormalizedDir).filter((f) => f.endsWith('.json') && !f.startsWith('_') && !f.endsWith('.report.json')).map((f) => path.join(patchNormalizedDir, f)).sort()
      : [])
  const patches = []
  const invalid = []
  for (const f of files) {
    const raw = readJson(f)
    if (!raw) { invalid.push({ file: f, reason: 'unreadable' }); continue }
    const parsed = normalizedPatchSchema.safeParse(raw)
    if (!parsed.success) { invalid.push({ file: f, reason: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') }); continue }
    patches.push({ ...parsed.data, __file: f })
  }
  return { patches, invalid }
}

function alreadyApplied(patchId) {
  return fs.existsSync(path.join(patchAppliedDir, `${patchId}.json`))
}

function printDiff(results) {
  for (const r of results) {
    const icon = r.status === 'applied' ? '✎' : r.status === 'noop' ? '·' : r.status === 'rejected' ? '✗' : '?'
    console.log(`\n${icon} ${r.patch_id} — ${r.status}${r.target_id ? ` (${r.target_id})` : ''}`)
    if (r.reason) console.log(`    reason: ${r.reason}`)
    for (const c of r.changes) {
      if (c.type === 'update_field') console.log(`    field ${c.field}: ${JSON.stringify(c.old)} → ${JSON.stringify(c.new)}`)
      else console.log(`    ${c.type}: ${JSON.stringify(Object.fromEntries(Object.entries(c).filter(([k]) => k !== 'type')))}`)
    }
    for (const c of r.conflicts) console.log(`    ⚠ conflict [${c.type}]: ${c.reason || JSON.stringify(c)}`)
    for (const w of r.warnings) console.log(`    ⚠ ${w}`)
    if (r.requires_review) console.log('    ⚑ requires human review')
  }
}

function main() {
  const args = parseArgs(process.argv)
  const { patches: allPatches, invalid } = loadNormalizedPatches(args.file)

  for (const inv of invalid) console.error(`✗ invalid patch ${inv.file}: ${inv.reason}`)

  // Idempotency: skip patches already applied.
  const patches = allPatches.filter((p) => {
    if (alreadyApplied(p.patch_id)) {
      console.log(`· ${p.patch_id} already applied — skipping (idempotent)`)
      return false
    }
    return true
  })

  if (!patches.length) {
    console.log('no patches to apply')
    process.exit(invalid.length ? 1 : 0)
  }

  const dataset = loadDataset()
  const { dataset: nextDataset, results } = applyBatch(dataset, patches, { force: args.force, allowDestructive: args.allowDestructive })

  const applied = results.filter((r) => r.status === 'applied')
  const noop = results.filter((r) => r.status === 'noop')
  const rejected = results.filter((r) => r.status === 'rejected')

  printDiff(results)

  console.log(`\nsummary: ${applied.length} applied, ${noop.length} no-op, ${rejected.length} rejected, ${invalid.length} invalid`)
  console.log(`dataset hash: ${batchHash(dataset)} → ${batchHash(nextDataset)}`)

  if (!args.apply) {
    console.log('\n(dry run — pass --apply to commit)')
    process.exit(rejected.length || invalid.length ? 1 : 0)
  }

  // Validate the resulting dataset before committing anything.
  const validation = validateDataset(nextDataset)
  if (!validation.ok) {
    console.error(`\n✗ resulting dataset failed validation (${validation.schemaErrorCount} schema + ${validation.refErrors.length} ref errors) — NOTHING committed`)
    for (const e of validation.refErrors.slice(0, 10)) console.error(`    ${e}`)
    process.exit(1)
  }

  // Snapshot, then commit.
  const snapshot = createSnapshot('pre-apply')
  console.log(`\n✓ snapshot: ${snapshot.name}`)

  writeEntities(nextDataset.entities)
  writeClaims(nextDataset.claims)
  writeEdges(nextDataset.edges)
  writeSources(nextDataset.sources)

  if (args.rebuild) {
    buildDatabase()
    exportSampleSiteData()
  }

  // Move applied/rejected patch files + audit.
  ensureDir(patchAppliedDir)
  ensureDir(patchRejectedDir)
  for (const r of [...applied, ...noop]) {
    const patch = patches.find((p) => p.patch_id === r.patch_id)
    if (patch?.__file && fs.existsSync(patch.__file)) {
      writeJson(path.join(patchAppliedDir, `${r.patch_id}.json`), { ...readJson(patch.__file), _apply_result: { status: r.status, changes: r.changes.length, at: new Date().toISOString() } })
      fs.rmSync(patch.__file)
    }
  }
  for (const r of rejected) {
    const patch = patches.find((p) => p.patch_id === r.patch_id)
    if (patch?.__file && fs.existsSync(patch.__file)) {
      writeJson(path.join(patchRejectedDir, `${r.patch_id}.json`), { ...readJson(patch.__file), _rejection: { reason: r.reason, conflicts: r.conflicts, at: new Date().toISOString() } })
      fs.rmSync(patch.__file)
    }
  }

  recordAudit({
    action: 'apply',
    snapshot: snapshot.name,
    applied: applied.map((r) => r.patch_id),
    noop: noop.map((r) => r.patch_id),
    rejected: rejected.map((r) => ({ patch_id: r.patch_id, reason: r.reason })),
    dataset_hash_before: batchHash(dataset),
    dataset_hash_after: batchHash(nextDataset),
  })

  console.log(`\n✓ committed. ${applied.length} applied, ${rejected.length} rejected. Snapshot ${snapshot.name} available for rollback.`)
  process.exit(rejected.length ? 1 : 0)
}

main()
