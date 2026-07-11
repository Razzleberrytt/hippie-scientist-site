#!/usr/bin/env node
// data:export — export canonical data into site-shaped generated artifacts.
//
// Writes deterministic herbs.json / compounds.json (site record shape) plus a
// summary into data/generated/site/. Does NOT overwrite public/data — the site
// keeps using the workbook-generated data until the comparison report proves
// parity. Output is sorted by slug with stable keys and no wall-clock timestamps
// so files only change when the data changes.

import path from 'node:path'
import { writeJson, ensureDir } from './canonical/jsonl.mjs'
import { loadDataset } from './canonical/store.mjs'
import { exportSiteRecords } from './canonical/site-export.mjs'
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

  // Site-shaped exports.
  const siteDir = path.join(outDir, 'site')
  ensureDir(siteDir)
  const { herbs, compounds } = exportSiteRecords()
  writeJson(path.join(siteDir, 'herbs.json'), herbs)
  writeJson(path.join(siteDir, 'compounds.json'), compounds)
  summary.counts.site_herbs = herbs.length
  summary.counts.site_compounds = compounds.length
  writeJson(path.join(outDir, 'canonical-summary.json'), summary)

  return summary
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const summary = exportSampleSiteData()
  console.log('✓ exported canonical site data to data/generated/site/')
  console.log(`  entities=${summary.counts.entities} → site herbs=${summary.counts.site_herbs} compounds=${summary.counts.site_compounds}`)
}
