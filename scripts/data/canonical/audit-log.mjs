// Immutable audit log.
//
// Append-only JSONL. Every apply/rollback writes one entry. Entries are never
// mutated or deleted by the tooling.

import { appendJsonl, readJsonl } from './jsonl.mjs'
import { auditLogFile } from './paths.mjs'
import { contentHash } from './ids.mjs'

export function recordAudit(entry) {
  const record = {
    at: new Date().toISOString(),
    ...entry,
  }
  // Chain each entry to the previous one's hash for tamper-evidence.
  const previous = readAudit()
  const prevHash = previous.length ? previous[previous.length - 1]._entry_hash : 'genesis'
  record.prev_hash = prevHash
  record._entry_hash = contentHash({ ...record, _entry_hash: undefined })
  appendJsonl(auditLogFile, record)
  return record
}

export function readAudit() {
  return readJsonl(auditLogFile)
}
