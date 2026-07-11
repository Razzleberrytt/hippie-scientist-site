#!/usr/bin/env node

import { exportCanonicalCitationsToRuntime } from './canonical/citation-export.mjs'

const dataDirArg = process.argv.find((arg) => arg.startsWith('--data-dir='))
const slugArg = process.argv.find((arg) => arg.startsWith('--slug='))
const dataDir = dataDirArg ? dataDirArg.split('=').slice(1).join('=') : 'public/data'
const slug = slugArg ? slugArg.split('=').slice(1).join('=').trim() : ''
const report = exportCanonicalCitationsToRuntime({
  dataDir,
  slugs: slug ? [slug] : null,
})

console.log(
  `[citation-export] profiles=${report.profilesWithCanonicalClaims} updated=${report.updated.length} missingDetail=${report.skippedMissingDetail.length} noOverlay=${report.skippedNoOverlay.length}`,
)
for (const item of report.updated) {
  console.log(`[citation-export] ${item.entityType}:${item.slug} claims=${item.claimCount} sources=${item.sourceCount}`)
}
for (const skipped of report.skippedNoOverlay) {
  console.log(`[citation-export] skipped ${skipped}: no canonical citation overlay`)
}
