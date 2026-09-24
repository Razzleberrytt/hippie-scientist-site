#!/usr/bin/env node
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { readWorkbookExcelJS } from '../utils/read-workbook-exceljs.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')
const workbookPath = path.join(repoRoot, 'data-sources', 'herb_monograph_master.xlsx')
const editorPath = path.join(repoRoot, 'scripts', 'data', 'edit-entity-master-cell.mjs')

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

function runEditor(args, { expectFailure = false } = {}) {
  const result = spawnSync(process.execPath, [editorPath, ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
  })
  const output = [result.stdout, result.stderr].filter(Boolean).join('\n')
  if (expectFailure) {
    assert.notEqual(result.status, 0, `Expected editor to fail but it succeeded:\n${output}`)
    return output
  }
  assert.equal(result.status, 0, `Editor failed:\n${output}`)
  return output
}

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ths-workbook-append-test-'))
try {
  const rowPath = path.join(tempDir, 'row.json')
  const outPath = path.join(tempDir, 'with-appended-row.xlsx')
  const baseRow = {
    entity_type: 'compound',
    slug: 'append-row-regression-probe',
    name: 'Append Row Regression Probe',
    summary: 'Temporary regression fixture used only to validate the governed workbook append path.',
    description: 'Temporary regression fixture used only to validate the governed workbook append path.',
    primary_effects_or_targets: 'workbook append-path validation',
    evidence_tier: 'Limited Human Evidence',
    runtime_export_decision: 'hidden_until_grounded',
    profile_status: 'research_only',
  }
  writeJson(rowPath, baseRow)

  const original = await readWorkbookExcelJS(workbookPath)
  const originalRows = original.getSheetData('Entity_Master')

  const dryRun = runEditor(['--append-row-file', rowPath, '--dry-run'])
  assert.match(dryRun, /DRY RUN APPEND/)
  assert.match(dryRun, /append-row-regression-probe/)

  runEditor(['--append-row-file', rowPath, '--out', outPath])
  assert.ok(fs.existsSync(outPath), 'Expected appended workbook output')

  const edited = await readWorkbookExcelJS(outPath)
  const editedRows = edited.getSheetData('Entity_Master')
  assert.equal(editedRows.length, originalRows.length + 1, 'Append must add exactly one parsed Entity_Master row')
  assert.deepEqual(
    editedRows.slice(0, originalRows.length),
    originalRows,
    'Append must preserve every pre-existing Entity_Master row semantically',
  )

  const added = editedRows.at(-1)
  assert.equal(added.slug, baseRow.slug)
  assert.equal(added.name, baseRow.name)
  assert.equal(added.entity_type, 'compound')
  assert.equal(added.runtime_export_decision, 'hidden_until_grounded')
  assert.equal(added.profile_status, 'research_only')

  const duplicateOutput = runEditor(
    ['--workbook', outPath, '--append-row-file', rowPath, '--dry-run'],
    { expectFailure: true },
  )
  assert.match(duplicateOutput, /duplicate slug/i)

  const publishablePath = path.join(tempDir, 'publishable.json')
  writeJson(publishablePath, { ...baseRow, slug: 'append-row-publishable-probe', name: 'Append Row Publishable Probe', runtime_export_decision: 'full_public_runtime' })
  const publishableOutput = runEditor(['--append-row-file', publishablePath, '--dry-run'], { expectFailure: true })
  assert.match(publishableOutput, /fail-closed/i)

  const leakedPath = path.join(tempDir, 'leaked.json')
  writeJson(leakedPath, { ...baseRow, slug: 'append-row-leak-probe', name: 'Append Row Leak Probe', summary: 'Decision-ready summary: internal publishing guidance.' })
  const leakedOutput = runEditor(['--append-row-file', leakedPath, '--dry-run'], { expectFailure: true })
  assert.match(leakedOutput, /pipeline language/i)

  execFileSync(process.execPath, [path.join(repoRoot, 'scripts', 'ci', 'validate-workbook-schema.mjs')], {
    cwd: repoRoot,
    stdio: 'pipe',
    env: {
      ...process.env,
      HERB_XLSX_PATH: outPath,
      ALLOW_EXTERNAL_WORKBOOK_PATH: 'true',
    },
  })

  console.log(
    `[validate-workbook-append-row] PASS: appended 1 fail-closed entity, preserved ${originalRows.length} existing Entity_Master rows, and rejected duplicate/publishable/leaked probes.`,
  )
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true })
}
