#!/usr/bin/env node
// data:check — one-shot canonical health gate: validate → build SQLite →
// export sample. Any failure exits non-zero. Safe to run on an empty dataset.

import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))

function step(label, script) {
  console.log(`\n▶ ${label}`)
  execFileSync(process.execPath, [path.join(here, script)], { stdio: 'inherit' })
}

try {
  step('validate canonical', 'validate-canonical.mjs')
  step('build sqlite', 'build-sqlite.mjs')
  step('export sample', 'export-site-data.mjs')
  console.log('\n✓ data:check passed')
} catch (error) {
  console.error(`\n✗ data:check failed: ${error.message}`)
  process.exit(1)
}
