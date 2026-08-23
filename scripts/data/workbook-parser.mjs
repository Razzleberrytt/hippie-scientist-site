import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { gunzipSync } from 'node:zlib'
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
//
// Additive research enrichment lives in:
// data-sources/runtime-enrichment/2026-08-23-enrichment.json.gz
// It may add evidence, source provenance, safe descriptive context, and links
// between entities that already exist in Entity_Master. It cannot create
// entities or replace canonical identity/governance/publishing fields.

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '../..')
const enrichmentFile = path.join(
  repoRoot,
  'data-sources',
  'runtime-enrichment',
  '2026-08-23-enrichment.json.gz',
)

const ENTITY_SHEETS = ['Entity_Master', 'Sheet7']
const CLAIM_SHEETS = ['Study Registry', 'Evidence_Register', 'Sheet8']
const SOURCE_SHEETS = ['Source_Register', 'Source Register']
const RELATIONSHIP_SHEETS = ['Herb Compound Map V3', 'Entity_Relationships', 'Sheet11']

const ENTITY_CONTEXT_FIELDS = new Set([
  'region',
  'preparation',
  'taxon_scope',
  'safety_distinction',
  'preparation_distinction',
  'plant_part_context',
  'entity_normalization',
  'identity_note',
  'found_in',
  'formation_context',
  'safety_context',
  'source_scope',
  'mechanism_context',
  'interaction_context',
  'scientific_name_note',
  'compound_class_note',
  'enrichment_review_note',
  'enrichment_source_urls',
])

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

let enrichmentCache = null

function readEnrichmentLedger() {
  if (enrichmentCache) return enrichmentCache
  if (!fs.existsSync(enrichmentFile)) {
    enrichmentCache = { entities: [], evidence: [], sources: [], relationships: [] }
    return enrichmentCache
  }

  const raw = gunzipSync(fs.readFileSync(enrichmentFile)).toString('utf8')
  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch (error) {
    throw new Error(`[workbook-parser] invalid enrichment ledger: ${error.message}`)
  }

  for (const key of ['entities', 'evidence', 'sources', 'relationships']) {
    if (!Array.isArray(parsed?.[key])) {
      throw new Error(`[workbook-parser] enrichment ledger missing array: ${key}`)
    }
  }

  enrichmentCache = parsed
  return enrichmentCache
}

function evidenceKey(row) {
  const entity = slug(first(row, ['entity_slug', 'profile_slug', 'slug', 'herb_slug', 'compound_slug']))
  const pmid = clean(first(row, ['pmid', 'PMID'])).toLowerCase()
  const doi = clean(first(row, ['doi', 'DOI']))
    .toLowerCase()
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//, '')
  const title = clean(first(row, ['title', 'study title', 'claim', 'summary', 'supported_claim_language']))
    .toLowerCase()
  const source = pmid ? `pmid:${pmid}` : doi ? `doi:${doi}` : title ? `title:${title}` : ''
  return entity && source ? `${entity}|${source}` : ''
}

function sourceKey(row) {
  const pmid = clean(first(row, ['pmid', 'PMID'])).toLowerCase()
  const doi = clean(first(row, ['doi', 'DOI']))
    .toLowerCase()
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//, '')
  const title = clean(first(row, ['title'])).toLowerCase()
  return pmid ? `pmid:${pmid}` : doi ? `doi:${doi}` : title ? `title:${title}` : ''
}

function relationshipKey(row) {
  const source = slug(first(row, ['source_slug', 'herb_slug', 'herb slug', 'herb', 'herb_name']))
  const target = slug(first(row, ['target_slug', 'compound_slug', 'compound slug', 'compound', 'compound_name']))
  return source && target ? `${source}|${target}` : ''
}

function applyEntityContext(entitySheet, entityRowsBySlug, rows) {
  let fieldsAdded = 0
  let entitiesTouched = 0

  for (const overlay of rows) {
    const entitySlug = slug(overlay.slug)
    const target = entityRowsBySlug.get(entitySlug)
    if (!entitySlug || !target) {
      throw new Error(
        `[workbook-parser] enrichment entity does not exist in ${entitySheet}: ${clean(overlay.slug) || '(blank)'}`,
      )
    }

    let touched = false
    for (const [field, value] of Object.entries(overlay)) {
      if (!ENTITY_CONTEXT_FIELDS.has(field) || !clean(value)) continue
      const current = clean(target[field])
      const incoming = clean(value)
      if (current && current !== incoming) {
        throw new Error(`[workbook-parser] enrichment would overwrite canonical ${entitySlug}.${field}`)
      }
      if (!current) {
        target[field] = value
        fieldsAdded += 1
        touched = true
      }
    }
    if (touched) entitiesTouched += 1
  }

  return { entitiesTouched, fieldsAdded }
}

function applyRuntimeEnrichment(sheets) {
  const entitySheet = findLoadedSheet(sheets, ENTITY_SHEETS)
  if (!entitySheet) {
    return {
      entitiesTouched: 0,
      entityFieldsAdded: 0,
      evidenceAdded: 0,
      sourcesAdded: 0,
      relationshipsAdded: 0,
    }
  }

  const ledger = readEnrichmentLedger()
  const entityTypes = new Map()
  const entityRowsBySlug = new Map()
  for (const row of sheets[entitySheet]) {
    const entitySlug = slug(first(row, ['slug', 'entity_slug', 'name']))
    const entityType = clean(first(row, ['entity_type', 'type'])).toLowerCase()
    if (entitySlug) {
      entityTypes.set(entitySlug, entityType)
      entityRowsBySlug.set(entitySlug, row)
    }
  }

  const entityContext = applyEntityContext(entitySheet, entityRowsBySlug, ledger.entities)

  let evidenceAdded = 0
  const claimSheet = findLoadedSheet(sheets, CLAIM_SHEETS)
  if (claimSheet) {
    const existingKeys = new Set(sheets[claimSheet].map(evidenceKey).filter(Boolean))
    const additions = []
    for (const row of ledger.evidence) {
      const entitySlug = slug(row.entity_slug || row.profile_slug)
      const key = evidenceKey(row)
      if (!entitySlug || !entityTypes.has(entitySlug)) {
        throw new Error(
          `[workbook-parser] enrichment evidence references unknown entity: ${clean(row.entity_slug || row.profile_slug)}`,
        )
      }
      if (!key || existingKeys.has(key)) continue
      existingKeys.add(key)
      additions.push(row)
    }
    if (additions.length) sheets[claimSheet] = [...sheets[claimSheet], ...additions]
    evidenceAdded = additions.length
  }

  let sourcesAdded = 0
  const sourceSheet = findLoadedSheet(sheets, SOURCE_SHEETS)
  if (sourceSheet) {
    const existingKeys = new Set(sheets[sourceSheet].map(sourceKey).filter(Boolean))
    const additions = []
    for (const row of ledger.sources) {
      const key = sourceKey(row)
      if (!key || existingKeys.has(key)) continue
      const entitySlugs = clean(row.entity_slugs).split(/[|;,]/).map(slug).filter(Boolean)
      const unknown = entitySlugs.filter((entitySlug) => !entityTypes.has(entitySlug))
      if (unknown.length) {
        throw new Error(
          `[workbook-parser] enrichment source references unknown entity: ${unknown.join(', ')}`,
        )
      }
      existingKeys.add(key)
      additions.push(row)
    }
    if (additions.length) sheets[sourceSheet] = [...sheets[sourceSheet], ...additions]
    sourcesAdded = additions.length
  }

  let relationshipsAdded = 0
  const relationshipSheet = findLoadedSheet(sheets, RELATIONSHIP_SHEETS)
  if (relationshipSheet) {
    const existingKeys = new Set(sheets[relationshipSheet].map(relationshipKey).filter(Boolean))
    const additions = []
    for (const row of ledger.relationships) {
      const sourceSlug = slug(row.source_slug)
      const targetSlug = slug(row.target_slug)
      const key = relationshipKey(row)
      if (!key || existingKeys.has(key)) continue

      // Missing target entities are intentionally preserved in the source ledger
      // as research candidates, but they cannot become live runtime links.
      if (entityTypes.get(sourceSlug) !== 'herb' || entityTypes.get(targetSlug) !== 'compound') {
        continue
      }

      existingKeys.add(key)
      additions.push(row)
    }
    if (additions.length) sheets[relationshipSheet] = [...sheets[relationshipSheet], ...additions]
    relationshipsAdded = additions.length
  }

  return {
    entitiesTouched: entityContext.entitiesTouched,
    entityFieldsAdded: entityContext.fieldsAdded,
    evidenceAdded,
    sourcesAdded,
    relationshipsAdded,
  }
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
  if (Object.values(enrichment).some(Boolean)) {
    console.log(
      `[workbook-parser] additive enrichment: ${enrichment.entitiesTouched} entities / ${enrichment.entityFieldsAdded} context fields, ` +
      `+${enrichment.evidenceAdded} evidence, +${enrichment.sourcesAdded} sources, +${enrichment.relationshipsAdded} relationships`,
    )
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
