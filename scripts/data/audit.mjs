#!/usr/bin/env node
// data:audit — print the immutable audit log and verify its hash chain.

import { readAudit } from './canonical/audit-log.mjs'
import { contentHash } from './canonical/ids.mjs'

function main() {
  const entries = readAudit()
  if (!entries.length) {
    console.log('audit log is empty')
    return
  }

  let prevHash = 'genesis'
  let broken = 0
  for (const entry of entries) {
    const expected = contentHash({ ...entry, _entry_hash: undefined })
    const chainOk = entry.prev_hash === prevHash && entry._entry_hash === expected
    if (!chainOk) broken += 1
    const summary = entry.action === 'apply'
      ? `apply: +${(entry.applied || []).length} applied, ${(entry.rejected || []).length} rejected (snapshot ${entry.snapshot})`
      : entry.action === 'rollback'
        ? `rollback → ${entry.restored_snapshot}`
        : entry.action
    console.log(`${chainOk ? '✓' : '✗'} ${entry.at}  ${summary}`)
    prevHash = entry._entry_hash
  }

  console.log(`\n${entries.length} entries; chain ${broken === 0 ? 'intact' : `BROKEN (${broken} bad)`} `)
  if (broken) process.exit(1)
}

main()
