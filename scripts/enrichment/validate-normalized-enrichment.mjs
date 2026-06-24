#!/usr/bin/env node
import path from 'node:path'
import { INPUT_PATH_DEFAULT, parseNormalizedInput, validateAndNormalizeEntries } from './normalize-enrichment-lib.mjs'

const inputArg = process.argv[2]
const inputPath = inputArg ? path.resolve(process.cwd(), inputArg) : INPUT_PATH_DEFAULT

const entries = parseNormalizedInput(inputPath)
const { normalizedEntries, issues } = validateAndNormalizeEntries(entries)

if (issues.length > 0) {
  console.error(`[validate-normalized-enrichment] FAIL (${issues.length} issues)`)
  for (const issue of issues.slice(0, 50)) console.error(`- ${issue}`)
  if (issues.length > 50) console.error(`- ...and ${issues.length - 50} more`)
  process.exit(1)
}

console.log(`[validate-normalized-enrichment] PASS entries=${normalizedEntries.length} input=${path.relative(process.cwd(), inputPath)}`)
