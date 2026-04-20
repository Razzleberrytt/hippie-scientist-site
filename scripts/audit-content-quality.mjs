#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const HERBS_FILE = path.join(ROOT, 'public/data/herbs.json')
const COMPOUNDS_FILE = path.join(ROOT, 'public/data/compounds.json')
const HERBS_DETAIL_DIR = path.join(ROOT, 'public/data/herbs-detail')
const COMPOUNDS_DETAIL_DIR = path.join(ROOT, 'public/data/compounds-detail')

const PLACEHOLDERS = ['nan', 'No direct effects data', 'Contextual inference']

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function readJsonFiles(dirPath) {
  if (!fs.existsSync(dirPath)) return []

  return fs
    .readdirSync(dirPath)
    .filter(name => name.endsWith('.json'))
    .sort()
    .map(name => {
      const fullPath = path.join(dirPath, name)
      return {
        filePath: fullPath,
        data: readJson(fullPath),
      }
    })
}

function findDuplicateSlugsInCollection(entities, label) {
  const slugToLocations = new Map()

  for (const entity of entities) {
    if (typeof entity.slug !== 'string' || !entity.slug.trim()) continue
    const slug = entity.slug.trim()
    if (!slugToLocations.has(slug)) slugToLocations.set(slug, [])
    slugToLocations.get(slug).push(entity.location)
  }

  return [...slugToLocations.entries()]
    .filter(([, locations]) => locations.length > 1)
    .map(([slug, locations]) => ({ slug, locations, label }))
    .sort((a, b) => a.slug.localeCompare(b.slug))
}

function hasPlaceholder(value, placeholder) {
  if (typeof value === 'string') {
    if (placeholder === 'nan') return value.trim().toLowerCase() === 'nan'
    return value.includes(placeholder)
  }

  if (Array.isArray(value)) return value.some(item => hasPlaceholder(item, placeholder))
  if (value && typeof value === 'object') return Object.values(value).some(item => hasPlaceholder(item, placeholder))

  return false
}

function countRecordsWithPlaceholder(records, placeholder) {
  return records.reduce((count, record) => count + (hasPlaceholder(record.data, placeholder) ? 1 : 0), 0)
}

function isBlankText(value) {
  return typeof value !== 'string' || value.trim() === ''
}

function normalizeSources(value) {
  if (Array.isArray(value)) return value.filter(Boolean)
  return []
}

function main() {
  const herbs = readJson(HERBS_FILE)
  const compounds = readJson(COMPOUNDS_FILE)
  const herbsDetail = readJsonFiles(HERBS_DETAIL_DIR)
  const compoundsDetail = readJsonFiles(COMPOUNDS_DETAIL_DIR)

  const duplicateSlugGroups = [
    ...findDuplicateSlugsInCollection(
      herbs.map((item, index) => ({ slug: item.slug, location: `public/data/herbs.json#${index}` })),
      'herbs.json'
    ),
    ...findDuplicateSlugsInCollection(
      compounds.map((item, index) => ({ slug: item.slug, location: `public/data/compounds.json#${index}` })),
      'compounds.json'
    ),
    ...findDuplicateSlugsInCollection(
      herbsDetail.map(item => ({ slug: item.data?.slug, location: path.relative(ROOT, item.filePath) })),
      'herbs-detail'
    ),
    ...findDuplicateSlugsInCollection(
      compoundsDetail.map(item => ({ slug: item.data?.slug, location: path.relative(ROOT, item.filePath) })),
      'compounds-detail'
    ),
  ]

  const allRecords = [
    { filePath: HERBS_FILE, data: herbs },
    { filePath: COMPOUNDS_FILE, data: compounds },
    ...herbsDetail,
    ...compoundsDetail,
  ]

  const compoundsWithEmptySummary = compoundsDetail.filter(item => isBlankText(item.data?.summary))
  const compoundsWithEmptyDescription = compoundsDetail.filter(item => isBlankText(item.data?.description))
  const compoundsWithZeroSources = compoundsDetail.filter(item => normalizeSources(item.data?.sources).length === 0)

  console.log('[audit-content-quality] Herbs + compounds data quality report')
  console.log(`- records scanned: ${allRecords.length}`)
  console.log(`- duplicate slug groups: ${duplicateSlugGroups.length}`)
  console.log(`- "nan": ${countRecordsWithPlaceholder(allRecords, PLACEHOLDERS[0])}`)
  console.log(`- "No direct effects data": ${countRecordsWithPlaceholder(allRecords, PLACEHOLDERS[1])}`)
  console.log(`- "Contextual inference": ${countRecordsWithPlaceholder(allRecords, PLACEHOLDERS[2])}`)
  console.log(`- compounds with empty summary: ${compoundsWithEmptySummary.length}`)
  console.log(`- compounds with empty description: ${compoundsWithEmptyDescription.length}`)
  console.log(`- compounds with zero sources: ${compoundsWithZeroSources.length}`)

  if (duplicateSlugGroups.length > 0) {
    console.log('\nDuplicate slug samples:')
    duplicateSlugGroups.slice(0, 10).forEach(entry => {
      console.log(`- [${entry.label}] ${entry.slug} (${entry.locations.length} matches)`)
    })
    if (duplicateSlugGroups.length > 10) {
      console.log(`- ...and ${duplicateSlugGroups.length - 10} more`)
    }
    process.exitCode = 1
  }
}

main()
