#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'

const DATA_DIR_ARG = process.argv.find((arg) => arg.startsWith('--data-dir='))
const DATA_DIR = DATA_DIR_ARG
  ? DATA_DIR_ARG.split('=')[1]
  : 'public/data'

const SUMMARY_DIR = path.join(DATA_DIR, 'summary-indexes')

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
  'entityType',
]

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8')
  return JSON.parse(raw)
}

function asArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : []
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
      summary[field] = asArray(value).slice(0, 12)
      continue
    }

    if (typeof value === 'string') {
      summary[field] = value.slice(0, 600)
      continue
    }

    if (value != null) {
      summary[field] = value
    }
  }

  return summary
}

async function main() {
  const herbs = await readJson(path.join(DATA_DIR, 'herbs.json'))
  const compounds = await readJson(path.join(DATA_DIR, 'compounds.json'))

  await fs.mkdir(SUMMARY_DIR, { recursive: true })

  const herbSummaries = herbs.map((record) => summarizeRecord(record, 'herb'))
  const compoundSummaries = compounds.map((record) => summarizeRecord(record, 'compound'))

  const combined = [
    ...herbSummaries,
    ...compoundSummaries,
  ]

  const alphabetical = [...combined].sort((a, b) => {
    const nameA = String(a?.name || a?.slug || '').toLowerCase()
    const nameB = String(b?.name || b?.slug || '').toLowerCase()
    return nameA.localeCompare(nameB)
  })

  const byLetter = {}

  for (const item of alphabetical) {
    const letter = String(item?.name || item?.slug || '#')
      .charAt(0)
      .toLowerCase()

    if (!byLetter[letter]) {
      byLetter[letter] = []
    }

    byLetter[letter].push(item)
  }

  await Promise.all([
    fs.writeFile(
      path.join(SUMMARY_DIR, 'herbs-summary.json'),
      JSON.stringify(herbSummaries),
    ),
    fs.writeFile(
      path.join(SUMMARY_DIR, 'compounds-summary.json'),
      JSON.stringify(compoundSummaries),
    ),
    fs.writeFile(
      path.join(SUMMARY_DIR, 'search-index.json'),
      JSON.stringify(alphabetical),
    ),
    fs.writeFile(
      path.join(SUMMARY_DIR, 'alphabetical-shards.json'),
      JSON.stringify(byLetter),
    ),
  ])

  console.log(`Built runtime summary indexes for ${combined.length} records`) 
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
