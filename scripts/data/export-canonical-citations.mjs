#!/usr/bin/env node

import { exportCanonicalCitationsToRuntime } from './canonical/citation-export.mjs'

const dataDirArg = process.argv.find((arg) => arg.startsWith('--data-dir='))
const dataDir = dataDirArg ? dataDirArg.split('=').slice(1).join('=') : 'public/data'
const report = exportCanonicalCitationsToRuntime({ dataDir })

console.log(
  `[citation-export] profiles=${report.profilesWithCanonicalClaims} updated=${report.updated.length} missingDetail=${report.skippedMissingDetail.length}`,
)
for (const item of report.updated) {
  console.log(`[citation-export] ${item.entityType}:${item.slug} claims=${item.claimCount} sources=${item.sourceCount}`)
}
