#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  buildStableEntityId,
  normalizeAliases,
  normalizeIdentityText,
  requiresFormReview,
} from '../../config/evidence-graph/identity-rules.mjs'
import {
  getSheet,
  getSheetNames,
  readWorkbook,
  sheetToRows,
} from '../data/workbook-parser.mjs'
import {
  assertWorkbookExists,
  getRepoRoot,
  resolveWorkbookPath,
} from '../workbook-source.mjs'

const HERB_SHEET_CANDIDATES = ['Herb Master V3', 'Herb Monographs', 'Site Export Herbs']
const COMPOUND_SHEET_CANDIDATES = ['Compound Master V3', 'Site Export Compounds']
const ENTITY_MASTER_CANDIDATES = ['Entity_Master', 'Sheet7']
const DEFAULT_OUTPUT = 'data/graph/identity/substance-registry.json'
const DEFAULT_REPORT = 'data/graph/identity/identity-validation-report.json'
const IMPORTER_VERSION = '0.2.0'

const ALIAS_FIELDS = ['aliases', 'common_names', 'commonNames', 'alternate_names', 'synonyms']
const SCIENTIFIC_NAME_FIELDS = ['latin_name', 'scientific_name', 'scientificName']
const FORM_FIELDS = ['formulations', 'oral_form', 'extract_type', 'standardization_target', 'preparation']

function clean(value) {
  if (value === null || value === undefined) return ''
  return String(value).replace(/\s+/g, ' ').trim()
}

function firstValue(row, fields) {
  for (const field of fields) {
    const value = clean(row?.[field])
    if (value) return value
  }
  return ''
}

function allValues(row, fields) {
  return fields.flatMap((field) => normalizeAliases(row?.[field] ?? []))
}

function canonicalSlugFor(row) {
  return clean(row?.canonical_slug_v2) || clean(row?.slug)
}

function canonicalNameFor(row) {
  return clean(row?.name) || clean(row?.canonical_name)
}

function provenanceFor({ workbookPath, sheetName, rowNumber, row, canonicalSlug }) {
  return {
    workbook: path.basename(workbookPath),
    sheet: sheetName,
    sourceRow: rowNumber,
    sourceSlug: clean(row?.slug) || canonicalSlug || `row-${rowNumber}`,
    canonicalSlugField: clean(row?.canonical_slug_v2) ? 'canonical_slug_v2' : 'slug',
    duplicateGroup: clean(row?.duplicate_group_v2) || null,
    importerVersion: IMPORTER_VERSION,
  }
}

export function buildIdentityRecord({ row, rowNumber, sheetName, entityType, workbookPath }) {
  const canonicalSlug = canonicalSlugFor(row)
  const canonicalName = canonicalNameFor(row)
  const scientificName = firstValue(row, SCIENTIFIC_NAME_FIELDS)
  const aliases = normalizeAliases([
    ...allValues(row, ALIAS_FIELDS),
    scientificName,
  ]).filter((value) => normalizeIdentityText(value) !== normalizeIdentityText(canonicalName))
  const formSignals = FORM_FIELDS.map((field) => clean(row?.[field])).filter(Boolean)
  const reviewFlags = []

  if (!canonicalSlug) reviewFlags.push('missing-canonical-slug')
  if (!canonicalName) reviewFlags.push('missing-canonical-name')
  if (requiresFormReview([canonicalName, scientificName, ...formSignals].join(' '))) {
    reviewFlags.push('form-sensitive-identity')
  }

  return {
    id: canonicalSlug ? buildStableEntityId(entityType, canonicalSlug) : null,
    entityType,
    canonicalSlug: canonicalSlug || null,
    canonicalName: canonicalName || null,
    scientificName: scientificName || null,
    parentEntityId: null,
    aliases,
    status: reviewFlags.length ? 'needs-review' : 'active',
    reviewFlags,
    provenance: provenanceFor({
      workbookPath,
      sheetName,
      rowNumber,
      row,
      canonicalSlug,
    }),
  }
}

function collectRecords({ rows, sheetName, entityType, workbookPath }) {
  return rows
    .map((row, index) => buildIdentityRecord({
      row,
      rowNumber: index + 2,
      sheetName,
      entityType,
      workbookPath,
    }))
    .filter((record) => record.canonicalName || record.canonicalSlug)
}

export function normalizeEntityMasterType(value) {
  const type = clean(value).toLowerCase()
  return type === 'herb' || type === 'compound' ? type : null
}

export function collectEntityMasterRecords({ rows, sheetName, workbookPath }) {
  return rows
    .map((row, index) => {
      const entityType = normalizeEntityMasterType(row?.entity_type)
      if (!entityType) return null
      return buildIdentityRecord({
        row,
        rowNumber: index + 2,
        sheetName,
        entityType,
        workbookPath,
      })
    })
    .filter((record) => record && (record.canonicalName || record.canonicalSlug))
}

function findSheetName(workbook, candidates) {
  const names = getSheetNames(workbook)
  const exact = candidates.find((candidate) => names.includes(candidate))
  if (exact) return exact

  const normalized = new Map(names.map((name) => [clean(name).toLowerCase(), name]))
  for (const candidate of candidates) {
    const match = normalized.get(clean(candidate).toLowerCase())
    if (match) return match
  }
  return null
}

export function resolveIdentitySources(workbook) {
  const herbSheetName = findSheetName(workbook, HERB_SHEET_CANDIDATES)
  const compoundSheetName = findSheetName(workbook, COMPOUND_SHEET_CANDIDATES)
  const entityMasterSheetName = findSheetName(workbook, ENTITY_MASTER_CANDIDATES)

  if (!herbSheetName && !compoundSheetName && !entityMasterSheetName) {
    throw new Error(
      `No supported identity sheet found. Expected one of ${[
        ...HERB_SHEET_CANDIDATES,
        ...COMPOUND_SHEET_CANDIDATES,
        ...ENTITY_MASTER_CANDIDATES,
      ].join(', ')}. Available sheets: ${getSheetNames(workbook).join(', ')}`,
    )
  }

  return { herbSheetName, compoundSheetName, entityMasterSheetName }
}

function addIndexValue(index, key, record) {
  if (!key) return
  const existing = index.get(key) ?? []
  existing.push(record)
  index.set(key, existing)
}

function uniqueRecords(records) {
  const byIdentity = new Map()

  for (const record of records) {
    const key = record.id || [
      record.entityType,
      record.canonicalSlug,
      record.provenance?.sheet,
      record.provenance?.sourceRow,
    ].join(':')
    if (!byIdentity.has(key)) byIdentity.set(key, record)
  }

  return [...byIdentity.values()]
}

function summarizeRecord(record) {
  return {
    id: record.id,
    entityType: record.entityType,
    canonicalName: record.canonicalName,
    canonicalSlug: record.canonicalSlug,
    provenance: record.provenance,
  }
}

export function buildIdentityValidationReport(records) {
  const idIndex = new Map()
  const slugIndex = new Map()
  const nameIndex = new Map()
  const aliasIndex = new Map()

  for (const record of records) {
    addIndexValue(idIndex, record.id, record)
    addIndexValue(slugIndex, normalizeIdentityText(record.canonicalSlug), record)
    addIndexValue(nameIndex, normalizeIdentityText(record.canonicalName), record)
    for (const alias of record.aliases) {
      addIndexValue(aliasIndex, normalizeIdentityText(alias), record)
    }
  }

  const collisionsFrom = (index, type) => [...index.entries()]
    .map(([key, matches]) => [key, uniqueRecords(matches)])
    .filter(([key, matches]) => key && matches.length > 1)
    .map(([key, matches]) => ({
      type,
      key,
      recordIds: matches.map((record) => record.id),
      entities: matches.map(summarizeRecord),
    }))

  const aliasCollisions = [...aliasIndex.entries()]
    .map(([key, aliasMatches]) => [
      key,
      uniqueRecords([
        ...aliasMatches,
        ...(nameIndex.get(key) ?? []),
        ...(slugIndex.get(key) ?? []),
      ]),
    ])
    .filter(([key, matches]) => key && matches.length > 1)
    .map(([key, matches]) => ({
      type: 'alias-collision',
      key,
      recordIds: matches.map((record) => record.id),
      entities: matches.map(summarizeRecord),
    }))

  const missingIds = records.filter((record) => !record.id)
  const invalidRecords = records.filter((record) => !record.id || !record.canonicalSlug || !record.canonicalName)
  const needsReview = records.filter((record) => record.status === 'needs-review')
  const collisions = [
    ...collisionsFrom(idIndex, 'stable-id-collision'),
    ...collisionsFrom(slugIndex, 'canonical-slug-collision'),
    ...collisionsFrom(nameIndex, 'canonical-name-collision'),
    ...aliasCollisions,
  ]

  return {
    importerVersion: IMPORTER_VERSION,
    generatedAt: new Date().toISOString(),
    summary: {
      totalCandidates: records.length,
      registryRecords: records.length - invalidRecords.length,
      herbRecords: records.filter((record) => record.entityType === 'herb').length,
      compoundRecords: records.filter((record) => record.entityType === 'compound').length,
      activeRecords: records.filter((record) => record.status === 'active').length,
      needsReviewRecords: needsReview.length,
      invalidRecords: invalidRecords.length,
      missingIdRecords: missingIds.length,
      collisionCount: collisions.length,
    },
    collisions,
    invalidRecords: invalidRecords.map(summarizeRecord),
    needsReview: needsReview.map((record) => ({
      ...summarizeRecord(record),
      reviewFlags: record.reviewFlags,
    })),
  }
}

function sortRecords(records) {
  return [...records].sort((a, b) => {
    const typeCompare = a.entityType.localeCompare(b.entityType)
    if (typeCompare !== 0) return typeCompare
    return String(a.canonicalSlug ?? '').localeCompare(String(b.canonicalSlug ?? ''))
  })
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

export async function buildIdentityRegistry(options = {}) {
  const repoRoot = options.repoRoot ?? getRepoRoot()
  const workbookPath = options.workbookPath ?? resolveWorkbookPath(repoRoot)
  const outputPath = path.resolve(repoRoot, options.outputPath ?? DEFAULT_OUTPUT)
  const reportPath = path.resolve(repoRoot, options.reportPath ?? DEFAULT_REPORT)

  assertWorkbookExists(workbookPath)

  const requestedSheets = [
    ...HERB_SHEET_CANDIDATES,
    ...COMPOUND_SHEET_CANDIDATES,
    ...ENTITY_MASTER_CANDIDATES,
  ]
  const workbook = await readWorkbook(workbookPath, { sheets: requestedSheets })
  const sources = resolveIdentitySources(workbook)

  const entityMasterRecords = sources.entityMasterSheetName
    ? collectEntityMasterRecords({
        rows: sheetToRows(getSheet(workbook, sources.entityMasterSheetName)),
        sheetName: sources.entityMasterSheetName,
        workbookPath,
      })
    : []

  const masterHerbs = entityMasterRecords.filter((record) => record.entityType === 'herb')
  const masterCompounds = entityMasterRecords.filter((record) => record.entityType === 'compound')

  const herbRecords = sources.herbSheetName
    ? collectRecords({
        rows: sheetToRows(getSheet(workbook, sources.herbSheetName)),
        sheetName: sources.herbSheetName,
        entityType: 'herb',
        workbookPath,
      })
    : masterHerbs

  const compoundRecords = sources.compoundSheetName
    ? collectRecords({
        rows: sheetToRows(getSheet(workbook, sources.compoundSheetName)),
        sheetName: sources.compoundSheetName,
        entityType: 'compound',
        workbookPath,
      })
    : masterCompounds

  if (herbRecords.length === 0) {
    throw new Error('No herb identities were found in supported workbook sheets')
  }
  if (compoundRecords.length === 0) {
    throw new Error('No compound identities were found in supported workbook sheets')
  }

  const records = sortRecords([...herbRecords, ...compoundRecords])
  const report = buildIdentityValidationReport(records)
  const registry = records.filter((record) => (
    record.id && record.canonicalSlug && record.canonicalName
  ))

  writeJson(outputPath, registry)
  writeJson(reportPath, {
    ...report,
    sourceWorkbook: path.relative(repoRoot, workbookPath).replaceAll(path.sep, '/'),
    sourceSheets: {
      herbs: sources.herbSheetName || sources.entityMasterSheetName,
      compounds: sources.compoundSheetName || sources.entityMasterSheetName,
    },
  })

  return { registry, report, outputPath, reportPath }
}

async function main() {
  const result = await buildIdentityRegistry()
  const summary = result.report.summary

  console.log(`[evidence-graph] Identity registry written: ${path.relative(getRepoRoot(), result.outputPath)}`)
  console.log(`[evidence-graph] Validation report written: ${path.relative(getRepoRoot(), result.reportPath)}`)
  console.log(`[evidence-graph] Registry records: ${summary.registryRecords} (${summary.herbRecords} herbs, ${summary.compoundRecords} compounds)`)
  console.log(`[evidence-graph] Needs review: ${summary.needsReviewRecords}`)
  console.log(`[evidence-graph] Collisions: ${summary.collisionCount}`)

  if (summary.invalidRecords > 0) process.exitCode = 1
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => {
    console.error(`[evidence-graph] ${error.stack || error.message}`)
    process.exitCode = 1
  })
}
