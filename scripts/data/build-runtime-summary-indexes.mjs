#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'

const DATA_DIR_ARG = process.argv.find((arg) => arg.startsWith('--data-dir='))
const DATA_DIR = DATA_DIR_ARG
  ? DATA_DIR_ARG.split('=')[1]
  : 'public/data'

const SUMMARY_DIR = path.join(DATA_DIR, 'summary-indexes')
const MAX_ARRAY_VALUES = 12
const MAX_TEXT_LENGTH = 600
const MAX_INDEX_RECORDS = 10000

const SUMMARY_FIELDS = [
  'slug',
  'name',
  'aliases',
  'summary',
  'primary_effects',
  'effects',
  'mechanisms',
  'pathways',
  'evidence_tier',
  'safety_level',
  'safety_rating',
  'runtime_export_decision',
  'profile_status',
  'summary_quality',
  'entityType',
]

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8')
  const parsed = JSON.parse(raw)

  return Array.isArray(parsed) ? parsed : []
}

function text(value) {
  return String(value ?? '').trim()
}

function asArray(value) {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .flatMap((item) => Array.isArray(item) ? item : [item])
    .map((item) => text(item))
    .filter(Boolean)
    .slice(0, MAX_ARRAY_VALUES)
}

function summarizeRecord(record, entityType) {
  const summary = {}

  for (const field of SUMMARY_FIELDS) {
    if (field === 'entityType') {
      summary.entityType = entityType
      continue
    }

    const value = record?.[field]

    if (Array.isArray(value)) {
      const values = asArray(value)
      if (values.length > 0) summary[field] = values
      continue
    }

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      const normalized = text(value).slice(0, MAX_TEXT_LENGTH)
      if (normalized) summary[field] = normalized
      continue
    }
  }

  return summary
}

function sortByName(a, b) {
  const nameA = text(a?.name || a?.slug).toLowerCase()
  const nameB = text(b?.name || b?.slug).toLowerCase()

  return nameA.localeCompare(nameB)
}

async function writeJson(fileName, value) {
  await fs.writeFile(
    path.join(SUMMARY_DIR, fileName),
    `${JSON.stringify(value)}\n`,
    'utf8',
  )
}

async function main() {
  const herbs = await readJson(path.join(DATA_DIR, 'herbs.json'))
  const compounds = await readJson(path.join(DATA_DIR, 'compounds.json'))

  await fs.mkdir(SUMMARY_DIR, { recursive: true })

  const herbSummaries = herbs
    .slice(0, MAX_INDEX_RECORDS)
    .map((record) => summarizeRecord(record, 'herb'))
    .filter((record) => record.slug || record.name)

  const compoundSummaries = compounds
    .slice(0, MAX_INDEX_RECORDS)
    .map((record) => summarizeRecord(record, 'compound'))
    .filter((record) => record.slug || record.name)

  const combined = [
    ...herbSummaries,
    ...compoundSummaries,
  ]

  const alphabetical = [...combined].sort(sortByName)

  const byLetter = {}

  for (const item of alphabetical) {
    const letter = text(item?.name || item?.slug || '#')
      .charAt(0)
      .toLowerCase() || '#'

    if (!byLetter[letter]) {
      byLetter[letter] = []
    }

    byLetter[letter].push(item)
  }

  await Promise.all([
    writeJson('herbs-summary.json', herbSummaries),
    writeJson('compounds-summary.json', compoundSummaries),
    writeJson('search-index.json', alphabetical),
    writeJson('alphabetical-shards.json', byLetter),
  ])

  console.log(`Built runtime summary indexes for ${combined.length} records`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
