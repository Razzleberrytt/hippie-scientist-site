// Canonical store loader/writer.
//
// Reads the whole canonical dataset off disk (all entity type files + claims +
// edges + sources) and provides deterministic writers. This is the single
// gateway the rest of the pipeline uses to touch canonical data.

import fs from 'node:fs'
import { readJsonl, writeJsonl } from './jsonl.mjs'
import {
  ENTITY_TYPES,
  entityFileFor,
  claimsFile,
  edgesFile,
  sourcesFile,
} from './paths.mjs'

export function loadEntities() {
  const entities = []
  for (const type of ENTITY_TYPES) {
    const file = entityFileFor(type)
    if (fs.existsSync(file)) entities.push(...readJsonl(file))
  }
  return entities
}

export function loadClaims() {
  return readJsonl(claimsFile)
}

export function loadEdges() {
  return readJsonl(edgesFile)
}

export function loadSources() {
  return readJsonl(sourcesFile)
}

export function loadDataset() {
  return {
    entities: loadEntities(),
    claims: loadClaims(),
    edges: loadEdges(),
    sources: loadSources(),
  }
}

// Partition entities by type into { type: records[] }. Every known type gets a
// bucket (possibly empty) so removals are reflected deterministically.
export function partitionEntities(entities) {
  const byType = new Map(ENTITY_TYPES.map((type) => [type, []]))
  for (const entity of entities) {
    const bucket = byType.get(entity.entity_type)
    if (!bucket) throw new Error(`Unknown entity_type: ${entity.entity_type} (${entity.id})`)
    bucket.push(entity)
  }
  return byType
}

// Write entities partitioned by type into their per-type files. `fileFor`
// resolves a type to a target path (defaults to canonical location).
export function writeEntities(entities, { fileFor = entityFileFor } = {}) {
  let total = 0
  for (const [type, records] of partitionEntities(entities)) {
    total += writeJsonl(fileFor(type), records)
  }
  return total
}

export function writeClaims(claims) {
  return writeJsonl(claimsFile, claims)
}

export function writeEdges(edges) {
  return writeJsonl(edgesFile, edges)
}

export function writeSources(sources) {
  return writeJsonl(sourcesFile, sources)
}
