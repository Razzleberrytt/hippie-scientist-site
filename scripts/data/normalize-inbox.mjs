#!/usr/bin/env node
// data:normalize-inbox — normalize every patch file in data/patches/inbox/ into
// data/patches/normalized/, writing an aggregate report. Never applies.

import fs from 'node:fs'
import path from 'node:path'
import { normalizeFile } from './normalize-patch.mjs'
import { writeJson } from './canonical/jsonl.mjs'
import { patchInboxDir, patchNormalizedDir } from './canonical/paths.mjs'

const SUPPORTED = new Set(['.json', '.jsonl', '.ndjson', '.yaml', '.yml', '.csv', '.md', '.markdown'])

function main() {
  if (!fs.existsSync(patchInboxDir)) {
    console.log('inbox is empty (no directory)')
    return
  }
  const files = fs
    .readdirSync(patchInboxDir)
    .filter((f) => SUPPORTED.has(path.extname(f).toLowerCase()))
    .sort()

  if (!files.length) {
    console.log('inbox is empty')
    return
  }

  const results = []
  let ok = 0
  let failed = 0
  for (const file of files) {
    const res = normalizeFile(path.join(patchInboxDir, file))
    if (res.ok) ok += 1
    else failed += 1
    results.push({ file, ok: res.ok, format: res.format, error: res.error, patches: res.report?.patches?.length || 0, review: res.report?.patches?.filter((p) => p.requires_review).length || 0 })
    const mark = res.ok ? '✓' : '✗'
    console.log(`${mark} ${file} (${res.format || '?'}) — ${res.report?.patches?.length || 0} patch(es)${res.error ? ` — ${res.error}` : ''}`)
  }

  writeJson(path.join(patchNormalizedDir, '_inbox-report.json'), { normalized_at: new Date().toISOString(), total: files.length, ok, failed, results })
  console.log(`\n${ok}/${files.length} files normalized, ${failed} failed`)
  if (failed > 0) process.exit(1)
}

main()
