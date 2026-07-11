#!/usr/bin/env node
// data:canonical:validate — validate every canonical record against its Zod
// schema, plus cross-file referential-integrity checks. Exit non-zero on any
// error so CI can gate on it.

import {
  entitySchema,
  claimSchema,
  edgeSchema,
  sourceSchema,
  validateAll,
} from './canonical/schema.mjs'
import { loadDataset } from './canonical/store.mjs'

function main() {
  const { entities, claims, edges, sources } = loadDataset()

  const results = [
    ['entities', validateAll(entitySchema, entities, 'entity')],
    ['claims', validateAll(claimSchema, claims, 'claim')],
    ['edges', validateAll(edgeSchema, edges, 'edge')],
    ['sources', validateAll(sourceSchema, sources, 'source')],
  ]

  let errorCount = 0
  for (const [label, { valid, errors }] of results) {
    console.log(`  ${label}: ${valid.length} valid, ${errors.length} invalid`)
    for (const error of errors.slice(0, 25)) {
      errorCount += 1
      const detail = error.issues.map((i) => `${i.path || '(root)'}: ${i.message}`).join('; ')
      console.error(`    ✗ ${error.id} — ${detail}`)
    }
    if (errors.length > 25) console.error(`    …and ${errors.length - 25} more`)
    errorCount += Math.max(0, errors.length - 25)
  }

  // Referential integrity: ids unique, claim/edge endpoints exist, source refs exist.
  const entityIds = new Set(entities.map((e) => e.id))
  const sourceIds = new Set(sources.map((s) => s.id))
  const refErrors = []

  const seen = new Set()
  for (const record of [...entities, ...claims, ...edges, ...sources]) {
    if (seen.has(record.id)) refErrors.push(`duplicate id: ${record.id}`)
    seen.add(record.id)
  }

  for (const claim of claims) {
    if (!entityIds.has(claim.subject_id)) refErrors.push(`claim ${claim.id}: subject_id ${claim.subject_id} not found`)
    if (claim.object_id && !entityIds.has(claim.object_id)) {
      refErrors.push(`claim ${claim.id}: object_id ${claim.object_id} not found`)
    }
    for (const sid of claim.source_ids || []) {
      if (!sourceIds.has(sid)) refErrors.push(`claim ${claim.id}: source ${sid} not found`)
    }
  }
  for (const edge of edges) {
    if (!entityIds.has(edge.from_id)) refErrors.push(`edge ${edge.id}: from_id ${edge.from_id} not found`)
    if (!entityIds.has(edge.to_id)) refErrors.push(`edge ${edge.id}: to_id ${edge.to_id} not found`)
  }

  if (refErrors.length) {
    console.error(`  referential integrity: ${refErrors.length} issue(s)`)
    for (const err of refErrors.slice(0, 25)) console.error(`    ✗ ${err}`)
    if (refErrors.length > 25) console.error(`    …and ${refErrors.length - 25} more`)
  }

  const total = errorCount + refErrors.length
  if (total > 0) {
    console.error(`\n✗ canonical validation failed: ${total} issue(s)`)
    process.exit(1)
  }
  console.log('\n✓ canonical validation passed')
}

main()
