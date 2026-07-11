#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')
const patchDir = path.join(repoRoot, 'data-sources/workbook-patches')
const runner = path.join(repoRoot, 'scripts/data/apply-workbook-patch.mjs')

if (!fs.existsSync(patchDir)) {
  console.log('[validate-workbook-patches] PASS: no workbook patch directory present.')
  process.exit(0)
}

const patchFiles = fs.readdirSync(patchDir)
  .filter((name) => name.endsWith('.json'))
  .sort()

if (patchFiles.length === 0) {
  console.log('[validate-workbook-patches] PASS: no workbook patch proposals present.')
  process.exit(0)
}

const failures = []
for (const name of patchFiles) {
  const patchPath = path.join(patchDir, name)
  const result = spawnSync(process.execPath, [runner, '--patch', patchPath], {
    cwd: repoRoot,
    encoding: 'utf8',
  })

  if (result.status !== 0) {
    failures.push({
      name,
      output: [result.stdout, result.stderr].filter(Boolean).join('\n').trim(),
    })
    continue
  }

  console.log(`[validate-workbook-patches] PASS: ${name}`)
}

if (failures.length > 0) {
  console.error(`[validate-workbook-patches] FAIL: ${failures.length} invalid or stale patch(es).`)
  for (const failure of failures) {
    console.error(`\n--- ${failure.name} ---\n${failure.output}`)
  }
  process.exit(1)
}

console.log(`[validate-workbook-patches] PASS: validated ${patchFiles.length} patch proposal(s) against the current workbook.`)
