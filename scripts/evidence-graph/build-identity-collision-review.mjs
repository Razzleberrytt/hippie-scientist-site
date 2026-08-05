#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getRepoRoot } from '../workbook-source.mjs'

const DEFAULT_REPORT = 'data/graph/identity/identity-validation-report.json'
const DEFAULT_OUTPUT = 'data/graph/identity/identity-collision-review.csv'
const SEVERITY_ORDER = Object.freeze({ blocking: 0, high: 1, medium: 2, low: 3 })

function clean(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function csvCell(value) {
  const text = Array.isArray(value) ? value.join(' | ') : clean(value)
  return `"${text.replaceAll('"', '""')}"`
}

function provenanceLabel(entity) {
  const provenance = entity?.provenance ?? {}
  const sheet = clean(provenance.sheet)
  const row = provenance.sourceRow ? `row${provenance.sourceRow}` : ''
  return [sheet, row].filter(Boolean).join('!')
}

export function buildCollisionReviewRows(report) {
  const collisions = Array.isArray(report?.collisions) ? report.collisions : []

  return collisions
    .map((collision) => ({
      severity: clean(collision.severity) || 'medium',
      classification: clean(collision.classification) || 'unclassified',
      collisionType: clean(collision.type),
      collisionKey: clean(collision.key),
      entityCount: collision.entities?.length ?? 0,
      recordIds: collision.recordIds ?? [],
      entityTypes: (collision.entities ?? []).map((entity) => entity.entityType),
      canonicalNames: (collision.entities ?? []).map((entity) => entity.canonicalName),
      canonicalSlugs: (collision.entities ?? []).map((entity) => entity.canonicalSlug),
      provenance: (collision.entities ?? []).map(provenanceLabel),
      recommendedAction: clean(collision.recommendedAction),
      resolutionStatus: 'pending',
      canonicalRecordId: '',
      resolutionNotes: '',
    }))
    .sort((a, b) => {
      const severityCompare = (SEVERITY_ORDER[a.severity] ?? 99) - (SEVERITY_ORDER[b.severity] ?? 99)
      if (severityCompare !== 0) return severityCompare
      const classCompare = a.classification.localeCompare(b.classification)
      if (classCompare !== 0) return classCompare
      return a.collisionKey.localeCompare(b.collisionKey)
    })
}

export function collisionReviewToCsv(rows) {
  const headers = [
    'severity',
    'classification',
    'collision_type',
    'collision_key',
    'entity_count',
    'record_ids',
    'entity_types',
    'canonical_names',
    'canonical_slugs',
    'provenance',
    'recommended_action',
    'resolution_status',
    'canonical_record_id',
    'resolution_notes',
  ]

  const lines = [headers.map(csvCell).join(',')]
  for (const row of rows) {
    lines.push([
      row.severity,
      row.classification,
      row.collisionType,
      row.collisionKey,
      row.entityCount,
      row.recordIds,
      row.entityTypes,
      row.canonicalNames,
      row.canonicalSlugs,
      row.provenance,
      row.recommendedAction,
      row.resolutionStatus,
      row.canonicalRecordId,
      row.resolutionNotes,
    ].map(csvCell).join(','))
  }

  return `${lines.join('\n')}\n`
}

export function buildCollisionReview(options = {}) {
  const repoRoot = options.repoRoot ?? getRepoRoot()
  const reportPath = path.resolve(repoRoot, options.reportPath ?? DEFAULT_REPORT)
  const outputPath = path.resolve(repoRoot, options.outputPath ?? DEFAULT_OUTPUT)

  if (!fs.existsSync(reportPath)) {
    throw new Error(`Identity validation report not found: ${reportPath}`)
  }

  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'))
  const rows = buildCollisionReviewRows(report)
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, collisionReviewToCsv(rows), 'utf8')

  return { rows, outputPath }
}

function main() {
  const result = buildCollisionReview()
  console.log(`[evidence-graph] Collision review written: ${path.relative(getRepoRoot(), result.outputPath)}`)
  console.log(`[evidence-graph] Collision groups queued: ${result.rows.length}`)
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try {
    main()
  } catch (error) {
    console.error(`[evidence-graph] ${error.stack || error.message}`)
    process.exitCode = 1
  }
}
