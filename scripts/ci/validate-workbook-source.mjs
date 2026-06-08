#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  DEFAULT_WORKBOOK_RELATIVE_PATH,
  assertWorkbookExists,
  resolveWorkbookPath,
} from '../workbook-source.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')
const dataSourcesRoot = path.resolve(repoRoot, 'data-sources')

const allowExternalWorkbook = String(process.env.ALLOW_EXTERNAL_WORKBOOK_PATH || '')
  .trim()
  .toLowerCase() === 'true'

const resolvedWorkbookPath = resolveWorkbookPath(repoRoot)
assertWorkbookExists(resolvedWorkbookPath)

const normalizedWorkbookPath = path.resolve(resolvedWorkbookPath)
const extension = path.extname(normalizedWorkbookPath).toLowerCase()
if (extension !== '.xlsx') {
  throw new Error(
    `[validate-workbook-source] Workbook must be a .xlsx file. Received: ${normalizedWorkbookPath}`
  )
}

const stats = fs.statSync(normalizedWorkbookPath)
if (stats.size <= 0) {
  throw new Error(
    `[validate-workbook-source] Workbook file is empty (0 bytes): ${normalizedWorkbookPath}`
  )
}

const relativeToDataSources = path.relative(dataSourcesRoot, normalizedWorkbookPath)
const insideDataSources =
  relativeToDataSources &&
  !relativeToDataSources.startsWith('..') &&
  !path.isAbsolute(relativeToDataSources)

if (!insideDataSources && !allowExternalWorkbook) {
  throw new Error(
    '[validate-workbook-source] Workbook path must be inside repo/data-sources unless ALLOW_EXTERNAL_WORKBOOK_PATH=true is set.'
  )
}

const forbiddenCanonicalSources = [
  path.resolve(repoRoot, 'public/data/workbook-herbs.json'),
  path.resolve(repoRoot, 'public/data/workbook-compounds.json'),
]

if (forbiddenCanonicalSources.includes(normalizedWorkbookPath)) {
  throw new Error(
    '[validate-workbook-source] Generated public/data workbook artifacts cannot be used as the canonical source.'
  )
}

if (normalizedWorkbookPath === path.resolve(repoRoot, DEFAULT_WORKBOOK_RELATIVE_PATH)) {
  console.log(`[validate-workbook-source] PASS default workbook: ${normalizedWorkbookPath}`)
} else {
  console.log(`[validate-workbook-source] PASS workbook from HERB_XLSX_PATH: ${normalizedWorkbookPath}`)
}
console.log(`[validate-workbook-source] file size bytes: ${stats.size}`)
console.log(`[validate-workbook-source] external workbook allowed: ${allowExternalWorkbook}`)
