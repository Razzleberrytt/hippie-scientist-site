#!/usr/bin/env node
// data:canonical:validate — validate every canonical record against its Zod
// schema, plus cross-file referential-integrity checks. Exit non-zero on any
// error so CI can gate on it.

import { loadDataset } from './canonical/store.mjs'
import { validateDataset } from './canonical/validate.mjs'

function main() {
  const dataset = loadDataset()
  const { schemaResults, refErrors } = validateDataset(dataset)

  let errorCount = 0
  for (const [label, { valid, errors }] of Object.entries(schemaResults)) {
    console.log(`  ${label}: ${valid.length} valid, ${errors.length} invalid`)
    for (const error of errors.slice(0, 25)) {
      errorCount += 1
      const detail = error.issues.map((i) => `${i.path || '(root)'}: ${i.message}`).join('; ')
      console.error(`    ✗ ${error.id} — ${detail}`)
    }
    if (errors.length > 25) {
      console.error(`    …and ${errors.length - 25} more`)
      errorCount += errors.length - 25
    }
  }

  if (refErrors.length) {
    console.error(`  referential integrity: ${refErrors.length} issue(s)`)
    for (const err of refErrors.slice(0, 25)) console.error(`    ✗ ${err}`)
    if (refErrors.length > 25) console.error(`    …and ${refErrors.length - 25} more`)
  }

  const total = errorCount + refErrors.length
  if (total > 0) {
    console.error(`\n✗ canonical validation failed: ${total} issue(s)`)
    process.exit(1)
  }
  console.log('\n✓ canonical validation passed')
}

main()
