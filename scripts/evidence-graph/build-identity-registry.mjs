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
import { getSheet, readWorkbook, sheetToRows } from '../data/workbook-parser.mjs'
import {
  assertWorkbookExists,
  getRepoRoot,
  resolveWorkbookPath,
} from '../workbook-source.mjs'

const HERB_SHEET = 'Herb Master V3'
const COMPOUND_SHEET = 'Compound Master V3'
const DEFAULT_OUTPUT = 'data/graph/identity/substance-registry.json'
const DEFAULT_REPORT = 'data/graph/identity/identity-validation-report.json'

const ALIAS_FIELDS = [
  'aliases',
  'common_names',
  'commonNames',
  'alternate_names',
  'synonyms',
]

const SCIENTIFIC_NAME_FIELDS = [
  'latin_name',
  'scientific_name',
  'scientificName',
]

const FORM_FIELDS = [
  'formulations',
  'oral_form',
  'extract_type',
  'standardization_target',
  'preparation',
]

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

function provenanceFor({ workbookPath, sheetName, rowNumber }) {
  return {
    workbook: path.basename(workbookPath),
    sheet: sheetName,
    row: rowNumber,
  }
}

export function buildIdentityRecord({ row, rowNumber, sheetName, entityType, workbookPath }) {
  const canonicalSlug = canonicalSlugFor(row)
  const canonicalName = canonicalNameFor(row)
  const scientificName = firstValue(row, SCIENTIFIC_NAME_FIELDS)
  const aliases = normalizeAliases([
    ...allValues(row, ALIAS_FIELDS),
    canonicalName,
    scientificName,
  ]).filter((value) => normalizeIdentityText(value) !== normalizeIdentityText(canonicalName))
  const formSignals = FORM_FIELDS
    .map((field) => clean(row?.[field]))
    .filter(Boolean)
  const reviewReasons = []

  if (!canonicalSlug) reviewReasons.push('missing-canonical-slug')
  if (!canonicalName) reviewReasons.push('missing-canonical-name')
  if (requiresFormReview([canonicalName, scientificName, ...formSignals].join(' '))) {
    reviewReasons.push('form-sensitive-identity')
  }

  const id = canonicalSlug
    ? buildStableEntityId(entityType, canonicalSlug)
    : null

  return {
    id,
    entityType,
    canonicalSlug: canonicalSlug || null,
    canonicalName: canonicalName || null,
    scientificName: scientificName || null,
    aliases,
    parentId: null,
    status: reviewReasons.length ? 'needs-review' : 'active',
    reviewReasons,
    provenance: provenanceFor({ workbookPath, sheetName, rowNumber }),
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

function addIndexValue(index, key, record) {
  if (!key) return
  const existing = index.get(key) ?? []
  existing.push(record)
  index.set(key, existing)
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
    .filter(([key, matches]) => key && matches.length > 1)
    .map(([key, matches]) => ({
      type,
      key,
      recordIds: matches.map((record) => record.id),
      entities: matches.map((record) => ({
        id: record.id,
        entityType: record.entityType,
        canonicalName: record.canonicalName,
        canonicalSlug: record.canonicalSlug,
        provenance: record.provenance,
      })),
    }))

  const aliasCollisions = [...aliasIndex.entries()]
    .filter(([key, matches]) => {
      if (!key || matches.length < 2) return false
      return new Set(matches.map((record) => record.id)).size > 1
    })
    .map(([key, matches]) => ({
      type: 'alias-collision',
      key,
      recordIds: [...new Set(matches.map((record) => record.id))],
      entities: matches.map((record) => ({
        id: record.id,
        entityType: record.entityType,
        canonicalName: record.canonicalName,
        canonicalSlug: record.canonicalSlug,
        provenance: record.provenance,
      })),
    }))

  const missingIds = records.filter((record) => !record.id)
  const needsReview = records.filter((record) => record.status === 'needs-review')
  const collisions = [
    ...collisionsFrom(idIndex, 'stable-id-collision'),
    ...collisionsFrom(slugIndex, 'canonical-slug-collision'),
    ...collisionsFrom(nameIndex, 'canonical-name-collision'),
    ...aliasCollisions,
  ]

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      totalRecords: records.length,
      herbRecords: records.filter((record) => record.entityType === 'herb').length,
      compoundRecords: records.filter((record) => record.entityType === 'compound').length,
      activeRecords: records.filter((record) => record.status === 'active').length,
      needsReviewRecords: needsReview.length,
      missingIdRecords: missingIds.length,
      collisionCount: collisions.length,
    },
    collisions,
    missingIds,
    needsReview: needsReview.map((record) => ({
      id: record.id,
      canonicalName: record.canonicalName,
      canonicalSlug: record.canonicalSlug,
      entityType: record.entityType,
      reviewReasons: record.reviewReasons,
      provenance: record.provenance,
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

function ensureParentDirectory(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
}

function writeJson(filePath, value) {
  ensureParentDirectory(filePath)
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

export async function buildIdentityRegistry(options = {}) {
  const repoRoot = options.repoRoot ?? getRepoRoot()
  const workbookPath = options.workbookPath ?? resolveWorkbookPath(repoRoot)
  const outputPath = path.resolve(repoRoot, options.outputPath ?? DEFAULT_OUTPUT)
  const reportPath = path.resolve(repoRoot, options.reportPath ?? DEFAULT_REPORT)

  assertWorkbookExists(workbookPath)

  const workbook = await readWorkbook(workbookPath, {
    sheets: [HERB_SHEET, COMPOUND_SHEET],
  })
  const herbSheet = getSheet(workbook, HERB_SHEET)
  const compoundSheet = getSheet(workbook, COMPOUND_SHEET)

  if (!herbSheet) throw new Error(`Required workbook sheet not found: ${HERB_SHEET}`)
  if (!compoundSheet) throw new Error(`Required workbook sheet not found: ${COMPOUND_SHEET}`)

  const herbRecords = collectRecords({
    rows: sheetToRows(herbSheet),
    sheetName: HERB_SHEET,
    entityType: 'herb',
    workbookPath,
  })
  const compoundRecords = collectRecords({
    rows: sheetToRows(compoundSheet),
    sheetName: COMPOUND_SHEET,
    entityType: 'compound',
    workbookPath,
  })
  const records = sortRecords([...herbRecords, ...compoundRecords])
  const report = buildIdentityValidationReport(records)
  const registry = {
    schemaVersion: '0.1.0',
    generatedAt: report.generatedAt,
    sourceWorkbook: path.relative(repoRoot, workbookPath).replaceAll(path.sep, '/'),
    records,
  }

  writeJson(outputPath, registry)
  writeJson(reportPath, report)

  return { registry, report, outputPath, reportPath }
}

async function main() {
  const result = await buildIdentityRegistry()
  const summary = result.report.summary

  console.log(`[evidence-graph] Identity registry written: ${path.relative(getRepoRoot(), result.outputPath)}`)
  console.log(`[evidence-graph] Validation report written: ${path.relative(getRepoRoot(), result.reportPath)}`)
  console.log(`[evidence-graph] Records: ${summary.totalRecords} (${summary.herbRecords} herbs, ${summary.compoundRecords} compounds)`)
  console.log(`[evidence-graph] Needs review: ${summary.needsReviewRecords}`)
  console.log(`[evidence-graph] Collisions: ${summary.collisionCount}`)

  if (summary.missingIdRecords > 0) {
    process.exitCode = 1
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => {
    console.error(`[evidence-graph] ${error.stack || error.message}`)
    process.exitCode = 1
  })
}
