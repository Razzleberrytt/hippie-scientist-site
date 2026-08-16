#!/usr/bin/env node
/** Standalone compatibility wrapper for canonical citation-integrity analysis. */

import path from 'node:path'

import {
  analyzeCitationIntegrity,
  loadCitationProfiles,
  writeCitationIntegrityReport,
} from '../../lib/citation-integrity.mjs'

const ROOT = process.cwd()
const report = analyzeCitationIntegrity(loadCitationProfiles(ROOT))
const reportPath = writeCitationIntegrityReport(report, ROOT)

console.log('\nCitation identifiers')
console.log('='.repeat(66))
console.log(`Sources scanned        ${report.sources}`)
console.log(`Blocking problems      ${report.blocking.length}`)
console.log(`Duplicate profile refs ${report.duplicateProfileSources.length}`)
console.log(`Identifier pair issues ${report.identifierPairConflicts.length}`)
console.log(`Same id, two titles    ${report.conflicts.length}`)
for (const [field, count] of Object.entries(report.missingCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(count).padStart(5)}  missing ${field}`)
}
console.log(`\nReport: ${path.relative(ROOT, reportPath)}`)

if (report.passed) process.exit(0)

if (report.blocking.length) {
  console.error(`\n[citation-identifiers] FAILED — ${report.blocking.length} unusable identifier(s).\n`)
  for (const problem of report.blocking.slice(0, 20)) {
    console.error(`  ${problem.url} · ${problem.kind} · ${problem.value}`)
  }
}
if (report.duplicateProfileSources.length) {
  console.error(`\n[citation-identifiers] FAILED — ${report.duplicateProfileSources.length} duplicate source reference(s) within profiles.`)
  for (const duplicate of report.duplicateProfileSources.slice(0, 20)) {
    console.error(`  ${duplicate.url} · ${duplicate.identifiers.join(', ')} · ${duplicate.title}`)
  }
}
if (report.identifierPairConflicts.length) {
  console.error(`\n[citation-identifiers] FAILED — ${report.identifierPairConflicts.length} inconsistent PMID/DOI mapping(s).`)
  for (const conflict of report.identifierPairConflicts.slice(0, 20)) {
    console.error(`  ${conflict.kind} · ${conflict.identifier} · ${conflict.values.join(' <> ')}`)
  }
}
if (report.conflicts.length) {
  console.error(`\n[citation-identifiers] FAILED — ${report.conflicts.length} identifier(s) recorded under conflicting titles.`)
  for (const conflict of report.conflicts.slice(0, 20)) {
    console.error(`  ${conflict.identifier} · ${conflict.titles.join(' <> ')}`)
  }
}
process.exit(1)
