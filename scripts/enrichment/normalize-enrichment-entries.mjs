#!/usr/bin/env node
import path from 'node:path'
import {
  INPUT_PATH_DEFAULT,
  SUMMARY_REPORT_PATH,
  buildSummary,
  parseNormalizedInput,
  rollupToResearchEnrichment,
  validateAndNormalizeEntries,
  writeJson,
} from './normalize-enrichment-lib.mjs'

const inputArg = process.argv[2]
const inputPath = inputArg ? path.resolve(process.cwd(), inputArg) : INPUT_PATH_DEFAULT

const entries = parseNormalizedInput(inputPath)
const { normalizedEntries, issues } = validateAndNormalizeEntries(entries)
if (issues.length > 0) {
  console.error(`[normalize-enrichment-entries] FAIL (${issues.length} issues)`)
  for (const issue of issues.slice(0, 50)) console.error(`- ${issue}`)
  if (issues.length > 50) console.error(`- ...and ${issues.length - 50} more`)
  process.exit(1)
}

const rollup = rollupToResearchEnrichment(normalizedEntries)
const summary = buildSummary(normalizedEntries)
summary.rollupEntityCount = rollup.length

const rollupPath = path.join(process.cwd(), 'ops', 'reports', 'enrichment-rollup-preview.json')
writeJson(SUMMARY_REPORT_PATH, summary)
writeJson(rollupPath, rollup)

console.log(
  `[normalize-enrichment-entries] PASS entries=${normalizedEntries.length} rollup_entities=${rollup.length} summary=${path.relative(process.cwd(), SUMMARY_REPORT_PATH)}`,
)
