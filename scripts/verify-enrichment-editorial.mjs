#!/usr/bin/env node
import path from 'node:path'
import {
  EDITORIAL_READINESS_REPORT_PATH,
  INPUT_PATH_DEFAULT,
  buildEditorialReadinessReport,
  parseNormalizedInput,
  validateAndNormalizeEntries,
  writeJson,
} from './enrichment/normalize-enrichment-lib.mjs'

const ROOT = process.cwd()

function run() {
  const entries = parseNormalizedInput(INPUT_PATH_DEFAULT)
  const { normalizedEntries, issues, sourceById } = validateAndNormalizeEntries(entries, {
    runtimeSafetyOnly: true,
    includeNearDuplicateCheck: false,
    allowMissingEntityRefs: true,
  })

  if (issues.length > 0) {
    console.error(`[verify-enrichment-editorial] FAIL runtime safety issues=${issues.length}`)
    for (const issue of issues.slice(0, 50)) console.error(`- ${issue}`)
    if (issues.length > 50) console.error(`- ...and ${issues.length - 50} more`)
    process.exit(1)
  }

  const readiness = buildEditorialReadinessReport(normalizedEntries, sourceById)
  writeJson(EDITORIAL_READINESS_REPORT_PATH, readiness)

  console.log(
    `[verify-enrichment-editorial] PASS runtime-safe entries=${normalizedEntries.length}`,
  )
  console.log(`[verify-enrichment-editorial] report=${path.relative(ROOT, EDITORIAL_READINESS_REPORT_PATH)}`)
}

run()
