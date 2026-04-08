#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const DATASETS = [
  'public/data/herbs.json',
  'public/data/compounds.json',
]

const JUNK_VALUES = new Set(['nan', 'null', 'undefined', 'n/a', 'none'])

function isJunkString(value) {
  return typeof value === 'string' && JUNK_VALUES.has(value.trim().toLowerCase())
}

function isNanString(value) {
  return typeof value === 'string' && value.trim().toLowerCase() === 'nan'
}

function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function deepCleanValue(value) {
  if (Array.isArray(value)) {
    const cleaned = []

    for (const item of value) {
      if (isNanString(item)) {
        continue
      }

      cleaned.push(deepCleanValue(item))
    }

    return cleaned
  }

  if (value && typeof value === 'object') {
    const cleanedObject = {}

    for (const [key, entry] of Object.entries(value)) {
      cleanedObject[key] = deepCleanValue(entry)
    }

    return cleanedObject
  }

  if (isJunkString(value)) {
    return null
  }

  return value
}

function readJson(filePath) {
  const absolutePath = path.join(ROOT, filePath)
  const raw = fs.readFileSync(absolutePath, 'utf8')
  const parsed = JSON.parse(raw)
  return Array.isArray(parsed) ? parsed : []
}

function writeJson(filePath, data) {
  const absolutePath = path.join(ROOT, filePath)
  fs.writeFileSync(absolutePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

function normalizeDataset(records) {
  const normalized = []
  let removed = 0
  let modified = 0

  for (const record of records) {
    const cleanedRecord = deepCleanValue(record)

    const cleanedName = typeof cleanedRecord?.name === 'string' ? cleanedRecord.name.trim() : ''
    if (!cleanedName) {
      removed += 1
      continue
    }

    const existingSlug = cleanedRecord?.slug
    if (typeof existingSlug !== 'string' || !existingSlug.trim() || isJunkString(existingSlug)) {
      cleanedRecord.slug = toSlug(cleanedName)
    }

    if (JSON.stringify(cleanedRecord) !== JSON.stringify(record)) {
      modified += 1
    }

    normalized.push(cleanedRecord)
  }

  return {
    normalized,
    scanned: records.length,
    removed,
    modified,
  }
}

let totalScanned = 0
let totalRemoved = 0
let totalModified = 0

for (const datasetPath of DATASETS) {
  const records = readJson(datasetPath)
  const result = normalizeDataset(records)

  writeJson(datasetPath, result.normalized)

  totalScanned += result.scanned
  totalRemoved += result.removed
  totalModified += result.modified

  console.log(`[strip-nan] ${datasetPath}`)
  console.log(`  records scanned: ${result.scanned}`)
  console.log(`  records modified: ${result.modified}`)
  console.log(`  records removed: ${result.removed}`)
}

console.log('[strip-nan] total')
console.log(`  records scanned: ${totalScanned}`)
console.log(`  records modified: ${totalModified}`)
console.log(`  records removed: ${totalRemoved}`)
