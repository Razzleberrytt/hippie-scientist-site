#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')

const DATASETS = [
  { kind: 'herb', label: 'herbs', file: 'public/data/herbs.json' },
  { kind: 'compound', label: 'compounds', file: 'public/data/compounds.json' },
  { kind: 'herb-summary', label: 'herb summaries', file: 'public/data/summary-indexes/herbs-summary.json' },
  { kind: 'compound-summary', label: 'compound summaries', file: 'public/data/summary-indexes/compounds-summary.json' },
]

const VALID_STATUSES = new Set(['PUBLISH', 'NOINDEX', 'NEEDS_REVIEW', 'BLOCKED'])
const VALID_ROBOTS = new Set(['index,follow', 'noindex,follow', 'noindex,nofollow'])
const MAX_ERRORS_TO_PRINT = 25

function readJson(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath)
  return JSON.parse(fs.readFileSync(absolutePath, 'utf8'))
}

function recordLabel(record, index) {
  return String(record?.slug || record?.name || `record-${index + 1}`)
}

function countStatuses(records) {
  const counts = Object.fromEntries([...VALID_STATUSES].map((status) => [status, 0]))

  for (const record of records) {
    const status = record?.indexability_status
    if (VALID_STATUSES.has(status)) {
      counts[status] += 1
    }
  }

  return counts
}

function addError(errors, kind, record, index, reason) {
  errors.push({
    kind,
    id: recordLabel(record, index),
    reason,
  })
}

function validateRecord(record, kind, index, errors) {
  const status = record?.indexability_status
  const score = record?.indexability_score
  const reasons = record?.indexability_reasons
  const robots = record?.robots
  const sitemapIncluded = record?.sitemap_included

  if (!record?.slug && !record?.name) {
    addError(errors, kind, record, index, 'missing slug or name')
  }

  if (!VALID_STATUSES.has(status)) {
    addError(errors, kind, record, index, `invalid indexability_status: ${String(status)}`)
  }

  if (typeof score !== 'number' || !Number.isFinite(score)) {
    addError(errors, kind, record, index, `invalid indexability_score: ${String(score)}`)
  }

  if (!Array.isArray(reasons)) {
    addError(errors, kind, record, index, 'indexability_reasons must be an array')
  }

  if (!VALID_ROBOTS.has(robots)) {
    addError(errors, kind, record, index, `invalid robots: ${String(robots)}`)
  }

  if (typeof sitemapIncluded !== 'boolean') {
    addError(errors, kind, record, index, `sitemap_included must be boolean: ${String(sitemapIncluded)}`)
  }

  if (status === 'PUBLISH') {
    if (robots !== 'index,follow') {
      addError(errors, kind, record, index, 'PUBLISH should have robots index,follow')
    }
    if (sitemapIncluded !== true) {
      addError(errors, kind, record, index, 'PUBLISH should have sitemap_included true')
    }
  }

  if (status === 'NOINDEX') {
    if (!/^noindex/.test(String(robots))) {
      addError(errors, kind, record, index, 'NOINDEX should have noindex robots')
    }
    if (sitemapIncluded !== false) {
      addError(errors, kind, record, index, 'NOINDEX should have sitemap_included false')
    }
  }

  if (status === 'NEEDS_REVIEW' && sitemapIncluded === true) {
    addError(errors, kind, record, index, 'NEEDS_REVIEW should not be sitemap_included true without explicit policy')
  }

  if (status === 'BLOCKED') {
    if (!/^noindex/.test(String(robots))) {
      addError(errors, kind, record, index, 'BLOCKED must have noindex robots')
    }
    if (sitemapIncluded !== false) {
      addError(errors, kind, record, index, 'BLOCKED must have sitemap_included false')
    }
  }
}

function printStatusCounts(label, counts) {
  console.log(`${label} by status:`)
  for (const status of VALID_STATUSES) {
    console.log(`  ${status}: ${counts[status]}`)
  }
}

function main() {
  const allErrors = []
  const datasets = DATASETS.map((dataset) => ({
    ...dataset,
    records: readJson(dataset.file),
  }))

  for (const dataset of datasets) {
    if (!Array.isArray(dataset.records)) {
      allErrors.push({
        kind: dataset.kind,
        id: dataset.file,
        reason: 'dataset must be a JSON array',
      })
      dataset.records = []
      continue
    }

    dataset.records.forEach((record, index) => {
      validateRecord(record, dataset.kind, index, allErrors)
    })
  }

  const herbs = datasets.find((dataset) => dataset.label === 'herbs')?.records || []
  const compounds = datasets.find((dataset) => dataset.label === 'compounds')?.records || []

  console.log('Indexability metadata validation')
  console.log(`Total herbs checked: ${herbs.length}`)
  console.log(`Total compounds checked: ${compounds.length}`)
  printStatusCounts('Herbs', countStatuses(herbs))
  printStatusCounts('Compounds', countStatuses(compounds))
  console.log(`Validation errors: ${allErrors.length}`)

  if (allErrors.length > 0) {
    console.log(`First ${Math.min(MAX_ERRORS_TO_PRINT, allErrors.length)} errors:`)
    for (const error of allErrors.slice(0, MAX_ERRORS_TO_PRINT)) {
      console.log(`  ${error.kind}:${error.id} - ${error.reason}`)
    }
  }

  process.exit(allErrors.length > 0 ? 1 : 0)
}

main()
