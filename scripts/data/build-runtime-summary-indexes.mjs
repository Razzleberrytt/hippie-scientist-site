#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'
import {
  createStageTimer,
  printBuildTimingReport,
} from '../ci/report-build-stage-timings.mjs'

const DATA_DIR_ARG = process.argv.find((arg) => arg.startsWith('--data-dir='))
const DATA_DIR = DATA_DIR_ARG
  ? DATA_DIR_ARG.split('=')[1]
  : 'public/data'

const SUMMARY_DIR = path.join(DATA_DIR, 'summary-indexes')
await fs.mkdir(SUMMARY_DIR, { recursive: true })
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
  'robots',
  'sitemap_included',
  'indexability_status',
  'indexability_score',
  'indexability_reasons',
  'entityType',
  'meta_title',
  'meta_description',
  'generated_description',
]

async function readJson(filePath) {
  const timer = createStageTimer(`read:${path.basename(filePath)}`)

  const raw = await fs.readFile(filePath, 'utf8')
  const parsed = JSON.parse(raw)

  timer.finish()

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

function generateHerbDescription(record) {
  const name = record.name || record.slug || 'This botanical'
  const primaryEffects = record.primary_effects || record.effects || []
  const effectsStr = primaryEffects.length > 0 ? `supporting ${primaryEffects.slice(0, 3).join(', ')}` : 'with traditional health applications'
  const mechanisms = record.canonical_mechanisms || record.mechanisms || []
  const mechStr = mechanisms.length > 0 ? ` via ${mechanisms.slice(0, 2).join(' and ')} pathways` : ''
  const safety = record.safety_level || record.safety_rating || 'cautious use'
  return `${name} profile: An evidence-informed overview ${effectsStr}${mechStr}. Review safety levels, typical dosage, and clinical evidence.`
}

function summarizeRecord(record, entityType) {
  const summary = {}

  for (const field of SUMMARY_FIELDS) {
    if (field === 'entityType') {
      summary.entityType = entityType
      continue
    }

    if (field === 'generated_description') {
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

  if (entityType === 'herb') {
    const hasDesc = text(record.summary || record.description).length > 0
    if (!hasDesc) {
      summary.generated_description = generateHerbDescription(record)
    } else {
      summary.generated_description = text(record.summary || record.description)
    }
  }

  return summary
}

function sortByName(a, b) {
  const nameA = text(a?.name || a?.slug).toLowerCase()
  const nameB = text(b?.name || b?.slug).toLowerCase()

  return nameA.localeCompare(nameB)
}

function stableClone(value) {
  if (Array.isArray(value)) {
    return value.map(stableClone)
  }

  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort((a, b) => a.localeCompare(b))
      .reduce((acc, key) => {
        acc[key] = stableClone(value[key])
        return acc
      }, {})
  }

  return value
}

async function writeJson(fileName, value) {
  const timer = createStageTimer(`write:${fileName}`)

  await fs.writeFile(
    path.join(SUMMARY_DIR, fileName),
    `${JSON.stringify(stableClone(value))}\n`,
    'utf8',
  )

  timer.finish({
    records: Array.isArray(value)
      ? value.length
      : Object.keys(value || {}).length,
  })
}

function buildAlphabeticalShards(records) {
  const byLetter = {}

  for (const item of records) {
    const letter = text(item?.name || item?.slug || '#')
      .charAt(0)
      .toLowerCase() || '#'

    if (!byLetter[letter]) {
      byLetter[letter] = []
    }

    byLetter[letter].push(item)
  }

  return byLetter
}

function buildEntityShards(records) {
  const shards = {
    herbs: [],
    compounds: [],
  }

  for (const item of records) {
    if (item?.entityType === 'herb') {
      shards.herbs.push(item)
      continue
    }

    if (item?.entityType === 'compound') {
      shards.compounds.push(item)
    }
  }

  return shards
}

function buildAlphaEntityShards(records) {
  const shards = {}

  for (const item of records) {
    const entityType = text(item?.entityType || 'unknown').toLowerCase()
    const letter = text(item?.name || item?.slug || '#')
      .charAt(0)
      .toLowerCase() || '#'

    const shardKey = `${entityType}-${letter}`

    if (!shards[shardKey]) {
      shards[shardKey] = []
    }

    shards[shardKey].push(item)
  }

  return shards
}

async function main() {
  const totalTimer = createStageTimer('summary-index-build')

  const herbs = await readJson(path.join(DATA_DIR, 'herbs.json'))
  const compounds = await readJson(path.join(DATA_DIR, 'compounds.json'))

  const summarizeTimer = createStageTimer('summarize-records')

  const herbSummaries = herbs
    .slice(0, MAX_INDEX_RECORDS)
    .map((record) => summarizeRecord(record, 'herb'))
    .filter((record) => record.slug || record.name)

  const compoundSummaries = compounds
    .slice(0, MAX_INDEX_RECORDS)
    .map((record) => summarizeRecord(record, 'compound'))
    .filter((record) => record.slug || record.name)

  summarizeTimer.finish({
    herbs: herbSummaries.length,
    compounds: compoundSummaries.length,
  })

  const combined = [
    ...herbSummaries,
    ...compoundSummaries,
  ]

  const alphabeticalTimer = createStageTimer('alphabetical-sort')

  const alphabetical = [...combined].sort(sortByName)

  alphabeticalTimer.finish({
    total: alphabetical.length,
  })

  const shardTimer = createStageTimer('search-index-sharding')

  const alphabeticalShards = buildAlphabeticalShards(alphabetical)
  const entityShards = buildEntityShards(alphabetical)
  const alphaEntityShards = buildAlphaEntityShards(alphabetical)

  shardTimer.finish({
    alphabeticalShards: Object.keys(alphabeticalShards).length,
    entityShards: Object.keys(entityShards).length,
    alphaEntityShards: Object.keys(alphaEntityShards).length,
  })

  await Promise.all([
    writeJson('herbs-summary.json', herbSummaries),
    writeJson('compounds-summary.json', compoundSummaries),
    writeJson('search-index.json', alphabetical),
    writeJson('alphabetical-shards.json', alphabeticalShards),
    writeJson('entity-shards.json', entityShards),
    writeJson('alpha-entity-shards.json', alphaEntityShards),
  ])

  totalTimer.finish({
    total: combined.length,
  })

  console.log(`Built runtime summary indexes for ${combined.length} records`)

  printBuildTimingReport()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
