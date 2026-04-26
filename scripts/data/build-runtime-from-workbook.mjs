#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import XLSX from 'xlsx'
import { resolveWorkbookPath } from '../workbook-source.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')

const REQUIRED_SHEETS = {
  herbs: 'Herb Master V3',
  compounds: 'Compound Master V3',
  herbCompoundMap: 'Herb Compound Map V3',
  claimRows: 'Claim Rows',
  researchQueue: 'Research Queue',
}

const PLACEHOLDER_TOKENS = new Set(['', 'unknown', 'nan', 'null', 'undefined', '[object object]'])
const DEFAULT_SUMMARY = 'Profile pending review'

function parseArgs(argv) {
  const defaultOut = path.join('public', 'data-next')
  const args = argv.slice(2)
  let relativeOut = defaultOut

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    if (arg === '--out') {
      relativeOut = args[index + 1] || ''
      index += 1
      continue
    }

    if (arg.startsWith('--out=')) {
      relativeOut = arg.slice('--out='.length)
    }
  }

  const normalizedOut = String(relativeOut || '').trim()
  if (!normalizedOut) {
    throw new Error('[data-next] Missing value for --out')
  }

  return {
    outputDir: path.resolve(repoRoot, normalizedOut),
    outputLabel: normalizedOut,
  }
}

function normalizeText(value) {
  if (value === null || value === undefined) return ''
  if (typeof value === 'number' && Number.isNaN(value)) return ''
  const text = String(value).replace(/\s+/g, ' ').trim()
  if (!text) return ''
  if (isPlaceholderToken(text)) return ''
  return text
}

function normalizeOptionalString(value) {
  return normalizeText(value)
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return [...new Set(value.map(item => normalizeText(item)).filter(Boolean))]
  }
  const text = normalizeText(value)
  if (!text) return []
  return [...new Set(text.split(/[;|,\n]/).map(item => normalizeText(item)).filter(Boolean))]
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

function readSheetRows(workbook, sheetName, { optional = false } = {}) {
  const sheet = workbook.Sheets[sheetName]
  if (!sheet) {
    if (optional) return []
    throw new Error(`[data-next] Missing required sheet: ${sheetName}`)
  }

  const rows = XLSX.utils.sheet_to_json(sheet, {
    defval: '',
    raw: false,
    blankrows: false,
  })

  const normalizedRows = rows.map(row => toSimpleRow(row))
  if (!optional && normalizedRows.length === 0) {
    throw new Error(`[data-next] Required sheet has 0 rows: ${sheetName}`)
  }
  return normalizedRows
}

function firstNonEmpty(row, keys) {
  for (const key of keys) {
    const value = normalizeText(row[key])
    if (value) return value
  }
  return ''
}

function parseSourceCount(row) {
  const raw = firstNonEmpty(row, ['sourceCount', 'source_count', 'sourcesCount'])
  if (!raw) return 0
  const parsed = Number.parseInt(raw, 10)
  return Number.isFinite(parsed) ? parsed : 0
}

function isValidIdentity(name, slug) {
  const normalizedName = normalizeText(name)
  const normalizedSlug = normalizeSlug(slug)
  if (!normalizedName || !normalizedSlug) return false
  if (isPlaceholderToken(normalizedName) || isPlaceholderToken(normalizedSlug)) return false
  if (normalizedName.length <= 1 || normalizedSlug.length <= 1) return false
  return true
}

function isValidCompoundIdentity(name, slug) {
  if (!isValidIdentity(name, slug)) return false
  const normalizedName = normalizeText(name)
  const normalizedSlug = normalizeSlug(slug)
  if (/^\d+$/.test(normalizedName) || /^\d+$/.test(normalizedSlug)) return false
  return true
}

function withSummaryFallback(summary) {
  return normalizeOptionalString(summary) || DEFAULT_SUMMARY
}

function createHerbRecord(row) {
  const name = firstNonEmpty(row, ['name', 'herbName'])
  const slug = normalizeSlug(firstNonEmpty(row, ['slug', 'herbSlug', 'name']))
  return {
    name,
    slug,
    summary: withSummaryFallback(firstNonEmpty(row, ['summary', 'hero'])),
    description: normalizeOptionalString(firstNonEmpty(row, ['description'])),
    mechanisms: normalizeList(firstNonEmpty(row, ['mechanisms', 'mechanism', 'pathwayTargets'])),
    safetyNotes: normalizeOptionalString(firstNonEmpty(row, ['safetyNotes', 'safety'])),
    contraindications: normalizeList(firstNonEmpty(row, ['contraindications'])),
    interactions: normalizeList(firstNonEmpty(row, ['interactions'])),
    dosage: normalizeOptionalString(firstNonEmpty(row, ['dosage', 'dose'])),
    preparation: normalizeOptionalString(firstNonEmpty(row, ['preparation'])),
    evidenceLevel: normalizeOptionalString(firstNonEmpty(row, ['evidenceLevel', 'evidenceTier', 'evidence_tier'])),
    review_status: normalizeOptionalString(firstNonEmpty(row, ['review_status', 'reviewStatus'])),
    source_status: normalizeOptionalString(firstNonEmpty(row, ['source_status', 'sourceStatus'])),
    sourceCount: parseSourceCount(row),
    confidenceTier: normalizeOptionalString(firstNonEmpty(row, ['confidenceTier', 'confidenceLevel'])),
  }
}

function createCompoundRecord(row, foundIn) {
  const name = firstNonEmpty(row, ['name', 'compoundName', 'canonicalCompoundName', 'compound'])
  const slug = normalizeSlug(firstNonEmpty(row, ['slug', 'canonicalCompoundId', 'compoundName', 'name']))
  return {
    name,
    slug,
    summary: withSummaryFallback(firstNonEmpty(row, ['summary'])),
    description: normalizeOptionalString(firstNonEmpty(row, ['description'])),
    compoundClass: normalizeOptionalString(firstNonEmpty(row, ['compoundClass', 'class'])),
    mechanisms: normalizeList(firstNonEmpty(row, ['mechanisms', 'mechanism', 'mechanismTags'])),
    targets: normalizeList(firstNonEmpty(row, ['targets', 'pathwayTargets'])),
    foundIn: Array.isArray(foundIn) ? foundIn : [],
    safetyNotes: normalizeOptionalString(firstNonEmpty(row, ['safetyNotes', 'safety'])),
    evidenceLevel: normalizeOptionalString(firstNonEmpty(row, ['evidenceLevel', 'evidenceTier', 'evidence_tier'])),
    review_status: normalizeOptionalString(firstNonEmpty(row, ['review_status', 'reviewStatus'])),
    source_status: normalizeOptionalString(firstNonEmpty(row, ['source_status', 'sourceStatus'])),
    sourceCount: parseSourceCount(row),
    confidenceTier: normalizeOptionalString(firstNonEmpty(row, ['confidenceTier', 'confidenceLevel'])),
  }
}

function toSummaryRecord(record) {
  return {
    name: record.name,
    slug: record.slug,
    summary: withSummaryFallback(record.summary),
    evidenceLevel: normalizeOptionalString(record.evidenceLevel),
    review_status: normalizeOptionalString(record.review_status),
    source_status: normalizeOptionalString(record.source_status),
    sourceCount: Number.isFinite(Number(record.sourceCount)) ? Number(record.sourceCount) : 0,
    confidenceTier: normalizeOptionalString(record.confidenceTier),
  }
}

function writeJson(filePath, payload) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
}

function run() {
  const { outputDir, outputLabel } = parseArgs(process.argv)
  const metaDir = path.join(outputDir, '_meta')
  const workbookPath = resolveWorkbookPath(repoRoot)
  const workbook = XLSX.readFile(workbookPath)

  const herbRows = readSheetRows(workbook, REQUIRED_SHEETS.herbs)
  const compoundRows = readSheetRows(workbook, REQUIRED_SHEETS.compounds)
  const mapRows = readSheetRows(workbook, REQUIRED_SHEETS.herbCompoundMap)
  const claimRows = readSheetRows(workbook, REQUIRED_SHEETS.claimRows)
  const researchQueueRows = readSheetRows(workbook, REQUIRED_SHEETS.researchQueue)

  const herbNameBySlug = new Map()
  const herbs = []
  let skippedHerbs = 0

  for (const row of herbRows) {
    const record = createHerbRecord(row)
    if (!isValidIdentity(record.name, record.slug)) {
      skippedHerbs += 1
      continue
    }
    if (herbNameBySlug.has(record.slug)) continue
    herbNameBySlug.set(record.slug, record.name)
    herbs.push(record)
  }

  const foundInByCompoundSlug = new Map()
  for (const row of mapRows) {
    const herbSlug = normalizeSlug(firstNonEmpty(row, ['herbSlug', 'herb']))
    const compoundSlug = normalizeSlug(
      firstNonEmpty(row, ['slug', 'canonicalCompoundId', 'canonicalCompoundName', 'compoundName']),
    )
    if (!herbSlug || !compoundSlug) continue
    const herbName = herbNameBySlug.get(herbSlug) || herbSlug
    const existing = foundInByCompoundSlug.get(compoundSlug) || []
    if (!existing.includes(herbName)) {
      existing.push(herbName)
      foundInByCompoundSlug.set(compoundSlug, existing)
    }
  }

  const compounds = []
  const compoundSlugSet = new Set()
  let skippedCompounds = 0

  for (const row of compoundRows) {
    const draft = createCompoundRecord(row, [])
    if (!isValidCompoundIdentity(draft.name, draft.slug)) {
      skippedCompounds += 1
      continue
    }
    if (compoundSlugSet.has(draft.slug)) continue
    compoundSlugSet.add(draft.slug)
    draft.foundIn = (foundInByCompoundSlug.get(draft.slug) || []).sort((a, b) => a.localeCompare(b))
    compounds.push(draft)
  }

  herbs.sort((a, b) => a.slug.localeCompare(b.slug))
  compounds.sort((a, b) => a.slug.localeCompare(b.slug))

  const herbsSummary = herbs.map(toSummaryRecord)
  const compoundsSummary = compounds.map(toSummaryRecord)

  writeJson(path.join(outputDir, 'herbs.json'), herbs)
  writeJson(path.join(outputDir, 'compounds.json'), compounds)
  writeJson(path.join(outputDir, 'herbs-summary.json'), herbsSummary)
  writeJson(path.join(outputDir, 'compounds-summary.json'), compoundsSummary)

  for (const herb of herbs) {
    writeJson(path.join(outputDir, 'herbs-detail', `${herb.slug}.json`), herb)
  }

  for (const compound of compounds) {
    writeJson(path.join(outputDir, 'compounds-detail', `${compound.slug}.json`), compound)
  }

  const buildInfo = {
    generatedAt: new Date().toISOString(),
    source: {
      workbookPath,
      sheets: {
        herbs: REQUIRED_SHEETS.herbs,
        compounds: REQUIRED_SHEETS.compounds,
        herbCompoundMap: REQUIRED_SHEETS.herbCompoundMap,
        claimRows: REQUIRED_SHEETS.claimRows,
        researchQueue: REQUIRED_SHEETS.researchQueue,
      },
    },
    output: outputLabel,
    counts: {
      herbs: herbs.length,
      compounds: compounds.length,
      herbsSummary: herbsSummary.length,
      compoundsSummary: compoundsSummary.length,
      herbDetails: herbs.length,
      compoundDetails: compounds.length,
      claimRows: claimRows.length,
      researchQueueRows: researchQueueRows.length,
      skippedHerbs,
      skippedCompounds,
    },
  }

  writeJson(path.join(metaDir, 'build-info.json'), buildInfo)

  console.log(`[data-next] out=${outputLabel}`)
  console.log(`[data-next] wrote herbs=${herbs.length} compounds=${compounds.length}`)
  console.log(`[data-next] detail files herbs=${herbs.length} compounds=${compounds.length}`)
  console.log(`[data-next] skipped herbs=${skippedHerbs} compounds=${skippedCompounds}`)
  console.log(`[data-next] claim rows loaded=${claimRows.length}`)
}

run()
