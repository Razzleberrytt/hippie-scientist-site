#!/usr/bin/env node
import path from 'node:path'
import {
  INPUT_PATH_DEFAULT,
  parseNormalizedInput,
  rollupToResearchEnrichment,
  validateAndNormalizeEntries,
  writeJson,
} from './normalize-enrichment-lib.mjs'

const ROOT = process.cwd()
const OUTPUT_PATH = path.join(ROOT, 'public', 'data', 'enrichment-governed.json')

const entries = parseNormalizedInput(INPUT_PATH_DEFAULT)
const { normalizedEntries, issues, sourceById } = validateAndNormalizeEntries(entries, {
  includeNearDuplicateCheck: true,
})

if (issues.length > 0) {
  console.error(`[generate-governed-enrichment] FAIL (${issues.length} issues)`)
  for (const issue of issues.slice(0, 50)) console.error(`- ${issue}`)
  if (issues.length > 50) console.error(`- ...and ${issues.length - 50} more`)
  process.exit(1)
}

const rollup = rollupToResearchEnrichment(normalizedEntries, sourceById)
writeJson(OUTPUT_PATH, rollup)

const publishable = rollup.filter(row => row?.researchEnrichment?.editorialReadiness?.publishable === true)
console.log(
  `[generate-governed-enrichment] PASS entries=${normalizedEntries.length} entities=${rollup.length} publishable=${publishable.length} output=${path.relative(ROOT, OUTPUT_PATH)}`,
)
