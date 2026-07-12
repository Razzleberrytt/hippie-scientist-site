#!/usr/bin/env node
import fs from 'node:fs'
import os from 'node:os'
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

function runPatchCheck(patchPath) {
  return spawnSync(process.execPath, [runner, '--patch', patchPath], {
    cwd: repoRoot,
    encoding: 'utf8',
  })
}

function resultOutput(result) {
  return [result.stdout, result.stderr].filter(Boolean).join('\n').trim()
}

const failures = []
for (const name of patchFiles) {
  const patchPath = path.join(patchDir, name)
  const patch = JSON.parse(fs.readFileSync(patchPath, 'utf8'))
  const result = runPatchCheck(patchPath)

  if (result.status !== 0) {
    failures.push({ name, output: resultOutput(result) })
    continue
  }

  if (patch.status === 'applied') {
    const verificationPatch = {
      ...patch,
      status: 'proposal',
      id: `${patch.id}-applied-value-verification`,
      changes: patch.changes.map((change) => ({
        ...change,
        expected_old_value: change.new_value,
      })),
    }
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'workbook-patch-verify-'))
    const tempPatch = path.join(tempDir, name)
    try {
      fs.writeFileSync(tempPatch, `${JSON.stringify(verificationPatch, null, 2)}\n`, 'utf8')
      const appliedResult = runPatchCheck(tempPatch)
      if (appliedResult.status !== 0) {
        failures.push({
          name,
          output: `Applied patch record does not match the workbook's current values.\n${resultOutput(appliedResult)}`,
        })
        continue
      }
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
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

console.log(`[validate-workbook-patches] PASS: validated ${patchFiles.length} patch record(s) against the current workbook.`)
