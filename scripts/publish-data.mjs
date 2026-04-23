#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const INPUT_DIR = path.join(ROOT, 'ops', 'publish-input')
const OUTPUT_DIR = path.join(ROOT, 'public', 'data')

const INPUT_FILES = {
  herbs: 'API_PAYLOAD.json',
  compounds: 'COMPOUND_API_PAYLOAD.json',
  goals: 'Goal Page Copy.json',
}

const ROUTE_KEY_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function readJsonArray(filePath, label) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`[publish-data] Missing input file for ${label}: ${path.relative(ROOT, filePath)}`)
  }

  const raw = fs.readFileSync(filePath, 'utf8')
  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch (error) {
    throw new Error(`[publish-data] Invalid JSON in ${path.relative(ROOT, filePath)}: ${error.message}`)
  }

  if (!Array.isArray(parsed)) {
    throw new Error(`[publish-data] Expected array in ${path.relative(ROOT, filePath)}`)
  }

  return parsed
}

function asText(value) {
  return String(value ?? '').trim()
}

function getFirst(row, keys) {
  for (const key of keys) {
    const value = asText(row?.[key])
    if (value) return value
  }
  return ''
}

function splitList(value) {
  if (Array.isArray(value)) {
    return value.map(asText).filter(Boolean)
  }
  const text = asText(value)
  if (!text) return []
  return text
    .split(/[;|,]/)
    .map(entry => entry.trim())
    .filter(Boolean)
}

function normalizeSlug(raw) {
  return asText(raw).toLowerCase()
}

function assertUniqueSlugs(records, label) {
  const seen = new Set()
  for (const record of records) {
    const slug = record.slug
    if (!slug) {
      throw new Error(`[publish-data] ${label}: blank slug for entry ${JSON.stringify(record)}`)
    }
    if (seen.has(slug)) {
      throw new Error(`[publish-data] ${label}: duplicate slug "${slug}"`)
    }
    seen.add(slug)
  }
}

function normalizeHerbRow(row, index) {
  const slug = normalizeSlug(getFirst(row, ['slug']))
  const name = getFirst(row, ['name'])

  if (!slug) throw new Error(`[publish-data] herbs row ${index + 1}: blank slug`)
  if (!name) throw new Error(`[publish-data] herbs row ${index + 1}: blank required name`)

  const output = {
    slug,
    name,
    scientificName: getFirst(row, ['scientificName', 'scientific_name', 'latin', 'latinName']),
    summary: getFirst(row, ['summary']),
    description: getFirst(row, ['description']),
    primaryActions: splitList(row.primaryActions),
    mechanisms: splitList(row.mechanisms),
    activeCompounds: splitList(row.activeCompounds),
    safetyNotes: getFirst(row, ['safetyNotes']),
    contraindications: splitList(row.contraindications),
    interactions: splitList(row.interactions),
    traditionalUses: splitList(row.traditionalUses),
    evidenceLevel: getFirst(row, ['evidenceLevel']),
    region: getFirst(row, ['region']),
  }

  return Object.fromEntries(
    Object.entries(output).filter(([, value]) => {
      if (Array.isArray(value)) return value.length > 0
      return asText(value).length > 0
    }),
  )
}

function normalizeCompoundRow(row, index) {
  const slug = normalizeSlug(getFirst(row, ['slug']))
  const name = getFirst(row, ['name'])

  if (!slug) throw new Error(`[publish-data] compounds row ${index + 1}: blank slug`)
  if (!name) throw new Error(`[publish-data] compounds row ${index + 1}: blank required name`)

  const output = {
    slug,
    name,
    summary: getFirst(row, ['summary']),
    description: getFirst(row, ['description']),
    compoundClass: getFirst(row, ['compoundClass', 'compound_class']),
    mechanisms: splitList(row.mechanisms),
    targets: splitList(row.targets),
    foundIn: splitList(row.foundIn),
    safetyNotes: getFirst(row, ['safetyNotes']),
    evidenceLevel: getFirst(row, ['evidenceLevel']),
  }

  return Object.fromEntries(
    Object.entries(output).filter(([, value]) => {
      if (Array.isArray(value)) return value.length > 0
      return asText(value).length > 0
    }),
  )
}

function normalizeGoalRow(row, index) {
  const routeKey = normalizeSlug(getFirst(row, ['routeKey', 'route_key', 'slug']))
  const title = getFirst(row, ['title', 'name'])

  if (!routeKey) throw new Error(`[publish-data] goals row ${index + 1}: blank route key`)
  if (!title) throw new Error(`[publish-data] goals row ${index + 1}: blank required title`)
  if (!ROUTE_KEY_PATTERN.test(routeKey)) {
    throw new Error(`[publish-data] goals row ${index + 1}: invalid route key "${routeKey}"`)
  }

  const output = {
    routeKey,
    title,
    summary: getFirst(row, ['summary', 'description']),
    description: getFirst(row, ['description']),
  }

  return Object.fromEntries(
    Object.entries(output).filter(([, value]) => asText(value).length > 0),
  )
}

function writeJson(fileName, records) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  const outPath = path.join(OUTPUT_DIR, fileName)
  fs.writeFileSync(outPath, `${JSON.stringify(records, null, 2)}\n`, 'utf8')
}

function run() {
  const herbRows = readJsonArray(path.join(INPUT_DIR, INPUT_FILES.herbs), 'herbs')
  const compoundRows = readJsonArray(path.join(INPUT_DIR, INPUT_FILES.compounds), 'compounds')
  const goalRows = readJsonArray(path.join(INPUT_DIR, INPUT_FILES.goals), 'goals')

  const herbs = herbRows
    .map((row, index) => normalizeHerbRow(row, index))
    .sort((a, b) => a.slug.localeCompare(b.slug))
  const compounds = compoundRows
    .map((row, index) => normalizeCompoundRow(row, index))
    .sort((a, b) => a.slug.localeCompare(b.slug))
  const goals = goalRows
    .map((row, index) => normalizeGoalRow(row, index))
    .sort((a, b) => a.routeKey.localeCompare(b.routeKey))

  assertUniqueSlugs(herbs, 'herbs')
  assertUniqueSlugs(compounds, 'compounds')

  const seenRouteKeys = new Set()
  for (const goal of goals) {
    if (seenRouteKeys.has(goal.routeKey)) {
      throw new Error(`[publish-data] goals: duplicate route key "${goal.routeKey}"`)
    }
    seenRouteKeys.add(goal.routeKey)
  }

  writeJson('herbs.json', herbs)
  writeJson('compounds.json', compounds)
  writeJson('goal-pages.json', goals)

  console.log(`[publish-data] input=${path.relative(ROOT, INPUT_DIR)}`)
  console.log(`[publish-data] wrote public/data/herbs.json (${herbs.length})`)
  console.log(`[publish-data] wrote public/data/compounds.json (${compounds.length})`)
  console.log(`[publish-data] wrote public/data/goal-pages.json (${goals.length})`)
}

run()
