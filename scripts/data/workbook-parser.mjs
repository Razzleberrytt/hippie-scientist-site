import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
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
// Additive research enrichment lives in dated, manifest-backed ledgers under:
// data-sources/runtime-enrichment/
// Each manifest declares its ledger file, byte length, and SHA-256 digest.
// Ledgers may add evidence, source provenance, safe descriptive context, and
// links between entities that already exist in Entity_Master. They cannot create
// entities or replace canonical identity/governance/publishing fields.

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '../..')
const enrichmentDir = path.join(repoRoot, 'data-sources', 'runtime-enrichment')
const ENRICHMENT_ARRAY_KEYS = ['entities', 'evidence', 'sources', 'relationships']

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

/**
 * Verify each additive ledger against the digest declared by its own manifest.
 * Historical ledgers remain immutable; new batches land as new files so review,
 * rollback, and provenance stay batch-scoped.
 */
function listEnrichmentManifestFiles() {
  if (!fs.existsSync(enrichmentDir)) return []
  return fs.readdirSync(enrichmentDir)
    .filter((name) => name.endsWith('-manifest.json'))
    .sort()
    .map((name) => path.join(enrichmentDir, name))
}

function readEnrichmentManifest(manifestPath) {
  let manifest
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  } catch (error) {
    throw new Error(
      '[workbook-parser] enrichment manifest is not valid JSON: ' +
        manifestPath + ': ' + error.message,
    )
  }

  const ledgerName = clean(manifest?.ledger?.file)
  if (!ledgerName || path.basename(ledgerName) !== ledgerName) {
    throw new Error(
      '[workbook-parser] enrichment manifest must declare a local ledger.file basename: ' +
        manifestPath,
    )
  }

  return { manifest, ledgerPath: path.join(enrichmentDir, ledgerName) }
}

function verifyLedgerIntegrity(payload, manifest, manifestPath, ledgerPath) {
  const expectedSha = String(manifest?.ledger?.sha256 || '').toLowerCase()
  const expectedBytes = Number(manifest?.ledger?.bytes)
  if (!/^[0-9a-f]{64}$/.test(expectedSha) || !Number.isInteger(expectedBytes) || expectedBytes <= 0) {
    throw new Error(
      '[workbook-parser] enrichment manifest does not declare a usable ledger.sha256 and ledger.bytes: ' +
        manifestPath,
    )
  }

  const actualBytes = payload.length
  const actualSha = createHash('sha256').update(payload).digest('hex')
  if (actualBytes !== expectedBytes || actualSha !== expectedSha) {
    throw new Error(
      '[workbook-parser] enrichment ledger does not match its manifest: ' +
        path.basename(ledgerPath) +
        '. expected ' + expectedBytes + ' bytes sha256 ' + expectedSha +
        ', got ' + actualBytes + ' bytes sha256 ' + actualSha +
        '. Re-upload the reviewed ledger rather than regenerating its manifest.',
    )
  }
}

function parseEnrichmentLedger(payload, ledgerPath) {
  let raw
  try {
    raw = ledgerPath.endsWith('.gz')
      ? gunzipSync(payload).toString('utf8')
      : payload.toString('utf8')
  } catch (error) {
    throw new Error(
      '[workbook-parser] enrichment ledger failed to decode: ' +
        path.basename(ledgerPath) + ': ' + error.message,
    )
  }

  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch (error) {
    throw new Error(
      '[workbook-parser] invalid enrichment ledger JSON: ' +
        path.basename(ledgerPath) + ': ' + error.message,
    )
  }

  for (const key of ENRICHMENT_ARRAY_KEYS) {
    if (!Array.isArray(parsed?.[key])) {
      throw new Error(
        '[workbook-parser] enrichment ledger missing array ' + key + ': ' +
          path.basename(ledgerPath),
      )
    }
  }

  return parsed
}

let enrichmentCache = null

function readEnrichmentLedger() {
  if (enrichmentCache) return enrichmentCache

  const merged = Object.fromEntries(ENRICHMENT_ARRAY_KEYS.map((key) => [key, []]))
  for (const manifestPath of listEnrichmentManifestFiles()) {
    const { manifest, ledgerPath } = readEnrichmentManifest(manifestPath)
    if (!fs.existsSync(ledgerPath)) {
      throw new Error(
        '[workbook-parser] enrichment manifest points to a missing ledger: ' + ledgerPath,
      )
    }

    const payload = fs.readFileSync(ledgerPath)
    verifyLedgerIntegrity(payload, manifest, manifestPath, ledgerPath)
    const parsed = parseEnrichmentLedger(payload, ledgerPath)
    for (const key of ENRICHMENT_ARRAY_KEYS) merged[key].push(...parsed[key])
  }

  merged.evidence = applyEvidenceCorrections(merged.evidence)

  const seenEvidenceIds = new Set()
  for (const row of merged.evidence) {
    const recordId = clean(row.record_id)
    if (!recordId) {
      throw new Error('[workbook-parser] enrichment evidence row is missing record_id')
    }
    if (seenEvidenceIds.has(recordId)) {
      throw new Error('[workbook-parser] duplicate enrichment evidence record_id across manifests: ' + recordId)
    }
    seenEvidenceIds.add(recordId)
  }

  merged.sources = applySourceIdentityCorrections(merged.sources)

  enrichmentCache = merged
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


function applyEvidenceCorrections(rows) {
  const resolved = []
  const indexByEvidenceKey = new Map()

  for (const rawRow of rows) {
    const key = evidenceKey(rawRow)
    const correctionTarget = clean(rawRow?.corrects_evidence_key)

    if (!correctionTarget) {
      if (key) indexByEvidenceKey.set(key, resolved.length)
      resolved.push(rawRow)
      continue
    }

    if (!key || key !== correctionTarget) {
      throw new Error(
        '[workbook-parser] enrichment evidence correction must preserve evidence identity key: ' +
        (key || '(blank)') + ' -> ' + correctionTarget,
      )
    }

    const index = indexByEvidenceKey.get(correctionTarget)
    if (index === undefined) {
      throw new Error(
        '[workbook-parser] enrichment evidence correction target was not loaded earlier: ' +
        correctionTarget,
      )
    }

    const prior = resolved[index]
    const expected = rawRow?.expected_prior_evidence
    if (!expected || typeof expected !== 'object' || Array.isArray(expected)) {
      throw new Error(
        '[workbook-parser] enrichment evidence correction is missing expected_prior_evidence: ' +
        correctionTarget,
      )
    }

    for (const field of ['entity_slug', 'pmid', 'doi']) {
      const expectedValue = clean(expected[field]).toLowerCase()
      if (!expectedValue) continue
      if (clean(prior?.[field]).toLowerCase() !== expectedValue) {
        throw new Error(
          '[workbook-parser] enrichment evidence correction prior identity mismatch for ' +
          correctionTarget + '.' + field,
        )
      }
    }

    const replacement = { ...rawRow }
    delete replacement.corrects_evidence_key
    delete replacement.expected_prior_evidence
    delete replacement.correction_reason
    resolved[index] = replacement
    indexByEvidenceKey.set(key, index)
  }

  return resolved
}

function sourceKey(row) {
  const pmid = clean(first(row, ['pmid', 'PMID'])).toLowerCase()
  const doi = clean(first(row, ['doi', 'DOI']))
    .toLowerCase()
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//, '')
  const title = clean(first(row, ['title'])).toLowerCase()
  return pmid ? `pmid:${pmid}` : doi ? `doi:${doi}` : title ? `title:${title}` : ''
}

function applySourceIdentityCorrections(rows) {
  const resolved = []
  const indexBySourceId = new Map()

  for (const rawRow of rows) {
    const correctionTarget = clean(rawRow?.corrects_source_id)
    if (!correctionTarget) {
      const sourceId = clean(rawRow?.source_id)
      if (sourceId) indexBySourceId.set(sourceId, resolved.length)
      resolved.push(rawRow)
      continue
    }

    const sourceId = clean(rawRow?.source_id)
    if (!sourceId || sourceId !== correctionTarget) {
      throw new Error(
        '[workbook-parser] enrichment source correction must preserve source_id: ' +
        (sourceId || '(blank)') + ' -> ' + correctionTarget,
      )
    }

    const index = indexBySourceId.get(correctionTarget)
    if (index === undefined) {
      throw new Error(
        '[workbook-parser] enrichment source correction target was not loaded earlier: ' +
        correctionTarget,
      )
    }

    const prior = resolved[index]
    if (sourceKey(prior) !== sourceKey(rawRow)) {
      throw new Error(
        '[workbook-parser] enrichment source correction cannot change PMID/DOI/title identity key: ' +
        correctionTarget,
      )
    }

    for (const field of ['pmid', 'doi']) {
      if (clean(prior?.[field]).toLowerCase() !== clean(rawRow?.[field]).toLowerCase()) {
        throw new Error(
          '[workbook-parser] enrichment source correction cannot change identifier ' +
          field + ' for ' + correctionTarget,
        )
      }
    }

    const expected = rawRow?.expected_prior_identity
    if (!expected || typeof expected !== 'object' || Array.isArray(expected)) {
      throw new Error(
        '[workbook-parser] enrichment source correction is missing expected_prior_identity: ' +
        correctionTarget,
      )
    }

    for (const field of ['doi', 'author_or_label', 'title']) {
      const expectedValue = clean(expected[field])
      if (!expectedValue) continue
      if (clean(prior?.[field]) !== expectedValue) {
        throw new Error(
          '[workbook-parser] enrichment source correction prior identity mismatch for ' +
          correctionTarget + '.' + field,
        )
      }
    }

    const replacement = { ...rawRow }
    delete replacement.corrects_source_id
    delete replacement.expected_prior_identity
    delete replacement.correction_reason
    resolved[index] = replacement
    indexBySourceId.set(sourceId, index)
  }

  return resolved
}

function materializeEvidenceRow(row) {
  const output = { ...row }
  delete output.corrects_evidence_key
  delete output.expected_prior_evidence
  delete output.correction_reason
  return output
}

function validateEvidenceCorrection(prior, row, key) {
  const target = clean(row?.corrects_evidence_key)
  if (!target) return false
  if (target !== key) {
    throw new Error(
      '[workbook-parser] enrichment evidence correction target does not match row identity: ' +
      target + ' != ' + key,
    )
  }

  const reason = clean(row?.correction_reason)
  if (!reason) {
    throw new Error(
      '[workbook-parser] enrichment evidence correction is missing correction_reason: ' +
      clean(row?.record_id || key),
    )
  }

  const expected = row?.expected_prior_evidence
  if (!expected || typeof expected !== 'object' || Array.isArray(expected)) {
    throw new Error(
      '[workbook-parser] enrichment evidence correction is missing expected_prior_evidence: ' +
      clean(row?.record_id || key),
    )
  }

  const expectedEntity = slug(expected.entity_slug || expected.profile_slug)
  const priorEntity = slug(first(prior, ['entity_slug', 'profile_slug', 'slug', 'herb_slug', 'compound_slug']))
  if (expectedEntity && expectedEntity !== priorEntity) {
    throw new Error(
      '[workbook-parser] enrichment evidence correction prior entity mismatch for ' + key,
    )
  }

  const expectedPmid = clean(expected.pmid).toLowerCase()
  const priorPmid = clean(first(prior, ['pmid', 'PMID'])).toLowerCase()
  if (expectedPmid && expectedPmid !== priorPmid) {
    throw new Error(
      '[workbook-parser] enrichment evidence correction prior PMID mismatch for ' + key,
    )
  }

  const expectedDoi = clean(expected.doi)
    .toLowerCase()
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//, '')
  const priorDoi = clean(first(prior, ['doi', 'DOI']))
    .toLowerCase()
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//, '')
  if (expectedDoi && expectedDoi !== priorDoi) {
    throw new Error(
      '[workbook-parser] enrichment evidence correction prior DOI mismatch for ' + key,
    )
  }

  const expectedRecordId = clean(expected.record_id)
  const priorRecordId = clean(first(prior, ['record_id', 'claim_id', 'claim id', 'id']))
  if (expectedRecordId && expectedRecordId !== priorRecordId) {
    throw new Error(
      '[workbook-parser] enrichment evidence correction prior record mismatch for ' + key,
    )
  }

  return true
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
    const resolvedRows = [...sheets[claimSheet]]
    const indexByKey = new Map()
    for (let index = 0; index < resolvedRows.length; index += 1) {
      const key = evidenceKey(resolvedRows[index])
      if (key && !indexByKey.has(key)) indexByKey.set(key, index)
    }

    for (const row of ledger.evidence) {
      const entitySlug = slug(row.entity_slug || row.profile_slug)
      const key = evidenceKey(row)
      if (!entitySlug || !entityTypes.has(entitySlug)) {
        throw new Error(
          `[workbook-parser] enrichment evidence references unknown entity: ${clean(row.entity_slug || row.profile_slug)}`,
        )
      }
      if (!key) continue

      const existingIndex = indexByKey.get(key)
      const correctionTarget = clean(row.corrects_evidence_key)
      if (existingIndex !== undefined) {
        if (!correctionTarget) continue

        const prior = resolvedRows[existingIndex]
        validateEvidenceCorrection(prior, row, key)
        const incoming = materializeEvidenceRow(row)
        resolvedRows[existingIndex] = {
          ...prior,
          ...incoming,
          metadata_source: clean(row.metadata_source) || 'runtime-enrichment',
        }
        continue
      }

      if (correctionTarget) {
        throw new Error(
          '[workbook-parser] enrichment evidence correction target was not loaded earlier: ' +
          correctionTarget,
        )
      }

      const addition = {
        ...materializeEvidenceRow(row),
        metadata_source: clean(row.metadata_source) || 'runtime-enrichment',
      }
      indexByKey.set(key, resolvedRows.length)
      resolvedRows.push(addition)
      evidenceAdded += 1
    }

    sheets[claimSheet] = resolvedRows
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
