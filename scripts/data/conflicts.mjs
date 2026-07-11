#!/usr/bin/env node
// data:conflicts — report conflicting claims (contradictory dosage/safety/
// contraindication statements on the same subject) and duplicate entity
// candidates for human review.

import { openDb } from './canonical/graph.mjs'

async function main() {
  const db = await openDb()
  try {
    const conflicts = db.prepare('SELECT subject_id, predicate, object_a, object_b FROM v_conflicting_claims LIMIT 100').all()
    const dupes = db.prepare('SELECT canonical_name, entity_type, id_a, id_b FROM v_duplicate_candidates ORDER BY canonical_name').all()

    console.log(`Conflicting claims: ${conflicts.length}`)
    for (const c of conflicts.slice(0, 25)) {
      console.log(`  [${c.predicate}] ${c.subject_id}: "${c.object_a}" vs "${c.object_b}"`)
    }

    console.log(`\nDuplicate entity candidates: ${dupes.length}`)
    for (const d of dupes.slice(0, 25)) {
      console.log(`  [${d.entity_type}] "${d.canonical_name}" → ${d.id_a} / ${d.id_b}`)
    }

    const total = conflicts.length + dupes.length
    console.log(`\n${total} item(s) to review`)
  } finally {
    db.close()
  }
}

main().catch((error) => { console.error(error); process.exit(1) })
