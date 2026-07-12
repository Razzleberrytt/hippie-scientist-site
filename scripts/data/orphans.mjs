#!/usr/bin/env node
// data:orphans — list entities with no relationships (isolated nodes), grouped
// by type, so they can be connected or reviewed.

import { openDb } from './canonical/graph.mjs'

async function main() {
  const db = await openDb()
  try {
    const byType = db.prepare('SELECT entity_type, COUNT(*) AS n FROM v_isolated_entities GROUP BY entity_type ORDER BY n DESC').all()
    console.log('Orphan (isolated) entities by type:')
    for (const r of byType) console.log(`  ${r.entity_type.padEnd(18)} ${r.n}`)
    const sample = db.prepare("SELECT entity_type, slug FROM v_isolated_entities WHERE entity_type IN ('herb','compound') ORDER BY entity_type, slug LIMIT 40").all()
    if (sample.length) {
      console.log('\nsample herb/compound orphans:')
      for (const r of sample) console.log(`  [${r.entity_type}] ${r.slug}`)
    }
    const total = byType.reduce((n, r) => n + r.n, 0)
    console.log(`\n${total} isolated entities total`)
  } finally {
    db.close()
  }
}

main().catch((error) => { console.error(error); process.exit(1) })
