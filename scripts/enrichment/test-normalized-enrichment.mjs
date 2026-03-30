#!/usr/bin/env node
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import { validateAndNormalizeEntries } from './normalize-enrichment-lib.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const FIXTURE_PATH = path.join(ROOT, 'scripts', 'enrichment', 'fixtures', 'normalized-enrichment-validation.fixtures.json')
const fixture = JSON.parse(fs.readFileSync(FIXTURE_PATH, 'utf8'))

const failures = []

const validResult = validateAndNormalizeEntries(fixture.valid)
if (validResult.issues.length > 0) {
  failures.push({ kind: 'valid', reason: 'expected no issues for valid fixtures', issues: validResult.issues })
}

for (const invalidCase of fixture.invalid) {
  const entries = invalidCase.entries ?? [invalidCase.entry]
  const result = validateAndNormalizeEntries(entries)
  if (result.issues.length === 0) {
    failures.push({ kind: 'invalid', reason: invalidCase.reason, issues: [] })
  }
}

if (failures.length > 0) {
  console.error('[test-normalized-enrichment] FAIL')
  console.error(JSON.stringify(failures, null, 2))
  process.exit(1)
}

console.log('[test-normalized-enrichment] PASS')
console.log(
  JSON.stringify(
    {
      validCases: fixture.valid.length,
      invalidCases: fixture.invalid.length,
    },
    null,
    2,
  ),
)
