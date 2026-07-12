#!/usr/bin/env node
// data:gaps — report data gaps: entities missing relationships, weak claims,
// and suggested (inferred, review-required) edges that could fill gaps.

import path from 'node:path'
import { openDb, suggestSharedCompoundEdges } from './canonical/graph.mjs'
import { writeJson } from './canonical/jsonl.mjs'
import { generatedDir } from './canonical/paths.mjs'

async function main() {
  const db = await openDb()
  try {
    const isolatedByType = db.prepare('SELECT entity_type, COUNT(*) AS n FROM v_isolated_entities GROUP BY entity_type ORDER BY n DESC').all()
    const weakByPredicate = db.prepare('SELECT predicate, COUNT(*) AS n FROM v_weak_claims GROUP BY predicate ORDER BY n DESC').all()
    const herbsNoCompounds = db.prepare(`
      SELECT e.slug FROM entities e
      WHERE e.entity_type = 'herb'
        AND NOT EXISTS (SELECT 1 FROM edges WHERE from_id = e.id AND rel_type = 'contains_compound')
      ORDER BY e.slug
    `).all().map((r) => r.slug)
    const suggested = suggestSharedCompoundEdges(db, { threshold: 3 })

    const report = {
      isolated_by_type: isolatedByType,
      weak_claims_by_predicate: weakByPredicate,
      herbs_without_compounds: { count: herbsNoCompounds.length, sample: herbsNoCompounds.slice(0, 30) },
      suggested_edges: { count: suggested.length, note: 'INFERRED — require review before promotion', sample: suggested.slice(0, 20) },
    }
    writeJson(path.join(generatedDir, 'reports', 'gaps-report.json'), report)

    console.log('Data gaps')
    console.log(`  isolated entities: ${isolatedByType.map((r) => `${r.entity_type}=${r.n}`).join(', ')}`)
    console.log(`  weak claims: ${weakByPredicate.map((r) => `${r.predicate}=${r.n}`).join(', ')}`)
    console.log(`  herbs without any compound edge: ${herbsNoCompounds.length}`)
    console.log(`  suggested (inferred) edges: ${suggested.length}`)
    for (const s of suggested.slice(0, 8)) console.log(`    ~ ${s.explanation}`)
    console.log('\nreport → data/generated/reports/gaps-report.json')
  } finally {
    db.close()
  }
}

main().catch((error) => { console.error(error); process.exit(1) })
