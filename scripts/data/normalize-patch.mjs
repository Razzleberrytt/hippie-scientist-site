#!/usr/bin/env node
// data:normalize-patch — normalize a single patch file into the canonical patch
// format. Writes the normalized patch(es) to data/patches/normalized/ and a
// per-file normalization report. Preserves the raw input permanently (copies it
// into normalized/ alongside). Never applies anything.
//
// Usage: node scripts/data/normalize-patch.mjs --file data/patches/inbox/example.md

import fs from 'node:fs'
import path from 'node:path'
import { normalizePatch } from './canonical/patch-normalize.mjs'
import { normalizedPatchSchema, validateAll } from './canonical/schema.mjs'
import { writeJson, ensureDir } from './canonical/jsonl.mjs'
import { patchNormalizedDir } from './canonical/paths.mjs'

function parseArgs(argv) {
  const args = { file: null, outDir: patchNormalizedDir }
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i]
    if (a === '--file') { args.file = argv[i + 1]; i += 1 }
    else if (a.startsWith('--file=')) args.file = a.slice('--file='.length)
    else if (a === '--out') { args.outDir = argv[i + 1]; i += 1 }
  }
  return args
}

export function normalizeFile(filePath, { outDir = patchNormalizedDir } = {}) {
  const filename = path.basename(filePath)
  const raw = fs.readFileSync(filePath, 'utf8')
  const result = normalizePatch({ filename, raw })

  if (!result.ok) {
    return { ok: false, filename, error: result.error, format: result.format }
  }

  ensureDir(outDir)
  // Preserve the raw input permanently.
  const rawCopyPath = path.join(outDir, `${filename}.raw`)
  fs.writeFileSync(rawCopyPath, raw, 'utf8')

  // Validate each normalized patch (strip internal _warnings before schema check).
  const cleaned = result.patches.map(({ _warnings, ...patch }) => patch)
  const { errors } = validateAll(normalizedPatchSchema, cleaned, 'patch')

  const outputs = []
  for (const patch of result.patches) {
    const { _warnings, ...clean } = patch
    const outPath = path.join(outDir, `${clean.patch_id}.json`)
    writeJson(outPath, clean)
    outputs.push({ patch_id: clean.patch_id, path: path.relative(process.cwd(), outPath), warnings: _warnings, requires_review: clean.requires_review, operations: clean.operations.length, sources: clean.sources.length })
  }

  const report = {
    filename,
    format: result.format,
    raw_hash: cleaned[0]?.original_hash,
    patches: outputs,
    schema_errors: errors,
    normalized_count: outputs.length,
  }
  writeJson(path.join(outDir, `${filename}.report.json`), report)
  return { ok: errors.length === 0, filename, format: result.format, report }
}

function main() {
  const args = parseArgs(process.argv)
  if (!args.file) {
    console.error('usage: normalize-patch.mjs --file <path>')
    process.exit(2)
  }
  const res = normalizeFile(args.file, { outDir: args.outDir })
  if (!res.ok) {
    console.error(`✗ ${args.file}: ${res.error || 'schema validation failed'}`)
    if (res.report) {
      for (const p of res.report.patches) {
        console.log(`  • ${p.patch_id} — ops=${p.operations} sources=${p.sources} review=${p.requires_review}`)
        for (const w of p.warnings || []) console.log(`      ⚠ ${w}`)
      }
      for (const e of res.report.schema_errors) console.error(`  ✗ schema: ${e.id} — ${e.issues.map((i) => `${i.path}: ${i.message}`).join('; ')}`)
    }
    process.exit(1)
  }
  console.log(`✓ normalized ${args.file} (${res.format}) → ${res.report.normalized_count} patch(es)`)
  for (const p of res.report.patches) {
    console.log(`  • ${p.patch_id} — ops=${p.operations} sources=${p.sources} review=${p.requires_review}`)
    for (const w of p.warnings || []) console.log(`      ⚠ ${w}`)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main()
