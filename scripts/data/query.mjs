#!/usr/bin/env node
// data:query — run a named graph query or a read-only SQL SELECT against the
// generated SQLite database, with readable table output.
//
// Usage:
//   node scripts/data/query.mjs --list
//   node scripts/data/query.mjs herbs-with-compound --arg withanolide
//   node scripts/data/query.mjs --sql "SELECT entity_type, COUNT(*) FROM entities GROUP BY 1"

import { openDb, NAMED_QUERIES, isReadOnlySelect } from './canonical/graph.mjs'

function parseArgs(argv) {
  const args = { name: null, sql: null, list: false, params: [], limit: null }
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i]
    if (a === '--list') args.list = true
    else if (a === '--sql') { args.sql = argv[i + 1]; i += 1 }
    else if (a === '--arg') { args.params.push(argv[i + 1]); i += 1 }
    else if (a === '--limit') { args.limit = Number(argv[i + 1]); i += 1 }
    else if (!a.startsWith('--') && !args.name) args.name = a
  }
  return args
}

function printTable(rows) {
  if (!rows.length) { console.log('(no rows)'); return }
  const cols = Object.keys(rows[0])
  const widths = cols.map((c) => Math.max(c.length, ...rows.map((r) => String(r[c] ?? '').length)))
  const fmt = (vals) => vals.map((v, i) => String(v ?? '').padEnd(widths[i])).join('  ')
  console.log(fmt(cols))
  console.log(widths.map((w) => '-'.repeat(w)).join('  '))
  for (const r of rows) console.log(fmt(cols.map((c) => r[c])))
  console.log(`\n${rows.length} row(s)`)
}

async function main() {
  const args = parseArgs(process.argv)

  if (args.list || (!args.name && !args.sql)) {
    console.log('named queries:')
    for (const [name, q] of Object.entries(NAMED_QUERIES)) {
      console.log(`  ${name.padEnd(26)} ${q.description}${q.params.length ? ` (args: ${q.params.join(', ')})` : ''}`)
    }
    console.log('\nor: --sql "SELECT ..." (read-only)')
    return
  }

  const db = await openDb()
  try {
    let rows
    if (args.sql) {
      if (!isReadOnlySelect(args.sql)) {
        console.error('✗ only a single read-only SELECT/WITH statement is allowed')
        process.exit(2)
      }
      rows = db.prepare(args.sql).all()
    } else {
      const q = NAMED_QUERIES[args.name]
      if (!q) { console.error(`✗ unknown query: ${args.name} (use --list)`); process.exit(2) }
      if (q.params.length && args.params.length < q.params.length) {
        console.error(`✗ query ${args.name} needs args: ${q.params.join(', ')} (pass with --arg)`) ; process.exit(2)
      }
      rows = db.prepare(q.sql).all(...args.params.slice(0, q.params.length))
    }
    if (args.limit && rows.length > args.limit) rows = rows.slice(0, args.limit)
    printTable(rows)
  } finally {
    db.close()
  }
}

main().catch((error) => { console.error(error); process.exit(1) })
