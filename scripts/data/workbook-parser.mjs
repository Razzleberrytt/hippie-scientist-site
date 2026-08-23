import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readWorkbookExcelJS } from '../utils/read-workbook-exceljs.mjs'

// Workbook parser adapter boundary.
//
// ExcelJS is used only for trusted local Node build/data scripts. Do not use
// this parser for browser input, user uploads, request bodies, or remote URLs.
// Any future runtime spreadsheet parsing must go through a reviewed safer
// boundary.
//
// IMPORTANT:
// Preserve current workbook semantics exactly unless a dedicated
// migration/parity pass explicitly changes them.
//
// Current invariants:
// - blank cells become ''
// - row object keys match legacy sheet_to_json behavior
// - workbook shape exposes Sheets + SheetNames
// - downstream exporters depend on deterministic row object structure

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '../..')
const enrichmentDir = path.join(repoRoot, 'data-sources', 'runtime-enrichment')

const ENTITY_SHEETS = ['Entity_Master', 'Sheet7']
const CLAIM_SHEETS = ['Study Registry', 'Evidence_Register', 'Sheet8']
const RELATIONSHIP_SHEETS = ['Herb Compound Map V3', 'Entity_Relationships', 'Sheet11']

function clean(value) {
  if (value === null || value === undefined) return ''
  return String(value).replace(/\s+/g, ' ').trim()
}

function slug(value) {
  return clean(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function first(row, keys) {
  for (const key of keys) {
    const value = row?.[key]
    if (clean(value)) return value
  }
  return ''
}

function findLoadedSheet(sheets, candidates) {
  return candidates.find((name) => Array.isArray(sheets[name])) || null
}

function readJsonlFiles(pattern) {
  if (!fs.existsSync(enrichmentDir)) return []
  const files = fs.readdirSync(enrichmentDir)
    .filter((name) => pattern.test(name))
    .sort((a, b) => a.localeCompare(b))

  const rows = []
  for (const name of files) {
    const filePath = path.join(enrichmentDir, name)
    const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/)
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index].trim()
      if (!line) continue
      try {
        rows.push(JSON.parse(line))
      } catch (error) {
        throw new Error(`[workbook-parser] invalid JSONL in ${name}:${index + 1}: ${error.message}`)
      }
    }
  }
  return rows
}

function evidenceKey(row) {
  const entity = slug(first(row, ['entity_slug', 'profile_slug', 'slug', 'herb_slug', 'compound_slug']))
  const pmid = clean(first(row, ['pmid', 'PMID'])).toLowerCase()
  const doi = clean(first(row, ['doi', 'DOI'])).toLowerCase().replace(/^https?:\/\/(?:dx\.)?doi\.org\//, '')
  const title = clean(first(row, ['title', 'study title', 'claim', 'summary', 'supported_claim_language'])).toLowerCase()
  const source = pmid ? `pmid:${pmid}` : doi ? `doi:${doi}` : title ? `title:${title}` : ''
  return entity && source ? `${entity}|${source}` : ''
}

function relationshipKey(row) {
  const source = slug(first(row, ['source_slug', 'herb_slug', 'herb slug', 'herb', 'herb_name']))
  const target = slug(first(row, ['target_slug', 'compound_slug', 'compound slug', 'compound', 'compound_name']))
  return source && target ? `${source}|${target}` : ''
}

function applyRuntimeEnrichment(sheets) {
  const entitySheet = findLoadedSheet(sheets, ENTITY_SHEETS)
  if (!entitySheet) return { evidenceAdded: 0, relationshipsAdded: 0 }

  const entityTypes = new Map()
  for (const row of sheets[entitySheet]) {
    const entitySlug = slug(first(row, ['slug', 'entity_slug', 'name']))
    const entityType = clean(first(row, ['entity_type', 'type'])).toLowerCase()
    if (entitySlug) entityTypes.set(entitySlug, entityType)
  }

  let evidenceAdded = 0
  const claimSheet = findLoadedSheet(sheets, CLAIM_SHEETS)
  if (claimSheet) {
    const existingKeys = new Set(sheets[claimSheet].map(evidenceKey).filter(Boolean))
    const additions = []
    for (const row of readJsonlFiles(/^\d{4}-\d{2}-\d{2}-evidence-\d+\.jsonl$/)) {
      const entitySlug = slug(row.entity_slug)
      const key = evidenceKey(row)
      if (!entitySlug || !entityTypes.has(entitySlug) || !key || existingKeys.has(key)) continue
      existingKeys.add(key)
      additions.push(row)
    }
    if (additions.length) sheets[claimSheet] = [...sheets[claimSheet], ...additions]
    evidenceAdded = additions.length
  }

  let relationshipsAdded = 0
  const relationshipSheet = findLoadedSheet(sheets, RELATIONSHIP_SHEETS)
  if (relationshipSheet) {
    const existingKeys = new Set(sheets[relationshipSheet].map(relationshipKey).filter(Boolean))
    const additions = []
    for (const row of readJsonlFiles(/^\d{4}-\d{2}-\d{2}-relationships\.jsonl$/)) {
      const sourceSlug = slug(row.source_slug)
      const targetSlug = slug(row.target_slug)
      const key = relationshipKey(row)
      if (!key || existingKeys.has(key)) continue
      if (entityTypes.get(sourceSlug) !== 'herb' || entityTypes.get(targetSlug) !== 'compound') continue
      existingKeys.add(key)
      additions.push(row)
    }
    if (additions.length) sheets[relationshipSheet] = [...sheets[relationshipSheet], ...additions]
    relationshipsAdded = additions.length
  }

  return { evidenceAdded, relationshipsAdded }
}

export async function readWorkbook(filePath, options = {}) {
  const excelWorkbook = await readWorkbookExcelJS(filePath)
  const sheetNames = excelWorkbook.getSheetNames()
  const requestedSheets = Array.isArray(options.sheets) && options.sheets.length
    ? new Set(options.sheets)
    : null
  const sheetsToRead = requestedSheets
    ? sheetNames.filter((sheetName) => requestedSheets.has(sheetName))
    : sheetNames
  const sheets = Object.fromEntries(
    sheetsToRead.map((sheetName) => [sheetName, excelWorkbook.getSheetData(sheetName)]),
  )

  const enrichment = applyRuntimeEnrichment(sheets)
  if (enrichment.evidenceAdded || enrichment.relationshipsAdded) {
    console.log(`[workbook-parser] runtime enrichment: +${enrichment.evidenceAdded} evidence rows, +${enrichment.relationshipsAdded} relationships`)
  }

  return {
    SheetNames: sheetNames,
    Sheets: sheets,
  }
}

export function getSheetNames(workbook) {
  return workbook?.SheetNames || []
}

export function getSheet(workbook, sheetName) {
  return workbook?.Sheets?.[sheetName] || null
}

export function sheetToRows(sheet) {
  return Array.isArray(sheet) ? sheet : []
}
