#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildStableEntityId, normalizeAliases, normalizeIdentityText, requiresFormReview } from '../../config/evidence-graph/identity-rules.mjs'
import { getSheet, getSheetNames, readWorkbook, sheetToRows } from '../data/workbook-parser.mjs'
import { assertWorkbookExists, getRepoRoot, resolveWorkbookPath } from '../workbook-source.mjs'

const OUTPUT = 'data/graph/identity/substance-registry.json'
const REPORT = 'data/graph/identity/identity-validation-report.json'
const SHEETS = ['Entity_Master', 'Sheet7', 'Herb Master V3', 'Herb Monographs', 'Site Export Herbs', 'Compound Master V3', 'Site Export Compounds']
const clean = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()
const normalizeType = (value) => ['herb', 'compound'].includes(clean(value).toLowerCase()) ? clean(value).toLowerCase() : null

function writeJson(target, value) {
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`)
}

function recordFromRow(row, index, sheet, entityType, workbookPath) {
  const canonicalSlug = clean(row.canonical_slug_v2 || row.slug)
  const canonicalName = clean(row.name || row.canonical_name)
  const scientificName = clean(row.latin_name || row.scientific_name || row.scientificName) || null
  const aliases = normalizeAliases([row.aliases, row.common_names, row.commonNames, row.alternate_names, row.synonyms, scientificName])
    .filter((alias) => normalizeIdentityText(alias) !== normalizeIdentityText(canonicalName))
  const reviewFlags = []
  if (!canonicalSlug) reviewFlags.push('missing-canonical-slug')
  if (!canonicalName) reviewFlags.push('missing-canonical-name')
  if (requiresFormReview([canonicalName, scientificName, row.formulations, row.oral_form, row.extract_type, row.standardization_target, row.preparation].filter(Boolean).join(' '))) reviewFlags.push('form-sensitive-identity')

  return {
    id: canonicalSlug ? buildStableEntityId(entityType, canonicalSlug) : null,
    entityType,
    canonicalSlug: canonicalSlug || null,
    canonicalName: canonicalName || null,
    scientificName,
    parentEntityId: null,
    aliases,
    status: reviewFlags.length ? 'needs-review' : 'active',
    reviewFlags,
    provenance: {
      workbook: path.basename(workbookPath),
      sheet,
      sourceRow: index + 2,
      sourceSlug: clean(row.slug) || canonicalSlug || `row-${index + 2}`,
      canonicalSlugField: clean(row.canonical_slug_v2) ? 'canonical_slug_v2' : 'slug',
      duplicateGroup: clean(row.duplicate_group_v2) || null,
      importerVersion: '0.4.0',
    },
  }
}

function collisionGroups(records) {
  const groups = []
  const indexes = [
    ['stable-id-collision', (r) => r.id],
    ['canonical-slug-collision', (r) => normalizeIdentityText(r.canonicalSlug)],
    ['canonical-name-collision', (r) => normalizeIdentityText(r.canonicalName)],
  ]
  for (const [type, keyOf] of indexes) {
    const index = new Map()
    for (const record of records) {
      const key = keyOf(record)
      if (!key) continue
      index.set(key, [...(index.get(key) || []), record])
    }
    for (const [key, matches] of index) {
      if (matches.length < 2) continue
      const crossType = new Set(matches.map((r) => r.entityType)).size > 1
      groups.push({
        type,
        key,
        recordIds: matches.map((r) => r.id),
        classification: type.includes('name') ? (crossType ? 'cross-type-name-conflict' : 'same-type-name-duplicate') : 'identity-critical',
        severity: type.includes('name') ? 'high' : 'blocking',
      })
    }
  }
  return groups
}

export async function buildIdentityRegistry(options = {}) {
  const repoRoot = options.repoRoot || getRepoRoot()
  const workbookPath = options.workbookPath || resolveWorkbookPath(repoRoot)
  assertWorkbookExists(workbookPath)
  const workbook = await readWorkbook(workbookPath, { sheets: SHEETS })
  const names = getSheetNames(workbook)
  const master = names.find((name) => ['Entity_Master', 'Sheet7'].includes(name))
  const records = []

  if (master) {
    sheetToRows(getSheet(workbook, master)).forEach((row, index) => {
      const entityType = normalizeType(row.entity_type)
      if (entityType) records.push(recordFromRow(row, index, master, entityType, workbookPath))
    })
  } else {
    for (const [entityType, candidates] of [['herb', ['Herb Master V3', 'Herb Monographs', 'Site Export Herbs']], ['compound', ['Compound Master V3', 'Site Export Compounds']]]) {
      const sheet = candidates.find((name) => names.includes(name))
      if (!sheet) continue
      sheetToRows(getSheet(workbook, sheet)).forEach((row, index) => records.push(recordFromRow(row, index, sheet, entityType, workbookPath)))
    }
  }

  const valid = records.filter((r) => r.id && r.canonicalSlug && r.canonicalName)
  const collisions = collisionGroups(valid)
  const collided = new Set(collisions.flatMap((group) => group.recordIds))
  for (const record of valid) {
    if (!collided.has(record.id)) continue
    record.status = 'duplicate-candidate'
    record.reviewFlags = [...new Set([...record.reviewFlags, 'identity-collision'])]
  }
  valid.sort((a, b) => a.entityType.localeCompare(b.entityType) || a.canonicalSlug.localeCompare(b.canonicalSlug))

  const report = {
    importerVersion: '0.4.0',
    generatedAt: new Date().toISOString(),
    summary: {
      totalCandidates: records.length,
      registryRecords: valid.length,
      herbRecords: valid.filter((r) => r.entityType === 'herb').length,
      compoundRecords: valid.filter((r) => r.entityType === 'compound').length,
      invalidRecords: records.length - valid.length,
      missingIdRecords: records.filter((r) => !r.id).length,
      collisionCount: collisions.length,
      reviewQueueRecords: valid.filter((r) => r.status !== 'active').length,
      duplicateCandidateRecords: valid.filter((r) => r.status === 'duplicate-candidate').length,
    },
    collisions,
    collisionSummary: {
      byType: Object.fromEntries([...new Set(collisions.map((c) => c.type))].map((type) => [type, collisions.filter((c) => c.type === type).length])),
      byClassification: Object.fromEntries([...new Set(collisions.map((c) => c.classification))].map((type) => [type, collisions.filter((c) => c.classification === type).length])),
    },
  }

  const outputPath = path.resolve(repoRoot, options.outputPath || OUTPUT)
  const reportPath = path.resolve(repoRoot, options.reportPath || REPORT)
  writeJson(outputPath, valid)
  writeJson(reportPath, report)
  return { registry: valid, report, outputPath, reportPath }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  buildIdentityRegistry().then(({ report }) => console.log(`[evidence-graph] ${report.summary.registryRecords} identities; ${report.summary.collisionCount} collisions`)).catch((error) => { console.error(error); process.exitCode = 1 })
}
