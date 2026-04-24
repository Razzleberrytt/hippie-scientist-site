#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')

const PLACEHOLDER_VALUES = new Set(['unknown', 'nan', 'null', 'undefined', '[object object]'])

function normalize(value) {
  if (value === null || value === undefined) return ''
  if (typeof value === 'number' && Number.isNaN(value)) return 'nan'
  return String(value).trim()
}

function isPlaceholder(value) {
  const normalized = normalize(value).toLowerCase()
  return PLACEHOLDER_VALUES.has(normalized)
}

function parseArgs(argv) {
  const args = argv.slice(2)
  let dataDir = path.join('public', 'data-next')

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    if (arg === '--data-dir') {
      dataDir = args[index + 1] || ''
      index += 1
      continue
    }

    if (arg.startsWith('--data-dir=')) {
      dataDir = arg.slice('--data-dir='.length)
    }
  }

  const normalized = String(dataDir || '').trim()
  if (!normalized) {
    throw new Error('[data-next-validate] Missing value for --data-dir')
  }

  return path.resolve(repoRoot, normalized)
}

function readDataset(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8')
  const parsed = JSON.parse(raw)
  if (!Array.isArray(parsed)) {
    throw new Error(`[data-next-validate] Dataset must be an array: ${path.relative(repoRoot, filePath)}`)
  }
  return parsed
}

function pushError(errors, dataset, index, slug, field, value, reason) {
  errors.push({ dataset, index, slug: normalize(slug), field, value: normalize(value), reason })
}

function validateDataset(datasetName, records, kind, errors) {
  const slugIndexByValue = new Map()

  for (let index = 0; index < records.length; index += 1) {
    const record = records[index] || {}
    const name = normalize(record.name)
    const slug = normalize(record.slug)

    if (!name) {
      pushError(errors, datasetName, index, slug, 'name', name, 'missing name')
    }

    if (!slug) {
      pushError(errors, datasetName, index, slug, 'slug', slug, 'missing slug')
    }

    if (name && isPlaceholder(name)) {
      pushError(errors, datasetName, index, slug, 'name', name, 'placeholder value')
    }

    if (slug && isPlaceholder(slug)) {
      pushError(errors, datasetName, index, slug, 'slug', slug, 'placeholder value')
    }

    if (kind === 'compound') {
      if (/^\d+$/.test(name)) {
        pushError(errors, datasetName, index, slug, 'name', name, 'compound name cannot be numeric-only')
      }
      if (/^\d+$/.test(slug)) {
        pushError(errors, datasetName, index, slug, 'slug', slug, 'compound slug cannot be numeric-only')
      }
      if (name.length === 1) {
        pushError(errors, datasetName, index, slug, 'name', name, 'compound name cannot be one character')
      }
      if (slug.length === 1) {
        pushError(errors, datasetName, index, slug, 'slug', slug, 'compound slug cannot be one character')
      }
    }

    if (kind === 'herb') {
      if (name.length === 1) {
        pushError(errors, datasetName, index, slug, 'name', name, 'herb name cannot be one character')
      }
      if (slug.length === 1) {
        pushError(errors, datasetName, index, slug, 'slug', slug, 'herb slug cannot be one character')
      }
    }

    if (slug) {
      const existingIndexes = slugIndexByValue.get(slug) || []
      existingIndexes.push(index)
      slugIndexByValue.set(slug, existingIndexes)
    }
  }

  for (const [slug, indexes] of slugIndexByValue.entries()) {
    if (indexes.length <= 1) continue
    for (const index of indexes) {
      pushError(errors, datasetName, index, slug, 'slug', slug, `duplicate slug appears ${indexes.length} times`)
    }
  }
}

function printErrors(errors) {
  for (const err of errors) {
    console.error(`${err.dataset} | ${err.index} | ${err.slug} | ${err.field} | ${err.value} | ${err.reason}`)
  }
}

function run() {
  const dataDir = parseArgs(process.argv)
  const herbs = readDataset(path.join(dataDir, 'herbs.json'))
  const compounds = readDataset(path.join(dataDir, 'compounds.json'))

  const errors = []
  validateDataset('herbs', herbs, 'herb', errors)
  validateDataset('compounds', compounds, 'compound', errors)

  if (errors.length > 0) {
    printErrors(errors)
    console.error(`[data-next-validate] blocking structural issues: ${errors.length}`)
    process.exit(1)
  }

  console.log(`[data-next-validate] PASS herbs+compounds structural validation (${path.relative(repoRoot, dataDir)})`)
}

run()
