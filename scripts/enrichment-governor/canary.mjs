import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'

import { buildClaimSourceGraph, buildCoverageHeatmap, contract, isPublishableEntry } from './governor.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '..', '..')
const schema = JSON.parse(fs.readFileSync(path.join(repoRoot, 'schemas', 'normalized-enrichment-entry.schema.json'), 'utf8'))
const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: true })
addFormats(ajv)
const validateEntrySchema = ajv.compile(schema)

function parseJsonl(file) {
  if (!fs.existsSync(file)) return []
  return fs.readFileSync(file, 'utf8').split(/\r?\n/).map(line => line.trim()).filter(Boolean).map((line, index) => {
    try { return JSON.parse(line) } catch (error) {
      throw new Error(`Malformed JSONL at ${file}:${index + 1}: ${error.message}`)
    }
  })
}

function loadJson(file, fallback = []) {
  if (!fs.existsSync(file)) return fallback
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function schemaValid(row) {
  return validateEntrySchema(row) === true
}

function checkValue(row, check) {
  if (check === 'source_linkage') return row.sourceLinkage
  if (check === 'evidence_class') return row.evidenceClass
  if (check === 'schema_validity') return row.schemaValidity
  if (check === 'null_visibility') return row.nullVisibility
  if (check === 'safety_visibility') return row.safetyVisibility
  if (check === 'no_unresolved_source_ids') return row.unresolvedSourceIds.length === 0
  throw new Error(`Unknown canary check: ${check}`)
}

export function verifyCanaries(entries, sourceRegistry = []) {
  const publishableEntries = entries.filter(isPublishableEntry)
  const heatmap = buildCoverageHeatmap(publishableEntries)
  const graph = buildClaimSourceGraph(publishableEntries, sourceRegistry)
  const grouped = new Map()
  for (const entry of publishableEntries) {
    const key = `${entry.entityType}:${entry.entitySlug}`
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key).push(entry)
  }

  const fixed = contract.canaries.fixedAnchors.map(slug => {
    const matches = [...grouped.entries()].filter(([key]) => key.endsWith(`:${slug}`))
    const rows = matches.flatMap(([, values]) => values)
    const sourceIds = [...new Set(rows.map(row => row.sourceId).filter(Boolean))]
    const unresolved = sourceIds.filter(id => !graph.nodes.sources[id]?.resolvedInRegistry)
    return {
      slug,
      present: rows.length > 0,
      claimCount: rows.length,
      sourceLinkage: rows.length > 0 && rows.every(row => Boolean(row.sourceId)),
      evidenceClass: rows.length > 0 && rows.every(row => Boolean(row.evidenceClass)),
      schemaValidity: rows.length > 0 && rows.every(schemaValid),
      nullVisibility: rows.some(row => row.claimType === 'efficacy_null_or_mixed' || row.claimType === 'evidence_conflict' || row.claimType === 'research_gap'),
      safetyVisibility: rows.some(row => row.claimType === 'safety_risk' || /adverse|caution|pregnancy|interaction/.test(row.topicType || '')),
      unresolvedSourceIds: unresolved,
    }
  })

  const dynamic = heatmap.rows
    .slice(0, contract.canaries.dynamicTopRiskCount)
    .map(row => ({ entity: row.entity, coverageScore: row.coverageScore, negativeEvidenceGap: row.negativeEvidenceGap, diversityFlags: row.sourceDiversity.flags }))

  const blockers = []
  for (const row of fixed) {
    if (!row.present) {
      blockers.push(`${row.slug}:missing_canary`)
      continue
    }
    for (const check of contract.canaries.requiredChecks || []) {
      if (!checkValue(row, check)) blockers.push(`${row.slug}:required_check_failed:${check}`)
    }
    for (const check of contract.canaries.anchorRequirements?.[row.slug] || []) {
      if (!checkValue(row, check)) blockers.push(`${row.slug}:anchor_requirement_failed:${check}`)
    }
  }

  const unresolvedSourceIds = [...new Set(fixed.flatMap(row => row.unresolvedSourceIds))].sort()
  const missingNullVisibilityAnchors = fixed.filter(row => row.present && !row.nullVisibility).map(row => row.slug)
  const missingSafetyVisibilityAnchors = fixed.filter(row => row.present && !row.safetyVisibility).map(row => row.slug)

  const baselineDebt = contract.canaries.baselineDebt || {}
  const allowedUnresolved = new Set(baselineDebt.allowedUnresolvedSourceIds || [])
  const allowedMissingNull = new Set(baselineDebt.allowedMissingNullVisibilityAnchors || [])
  const allowedMissingSafety = new Set(baselineDebt.allowedMissingSafetyVisibilityAnchors || [])
  const unexpectedUnresolvedSourceIds = unresolvedSourceIds.filter(id => !allowedUnresolved.has(id))
  const unexpectedMissingNullVisibilityAnchors = missingNullVisibilityAnchors.filter(slug => !allowedMissingNull.has(slug))
  const unexpectedMissingSafetyVisibilityAnchors = missingSafetyVisibilityAnchors.filter(slug => !allowedMissingSafety.has(slug))

  for (const id of unexpectedUnresolvedSourceIds) blockers.push(`new_provenance_debt:unresolved_source:${id}`)
  for (const slug of unexpectedMissingNullVisibilityAnchors) blockers.push(`new_canary_debt:missing_null_visibility:${slug}`)
  for (const slug of unexpectedMissingSafetyVisibilityAnchors) blockers.push(`new_canary_debt:missing_safety_visibility:${slug}`)

  const debt = {
    unresolvedSourceIds,
    missingNullVisibilityAnchors,
    missingSafetyVisibilityAnchors,
    unexpectedUnresolvedSourceIds,
    unexpectedMissingNullVisibilityAnchors,
    unexpectedMissingSafetyVisibilityAnchors,
  }
  const warnings = [
    ...missingNullVisibilityAnchors.map(slug => `${slug}:baseline_debt:no_null_or_conflict_canary`),
    ...missingSafetyVisibilityAnchors.map(slug => `${slug}:baseline_debt:no_safety_canary`),
    ...unresolvedSourceIds.map(id => `baseline_debt:unresolved_source:${id}`),
  ]
  const pass = blockers.length === 0
  const idealPass = pass && warnings.length === 0

  return {
    generatedAt: new Date().toISOString(),
    evaluatedEntryCount: publishableEntries.length,
    excludedEntryCount: entries.length - publishableEntries.length,
    fixed,
    dynamic,
    blockers,
    warnings,
    debt,
    pass,
    idealPass,
    status: !pass ? 'BLOCKED' : idealPass ? 'PASS' : 'PASS_WITH_BASELINE_DEBT',
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const entries = parseJsonl(path.join(repoRoot, 'public', 'data', 'enrichment-normalized.jsonl'))
  const registry = loadJson(path.join(repoRoot, 'public', 'data', 'source-registry.json'), [])
  const result = verifyCanaries(entries, registry)
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
  if (!result.pass) process.exitCode = 1
}
