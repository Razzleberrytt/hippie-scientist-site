#!/usr/bin/env node
// data:rollback — restore canonical data from a snapshot (default: latest),
// rebuild the SQLite DB, and record an immutable audit entry.
//
// Usage: node scripts/data/rollback.mjs [--to <snapshot-name>|latest] [--list]

import { restoreSnapshot, listSnapshots } from './canonical/snapshot.mjs'
import { recordAudit } from './canonical/audit-log.mjs'
import { buildDatabase } from './build-sqlite.mjs'

function parseArgs(argv) {
  const args = { to: 'latest', list: false }
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i]
    if (a === '--list') args.list = true
    else if (a === '--to') { args.to = argv[i + 1]; i += 1 }
    else if (a.startsWith('--to=')) args.to = a.slice('--to='.length)
  }
  return args
}

function main() {
  const args = parseArgs(process.argv)
  const snapshots = listSnapshots()

  if (args.list || !snapshots.length) {
    console.log(snapshots.length ? 'available snapshots:' : 'no snapshots available')
    for (const s of snapshots) console.log(`  ${s}`)
    if (!snapshots.length) process.exit(args.list ? 0 : 1)
    if (args.list) return
  }

  try {
    const { restored } = restoreSnapshot(args.to)
    buildDatabase()
    recordAudit({ action: 'rollback', restored_snapshot: restored })
    console.log(`✓ rolled back to snapshot ${restored} and rebuilt SQLite`)
  } catch (error) {
    console.error(`✗ rollback failed: ${error.message}`)
    process.exit(1)
  }
}

main()
