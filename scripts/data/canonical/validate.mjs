// Dataset validation: Zod schema + cross-file referential integrity.
// Shared by validate-canonical.mjs (CLI) and the patch apply engine.

import { entitySchema, claimSchema, edgeSchema, sourceSchema, validateAll } from './schema.mjs'

export function validateDataset({ entities, claims, edges, sources }) {
  const schemaResults = {
    entities: validateAll(entitySchema, entities, 'entity'),
    claims: validateAll(claimSchema, claims, 'claim'),
    edges: validateAll(edgeSchema, edges, 'edge'),
    sources: validateAll(sourceSchema, sources, 'source'),
  }

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
    if (claim.object_id && !entityIds.has(claim.object_id)) refErrors.push(`claim ${claim.id}: object_id ${claim.object_id} not found`)
    for (const sid of claim.source_ids || []) if (!sourceIds.has(sid)) refErrors.push(`claim ${claim.id}: source ${sid} not found`)
  }
  for (const edge of edges) {
    if (!entityIds.has(edge.from_id)) refErrors.push(`edge ${edge.id}: from_id ${edge.from_id} not found`)
    if (!entityIds.has(edge.to_id)) refErrors.push(`edge ${edge.id}: to_id ${edge.to_id} not found`)
  }

  const schemaErrorCount = Object.values(schemaResults).reduce((n, r) => n + r.errors.length, 0)
  return {
    ok: schemaErrorCount === 0 && refErrors.length === 0,
    schemaResults,
    refErrors,
    schemaErrorCount,
  }
}
