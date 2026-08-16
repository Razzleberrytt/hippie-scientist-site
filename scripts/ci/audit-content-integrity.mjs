#!/usr/bin/env node
/** Reporting-only compatibility wrapper for reusable content-integrity analysis. */

import {
  analyzeContentIntegrity,
  printContentIntegrityReport,
  writeContentIntegrityReport,
} from '../../lib/content-integrity.mjs'

const ROOT = process.cwd()
const report = analyzeContentIntegrity(ROOT)
const output = writeContentIntegrityReport(report, ROOT)
printContentIntegrityReport(report, ROOT, output)
