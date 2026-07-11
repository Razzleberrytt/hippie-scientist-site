#!/usr/bin/env node
// data:graph-report — high-level health report of the semantic graph. Writes a
// machine-readable JSON and prints a summary.

import path from 'node:path'
import { openDb, suggestSharedCompoundEdges } from './canonical/graph.mjs'
import { writeJson } from './canonical/jsonl.mjs'
import { generatedDir } from './canonical/paths.mjs'

function count(db, sql) {
  return db.prepare(sql).get().n
}

async function main() {
  const db = await openDb()
  try {
    const report = {
      entities: {
        total: count(db, 'SELECT COUNT(*) AS n FROM entities'),
        by_type: db.prepare('SELECT entity_type, COUNT(*) AS n FROM entities GROUP BY entity_type ORDER BY n DESC').all(),
      },
      edges: {
        total: count(db, 'SELECT COUNT(*) AS n FROM edges'),
        by_type: db.prepare('SELECT rel_type, COUNT(*) AS n FROM edges GROUP BY rel_type ORDER BY n DESC').all(),
      },
      claims: {
        total: count(db, 'SELECT COUNT(*) AS n FROM claims'),
        weak: count(db, 'SELECT COUNT(*) AS n FROM v_weak_claims'),
      },
      connectivity: {
        isolated: count(db, 'SELECT COUNT(*) AS n FROM v_isolated_entities'),
        top_connected: db.prepare('SELECT slug, entity_type, degree FROM v_highly_connected WHERE degree > 0 LIMIT 10').all(),
      },
      quality: {
        duplicate_candidates: count(db, 'SELECT COUNT(*) AS n FROM v_duplicate_candidates'),
        conflicting_claims: count(db, 'SELECT COUNT(*) AS n FROM v_conflicting_claims'),
        shared_safety_warnings: count(db, 'SELECT COUNT(*) AS n FROM v_shared_safety'),
      },
      suggested_edges: suggestSharedCompoundEdges(db, { threshold: 3 }).length,
    }

    writeJson(path.join(generatedDir, 'reports', 'graph-report.json'), report)

    console.log('Semantic graph report')
    console.log(`  entities: ${report.entities.total} (${report.entities.by_type.map((r) => `${r.entity_type}=${r.n}`).join(', ')})`)
    console.log(`  edges:    ${report.edges.total} (${report.edges.by_type.map((r) => `${r.rel_type}=${r.n}`).join(', ')})`)
    console.log(`  claims:   ${report.claims.total} (${report.claims.weak} weak/low-evidence)`)
    console.log(`  isolated entities:    ${report.connectivity.isolated}`)
    console.log(`  duplicate candidates: ${report.quality.duplicate_candidates}`)
    console.log(`  conflicting claims:   ${report.quality.conflicting_claims}`)
    console.log(`  shared safety warns:  ${report.quality.shared_safety_warnings}`)
    console.log(`  suggested edges:      ${report.suggested_edges}`)
    console.log('\nreport → data/generated/reports/graph-report.json')
  } finally {
    db.close()
  }
}

main().catch((error) => { console.error(error); process.exit(1) })
