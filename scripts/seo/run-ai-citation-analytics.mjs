#!/usr/bin/env node

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

import { AI_VISIBILITY_ANOMALIES, partitionDatedRows } from './ai-visibility-anomaly.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const INPUT_DIR = path.join(ROOT, 'data-sources', 'ai-performance')
const SANITIZED_DIR = path.join(ROOT, 'ops', 'ai-citations', 'sanitized-input')
const REPORT_JSON = path.join(ROOT, 'ops', 'reports', 'ai-visibility-anomaly.json')
const REPORT_MD = path.join(ROOT, 'ops', 'reports', 'ai-visibility-anomaly.md')

function parseCsv(content) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i]
    if (quoted) {
      if (char === '"') {
        if (content[i + 1] === '"') {
          field += '"'
          i += 1
        } else quoted = false
      } else field += char
      continue
    }
    if (char === '"') quoted = true
    else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (char !== '\r') field += char
  }
  if (field.length || row.length) {
    row.push(field)
    rows.push(row)
  }
  if (rows.length && rows[0].length) rows[0][0] = rows[0][0].replace(/^\uFEFF/, '')
  return rows.filter(r => r.some(cell => String(cell).trim() !== ''))
}

function csvEscape(value) {
  const text = String(value ?? '')
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

function serializeCsv(rows) {
  return `${rows.map(row => row.map(csvEscape).join(',')).join('\n')}\n`
}

function dateColumnIndex(header) {
  const normalized = header.map(cell => String(cell).trim().toLowerCase())
  return normalized.findIndex(cell => ['date', 'day'].includes(cell))
}

function sanitizeInputs() {
  rmSync(SANITIZED_DIR, { recursive: true, force: true })
  mkdirSync(SANITIZED_DIR, { recursive: true })

  const files = existsSync(INPUT_DIR) ? readdirSync(INPUT_DIR).filter(file => /\.csv$/i.test(file)).sort() : []
  const summary = []

  for (const file of files) {
    const parsed = parseCsv(readFileSync(path.join(INPUT_DIR, file), 'utf8'))
    if (!parsed.length) continue
    const [header, ...dataRows] = parsed
    const dateIndex = dateColumnIndex(header)

    if (dateIndex < 0) {
      writeFileSync(path.join(SANITIZED_DIR, file), serializeCsv(parsed))
      summary.push({ file, inputRows: dataRows.length, keptRows: dataRows.length, excludedRows: 0, undatedRows: dataRows.length, dateColumn: false })
      continue
    }

    const { clean, excluded, undated } = partitionDatedRows(dataRows, row => row[dateIndex])
    writeFileSync(path.join(SANITIZED_DIR, file), serializeCsv([header, ...clean]))
    summary.push({
      file,
      inputRows: dataRows.length,
      keptRows: clean.length,
      excludedRows: excluded.length,
      undatedRows: undated.length,
      dateColumn: true,
    })
  }

  return summary
}

function writeAnomalyReport(files) {
  const totals = files.reduce((acc, file) => {
    acc.inputRows += file.inputRows
    acc.keptRows += file.keptRows
    acc.excludedRows += file.excludedRows
    acc.undatedRows += file.undatedRows
    return acc
  }, { inputRows: 0, keptRows: 0, excludedRows: 0, undatedRows: 0 })

  const report = {
    generatedAt: new Date().toISOString(),
    policy: AI_VISIBILITY_ANOMALIES,
    sourceDir: path.relative(ROOT, INPUT_DIR),
    sanitizedDir: path.relative(ROOT, SANITIZED_DIR),
    totals,
    files,
    caveat: totals.undatedRows > 0
      ? 'Undated aggregate rows cannot be surgically corrected and remain in the sanitized input. Do not use them for day-level Aug 13-17 comparisons.'
      : null,
  }

  mkdirSync(path.dirname(REPORT_JSON), { recursive: true })
  writeFileSync(REPORT_JSON, `${JSON.stringify(report, null, 2)}\n`)
  writeFileSync(REPORT_MD, [
    '# AI visibility anomaly handling',
    '',
    `Generated ${report.generatedAt}.`,
    '',
    'Known corrupted reporting window: **2026-08-13 through 2026-08-17**.',
    'Dated rows in that window are excluded before AI citation trend analytics run.',
    '',
    `- Input rows: ${totals.inputRows}`,
    `- Excluded dated rows: ${totals.excludedRows}`,
    `- Kept rows: ${totals.keptRows}`,
    `- Undated rows that cannot be surgically corrected: ${totals.undatedRows}`,
    report.caveat ? `- Caveat: ${report.caveat}` : '- Caveat: none',
    '',
    '| File | Input | Excluded | Undated |',
    '| --- | ---: | ---: | ---: |',
    ...files.map(file => `| ${file.file} | ${file.inputRows} | ${file.excludedRows} | ${file.undatedRows} |`),
    '',
  ].join('\n'))

  return report
}

function main() {
  const files = sanitizeInputs()
  const report = writeAnomalyReport(files)

  if (!files.length) {
    console.log(`[ai-analytics] no CSV exports found in ${path.relative(ROOT, INPUT_DIR)}/`)
    return
  }

  console.log(`[ai-analytics] excluded ${report.totals.excludedRows} dated rows from the known Aug 13-17 reporting anomaly`)
  if (report.totals.undatedRows) {
    console.warn(`[ai-analytics] ${report.totals.undatedRows} undated rows retained; do not interpret those as day-level evidence for Aug 13-17`)
  }

  const tracker = spawnSync(
    process.execPath,
    [path.join(ROOT, 'scripts', 'seo', 'ai-citation-tracker.mjs'), `--dir=${path.relative(ROOT, SANITIZED_DIR)}`],
    { cwd: ROOT, stdio: 'inherit' },
  )
  if (tracker.error) throw tracker.error
  if (tracker.status !== 0) process.exitCode = tracker.status || 1
}

main()
