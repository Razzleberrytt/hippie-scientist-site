#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import XLSX from 'xlsx'
import { resolveWorkbookPath } from '../workbook-source.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')

const SHEETS = {
  herbs: 'Herb Master V3',
  compounds: 'Compound Master V3',
  herbCompoundMap: 'Herb Compound Map V3',
  claimRows: 'Claim Rows',
  researchQueue: 'Research Queue',
}

const OUTPUTS = {
  json: path.join(repoRoot, 'reports', 'data-next-workbook-parser-coverage.json'),
  md: path.join(repoRoot, 'reports', 'data-next-workbook-parser-coverage.md'),
}

const PLACEHOLDER_TOKENS = new Set(['', 'unknown', 'nan', 'null', 'undefined', '[object object]'])

function parseArgs(argv) {
  const args = argv.slice(2)
  let dataDir = path.join('public', 'data-next')

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    if (arg === '--data-dir') {
      dataDir = args[index + 1] || ''
      index += 1
      continue
    }

    if (arg.startsWith('--data-dir=')) {
      dataDir = arg.slice('--data-dir='.length)
    }
  }

  const normalized = String(dataDir || '').trim()
  if (!normalized) {
    throw new Error('[data-coverage-next] Missing value for --data-dir')
  }

  return path.resolve(repoRoot, normalized)
}

function normalizeText(value) {
  if (value === null || value === undefined) return ''
  if (typeof value === 'number' && Number.isNaN(value)) return ''
  const text = String(value).replace(/\s+/g, ' ').trim()
  if (!text) return ''
  if (isPlaceholderToken(text)) return ''
  return text
}

function normalizeSlug(value) {
  const normalized = normalizeText(value)
  if (!normalized) return ''
  return normalized
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function isPlaceholderToken(value) {
  const text = String(value ?? '').trim().toLowerCase()
  return PLACEHOLDER_TOKENS.has(text)
}

function toSimpleRow(row) {
  const output = {}
  for (const [key, value] of Object.entries(row || {})) {
    const normalizedKey = String(key ?? '').trim()
    if (!normalizedKey) continue
    output[normalizedKey] = value
  }
  return output
}

function readSheetRows(workbook, sheetName) {
  const sheet = workbook.Sheets[sheetName]
  if (!sheet) {
    throw new Error(`[data-coverage-next] Missing required sheet: ${sheetName}`)
  }

  const rows = XLSX.utils.sheet_to_json(sheet, {
    defval: '',
    raw: false,
    blankrows: false,
  })

  return rows.map((row, index) => ({
    ...toSimpleRow(row),
    __rowNum: Number.isInteger(row?.__rowNum__) ? row.__rowNum__ + 1 : index + 2,
  }))
}

function firstNonEmpty(row, keys) {
  for (const key of keys) {
    const value = normalizeText(row[key])
    if (value) return value
  }
  return ''
}

function readJsonArray(filePath) {
  const payload = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  if (!Array.isArray(payload)) {
    throw new Error(`[data-coverage-next] Expected JSON array: ${path.relative(repoRoot, filePath)}`)
  }
  return payload
}

function getHerbIdentity(row) {
  const name = firstNonEmpty(row, ['name', 'herbName'])
  const slug = normalizeSlug(firstNonEmpty(row, ['slug', 'herbSlug', 'name']))
  return { name, slug }
}

function getCompoundIdentity(row) {
  const name = firstNonEmpty(row, ['name', 'compoundName', 'canonicalCompoundName', 'compound'])
  const slug = normalizeSlug(firstNonEmpty(row, ['slug', 'canonicalCompoundId', 'compoundName', 'name']))
  return { name, slug }
}

function getHerbInvalidReason(name, slug) {
  const normalizedName = normalizeText(name)
  const normalizedSlug = normalizeSlug(slug)

  if (!normalizedName) return 'blank_or_placeholder_name'
  if (!normalizedSlug) return 'blank_or_invalid_slug'
  if (isPlaceholderToken(normalizedName)) return 'blank_or_placeholder_name'
  if (isPlaceholderToken(normalizedSlug)) return 'blank_or_invalid_slug'
  return ''
}

function getCompoundInvalidReason(name, slug) {
  const baseReason = getHerbInvalidReason(name, slug)
  if (baseReason) return baseReason

  const normalizedName = normalizeText(name)
  const normalizedSlug = normalizeSlug(slug)

  if (/^\d+$/.test(normalizedName)) return 'numeric_only_name'
  if (/^\d+$/.test(normalizedSlug)) return 'numeric_only_slug'
  if (normalizedName.length <= 1) return 'name_too_short'
  if (normalizedSlug.length <= 1) return 'slug_too_short'
  return ''
}

function pushReasonCount(counts, reason) {
  counts[reason] = (counts[reason] || 0) + 1
}

function countBy(items, field) {
  const counts = {}
  for (const item of items) {
    const key = item[field]
    counts[key] = (counts[key] || 0) + 1
  }
  return counts
}

function topCounts(counts, limit = 10) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([reason, count]) => ({ reason, count }))
}

function analyzeEntity({ entityName, sheetName, workbookRows, emittedRecords, identityFromRow, invalidReason }) {
  const emittedBySlug = new Map()
  for (const record of emittedRecords) {
    const slug = normalizeSlug(record?.slug)
    if (!slug || emittedBySlug.has(slug)) continue
    emittedBySlug.set(slug, record)
  }

  const seenValidSlug = new Set()
  const skippedSamples = []
  const skippedByReason = {}
  const blankInvalidRows = []
  const validNameMissingRows = []
  const duplicateSlugRows = []
  const slugCandidates = []

  for (const row of workbookRows) {
    const { name, slug } = identityFromRow(row)
    const rowRef = {
      sheet: sheetName,
      rowNumber: row.__rowNum,
      name,
      slug,
    }

    const identityReason = invalidReason(name, slug)
    if (identityReason) {
      const sample = { ...rowRef, reason: identityReason }
      skippedSamples.push(sample)
      blankInvalidRows.push(sample)
      pushReasonCount(skippedByReason, identityReason)
      continue
    }

    slugCandidates.push({ slug, name, rowNumber: row.__rowNum })

    if (seenValidSlug.has(slug)) {
      const sample = { ...rowRef, reason: 'duplicate_slug_candidate' }
      skippedSamples.push(sample)
      duplicateSlugRows.push(sample)
      pushReasonCount(skippedByReason, 'duplicate_slug_candidate')
      continue
    }

    seenValidSlug.add(slug)

    if (!emittedBySlug.has(slug)) {
      const sample = { ...rowRef, reason: 'missing_emitted_record_for_valid_row' }
      skippedSamples.push(sample)
      validNameMissingRows.push(sample)
      pushReasonCount(skippedByReason, 'missing_emitted_record_for_valid_row')
    }
  }

  const duplicateSlugCandidates = Object.entries(countBy(slugCandidates, 'slug'))
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([slug, count]) => ({
      slug,
      count,
      rowNumbers: slugCandidates
        .filter(item => item.slug === slug)
        .map(item => item.rowNumber)
        .slice(0, 10),
      names: [...new Set(slugCandidates.filter(item => item.slug === slug).map(item => item.name))].slice(0, 5),
    }))

  return {
    entity: entityName,
    sheet: sheetName,
    rawRowCount: workbookRows.length,
    emittedRecordCount: emittedRecords.length,
    skippedRowCount: skippedSamples.length,
    skippedRowsByReason: Object.entries(skippedByReason)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([reason, count]) => ({ reason, count })),
    rowsWithValidNamesButMissingEmittedRecords: validNameMissingRows,
    rowsWithBlankOrInvalidNames: blankInvalidRows,
    duplicateSlugCandidates,
    skippedRowSamples: skippedSamples.slice(0, 75),
    topSkipReasons: topCounts(skippedByReason, 5),
  }
}

function renderEntityMd(analysis) {
  const lines = []
  lines.push(`## ${analysis.entity}`)
  lines.push('')
  lines.push(`- Sheet: ${analysis.sheet}`)
  lines.push(`- Raw row count: ${analysis.rawRowCount}`)
  lines.push(`- Emitted record count: ${analysis.emittedRecordCount}`)
  lines.push(`- Skipped row count: ${analysis.skippedRowCount}`)
  lines.push('')

  lines.push('### Skipped rows by reason')
  if (analysis.skippedRowsByReason.length === 0) {
    lines.push('- None')
  } else {
    for (const item of analysis.skippedRowsByReason) {
      lines.push(`- ${item.reason}: ${item.count}`)
    }
  }
  lines.push('')

  lines.push('### Rows with valid names but missing emitted records')
  if (analysis.rowsWithValidNamesButMissingEmittedRecords.length === 0) {
    lines.push('- None')
  } else {
    for (const row of analysis.rowsWithValidNamesButMissingEmittedRecords.slice(0, 20)) {
      lines.push(`- row ${row.rowNumber} | ${row.name} | ${row.slug} | ${row.reason}`)
    }
  }
  lines.push('')

  lines.push('### Rows with blank/invalid names')
  if (analysis.rowsWithBlankOrInvalidNames.length === 0) {
    lines.push('- None')
  } else {
    for (const row of analysis.rowsWithBlankOrInvalidNames.slice(0, 20)) {
      lines.push(`- row ${row.rowNumber} | ${row.name || '(blank)'} | ${row.slug || '(blank)'} | ${row.reason}`)
    }
  }
  lines.push('')

  lines.push('### Duplicate slug candidates')
  if (analysis.duplicateSlugCandidates.length === 0) {
    lines.push('- None')
  } else {
    for (const item of analysis.duplicateSlugCandidates.slice(0, 20)) {
      lines.push(`- ${item.slug}: ${item.count} rows (rows: ${item.rowNumbers.join(', ')})`)
    }
  }
  lines.push('')

  lines.push('### Skipped row samples')
  if (analysis.skippedRowSamples.length === 0) {
    lines.push('- None')
  } else {
    for (const row of analysis.skippedRowSamples.slice(0, 30)) {
      lines.push(`- ${row.sheet} | row ${row.rowNumber} | ${row.name || '(blank)'} | ${row.slug || '(blank)'} | ${row.reason}`)
    }
  }

  lines.push('')
  return lines.join('\n')
}

function writeReport(report) {
  fs.mkdirSync(path.dirname(OUTPUTS.json), { recursive: true })
  fs.writeFileSync(OUTPUTS.json, `${JSON.stringify(report, null, 2)}\n`, 'utf8')

  const mdLines = []
  mdLines.push('# Data-next workbook parser coverage')
  mdLines.push('')
  mdLines.push(`Generated at: ${report.generatedAt}`)
  mdLines.push(`Workbook: ${report.workbookPath}`)
  mdLines.push('')
  mdLines.push('## Workbook sheets inspected')
  mdLines.push(`- ${SHEETS.herbs}`)
  mdLines.push(`- ${SHEETS.compounds}`)
  mdLines.push(`- ${SHEETS.herbCompoundMap}`)
  mdLines.push('')

  mdLines.push(renderEntityMd(report.herbs))
  mdLines.push(renderEntityMd(report.compounds))

  fs.writeFileSync(OUTPUTS.md, `${mdLines.join('\n')}\n`, 'utf8')
}

function run() {
  const dataDir = parseArgs(process.argv)
  const inputs = {
    herbs: path.join(dataDir, 'herbs.json'),
    compounds: path.join(dataDir, 'compounds.json'),
  }
  const workbookPath = resolveWorkbookPath(repoRoot)
  const workbook = XLSX.readFile(workbookPath)

  const herbRows = readSheetRows(workbook, SHEETS.herbs)
  const compoundRows = readSheetRows(workbook, SHEETS.compounds)
  const herbCompoundMapRows = readSheetRows(workbook, SHEETS.herbCompoundMap)

  const emittedHerbs = readJsonArray(inputs.herbs)
  const emittedCompounds = readJsonArray(inputs.compounds)

  const herbs = analyzeEntity({
    entityName: 'herbs',
    sheetName: SHEETS.herbs,
    workbookRows: herbRows,
    emittedRecords: emittedHerbs,
    identityFromRow: getHerbIdentity,
    invalidReason: getHerbInvalidReason,
  })

  const compounds = analyzeEntity({
    entityName: 'compounds',
    sheetName: SHEETS.compounds,
    workbookRows: compoundRows,
    emittedRecords: emittedCompounds,
    identityFromRow: getCompoundIdentity,
    invalidReason: getCompoundInvalidReason,
  })

  const report = {
    generatedAt: new Date().toISOString(),
    workbookPath,
    sheetsInspected: {
      herbs: SHEETS.herbs,
      compounds: SHEETS.compounds,
      herbCompoundMap: SHEETS.herbCompoundMap,
    },
    herbCompoundMapRawRowCount: herbCompoundMapRows.length,
    herbs,
    compounds,
  }

  writeReport(report)

  console.log(`[data-coverage-next] herbs raw=${herbs.rawRowCount} emitted=${herbs.emittedRecordCount} skipped=${herbs.skippedRowCount}`)
  console.log(
    `[data-coverage-next] compounds raw=${compounds.rawRowCount} emitted=${compounds.emittedRecordCount} skipped=${compounds.skippedRowCount}`,
  )
  console.log(`[data-coverage-next] wrote ${path.relative(repoRoot, OUTPUTS.json)} and ${path.relative(repoRoot, OUTPUTS.md)}`)
}

run()
