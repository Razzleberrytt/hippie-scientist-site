#!/usr/bin/env node
// Standalone smoke check for the SQLite graph views (node:sqlite can't run under
// Vite/jsdom, so this runs directly via node in `npm run data:ci`).

import { DatabaseSync } from 'node:sqlite'
import { buildDatabase } from '../../build-sqlite.mjs'

const VIEWS = [
  'v_herb_compounds', 'v_entity_effects', 'v_herbs_sharing_compound', 'v_shared_mechanism',
  'v_entity_degree', 'v_isolated_entities', 'v_highly_connected', 'v_weak_claims',
  'v_shared_safety', 'v_conflicting_claims', 'v_duplicate_candidates', 'v_multi_effect_compounds',
]

function main() {
  const { dbPath } = buildDatabase()
  const db = new DatabaseSync(dbPath, { readOnly: true })
  let failures = 0
  for (const view of VIEWS) {
    try {
      const n = db.prepare(`SELECT COUNT(*) AS n FROM ${view}`).get().n
      if (!Number.isInteger(n)) { console.error(`✗ ${view}: non-integer count`); failures += 1 }
    } catch (error) {
      console.error(`✗ ${view}: ${error.message}`)
      failures += 1
    }
  }
  const herbCompounds = db.prepare('SELECT COUNT(*) AS n FROM v_herb_compounds').get().n
  if (herbCompounds <= 0) { console.error('✗ v_herb_compounds is empty'); failures += 1 }
  db.close()
  if (failures) { console.error(`✗ graph smoke failed: ${failures} issue(s)`); process.exit(1) }
  console.log(`✓ graph smoke passed (${VIEWS.length} views, v_herb_compounds=${herbCompounds})`)
}

main()
