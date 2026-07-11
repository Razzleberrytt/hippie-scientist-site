#!/usr/bin/env node
// data:export — export canonical data into generated artifacts.
//
// In this foundation pass the adapter simply emits sample/summary JSON into
// data/generated/ so the pipeline is exercised end-to-end. Phase 6 extends this
// into the full site-data adapter that reproduces the exact public/data shapes.

import path from 'node:path'
import { loadDataset } from './canonical/store.mjs'
import { writeJson, ensureDir } from './canonical/jsonl.mjs'
import { generatedDir } from './canonical/paths.mjs'

export function exportSampleSiteData({ outDir = generatedDir } = {}) {
  ensureDir(outDir)
  const { entities, claims, edges, sources } = loadDataset()

  const byType = {}
  for (const e of entities) byType[e.entity_type] = (byType[e.entity_type] || 0) + 1

  const summary = {
    generated_at_note: 'deterministic — no wall-clock timestamp is emitted',
    counts: {
      entities: entities.length,
      by_type: byType,
      claims: claims.length,
      edges: edges.length,
      sources: sources.length,
    },
  }
  writeJson(path.join(outDir, 'canonical-summary.json'), summary)

  // Deterministic sample of entities (first 10 by id) for smoke inspection.
  const sample = [...entities]
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    .slice(0, 10)
    .map((e) => ({ id: e.id, entity_type: e.entity_type, slug: e.slug, canonical_name: e.canonical_name }))
  writeJson(path.join(outDir, 'canonical-sample.json'), { sample })

  return summary
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const summary = exportSampleSiteData()
  console.log('✓ exported canonical sample/summary to data/generated/')
  console.log(`  entities=${summary.counts.entities} claims=${summary.counts.claims} edges=${summary.counts.edges} sources=${summary.counts.sources}`)
}
