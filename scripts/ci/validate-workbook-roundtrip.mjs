#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { readWorkbookExcelJS } from '../utils/read-workbook-exceljs.mjs'
import { resolveWorkbookPath, assertWorkbookExists } from '../workbook-source.mjs'

/**
 * No-op workbook round-trip data-preservation check.
 *
 * Exercises the real write path (`scripts/data/edit-entity-master-cell.mjs
 * --roundtrip`) — repacking the workbook without changing any value — then reads
 * both the original and the repacked copy and asserts every sheet's parsed data
 * is identical. This is the automated guarantee that the write path never
 * silently corrupts the source of truth: if it passes, `data:build` output is
 * byte-stable across an edit-tool round-trip.
 *
 * Runs in a temp copy under data-sources/ (internal path) and cleans up. Exit 1
 * on any drift.
 */

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..')
const editor = path.join(repoRoot, 'scripts/data/edit-entity-master-cell.mjs')

const workbookPath = resolveWorkbookPath(repoRoot)
assertWorkbookExists(workbookPath)

const tmp = path.join(repoRoot, 'data-sources', `.roundtrip-check-${process.pid}.xlsx`)

function readSheets(file) {
  return readWorkbookExcelJS(file).then((wb) =>
    Object.fromEntries(wb.getSheetNames().map((n) => [n, wb.getSheetData(n)])),
  )
}

try {
  execFileSync(process.execPath, [editor, '--roundtrip', '--out', tmp], { stdio: 'pipe' })
  if (!fs.existsSync(tmp)) {
    console.error('[validate-workbook-roundtrip] FAILED: round-trip produced no output file.')
    process.exit(1)
  }

  const before = await readSheets(workbookPath)
  const after = await readSheets(tmp)

  const sheetNames = [...new Set([...Object.keys(before), ...Object.keys(after)])]
  const drift = []
  for (const name of sheetNames) {
    if (JSON.stringify(before[name]) !== JSON.stringify(after[name])) drift.push(name)
  }

  if (drift.length) {
    console.error(`[validate-workbook-roundtrip] FAILED: parsed data changed after a no-op write in sheet(s): ${drift.join(', ')}`)
    process.exit(1)
  }
  console.log(`[validate-workbook-roundtrip] PASS: no-op round-trip preserved all ${sheetNames.length} sheets byte-for-byte.`)
} catch (err) {
  console.error(`[validate-workbook-roundtrip] ERROR: ${err.message}`)
  process.exit(1)
} finally {
  fs.rmSync(tmp, { force: true })
}
