#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import XLSX from 'xlsx'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')

const DEFAULT_XLSX_PATH = path.join(repoRoot, 'data-sources', 'herb_monograph_master.xlsx')
const DEFAULT_OUTPUT_DIR = path.join(repoRoot, 'public', 'data', 'projections', 'monograph-runtime')
const DEFAULT_COMPOUNDS_PATH = path.join(repoRoot, 'public', 'data', 'compounds.json')

const JUNK_VALUES = new Set(['', 'na', 'n/a', 'none', 'null', 'undefined', 'unknown', 'unk', 'tbd', '-', '--'])

function cleanText(value) {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim()
  return text
}

function isJunk(value) {
  const text = cleanText(value).toLowerCase()
  return !text || JUNK_VALUES.has(text)
}

function toNullableText(value) {
  const text = cleanText(value)
  return isJunk(text) ? null : text
}

function toSlug(value) {
  const text = cleanText(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[’'`]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .toLowerCase()

  return text || null
}

function splitArrayField(value) {
  if (Array.isArray(value)) {
    return value.map((item) => cleanText(item)).filter(Boolean)
  }

  const text = cleanText(value)
  if (isJunk(text)) return []

  return text
    .split(/[;|,\n]/)
    .map((part) => cleanText(part))
    .filter((part) => !isJunk(part))
}

function dedupeCaseInsensitive(values) {
  const seen = new Set()
  const out = []

  for (const value of values) {
    const text = cleanText(value)
    if (isJunk(text)) continue
    const key = text.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(text)
  }

  return out
}

function normalizeTagArray(value) {
  return dedupeCaseInsensitive(splitArrayField(value).map((item) => item.toLowerCase()))
}

function safeReadJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch {
    return fallback
  }
}

function buildCompoundSlugLookup(compounds) {
  const map = new Map()

  for (const compound of compounds) {
    const slug = toSlug(compound.slug || compound.id || compound.name)
    if (!slug) continue

    for (const alias of [compound.slug, compound.id, compound.name, compound.displayName]) {
      const normalizedAlias = cleanText(alias).toLowerCase()
      if (normalizedAlias) {
        map.set(normalizedAlias, slug)
      }
    }
  }

  return map
}

function normalizeActiveCompounds(value, compoundSlugLookup) {
  const compounds = dedupeCaseInsensitive(splitArrayField(value))
  return compounds
    .map((compound) => {
      const lookupKey = compound.toLowerCase()
      return compoundSlugLookup.get(lookupKey) || toSlug(compound)
    })
    .filter(Boolean)
}

function readHerbMonographRows(workbookPath) {
  const workbook = XLSX.readFile(workbookPath)
  const sheet = workbook.Sheets['Herb Monographs']
  if (!sheet) {
    throw new Error('Missing worksheet: Herb Monographs')
  }

  return XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false, blankrows: false })
}

function projectHerbRow(row, compoundSlugLookup) {
  const name = toNullableText(row.name)
  const slug = toSlug(row.slug || row.name)

  if (!name || !slug) return null

  const projected = {
    name,
    slug,
    scientificName: toNullableText(row.scientificName),
    summary: toNullableText(row.summary),
    description: toNullableText(row.description),
    mechanism: toNullableText(row.mechanism),
    mechanismTags: normalizeTagArray(row.mechanismTags),
    activeCompounds: normalizeActiveCompounds(row.activeCompounds || row.markerCompounds, compoundSlugLookup),
    safetyNotes: toNullableText(row.safetyNotes),
    interactions: dedupeCaseInsensitive(splitArrayField(row.interactions)),
    dosage: toNullableText(row.dosage),
    preparation: toNullableText(row.preparation),
    region: toNullableText(row.region),
  }

  return projected
}

function toSummaryRows(projectedHerbs) {
  return projectedHerbs.map((herb) => ({
    name: herb.name,
    slug: herb.slug,
    scientificName: herb.scientificName,
    summary: herb.summary,
    mechanismTags: herb.mechanismTags,
    activeCompounds: herb.activeCompounds,
    region: herb.region,
  }))
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

function main() {
  const workbookPath = process.env.HERB_XLSX_PATH ? path.resolve(repoRoot, process.env.HERB_XLSX_PATH) : DEFAULT_XLSX_PATH
  const outputDir = process.env.MONOGRAPH_PROJECTION_OUTPUT_DIR
    ? path.resolve(repoRoot, process.env.MONOGRAPH_PROJECTION_OUTPUT_DIR)
    : DEFAULT_OUTPUT_DIR

  const compounds = safeReadJson(DEFAULT_COMPOUNDS_PATH, [])
  const compoundSlugLookup = buildCompoundSlugLookup(Array.isArray(compounds) ? compounds : [])
  const rows = readHerbMonographRows(workbookPath)

  const herbs = rows
    .map((row) => projectHerbRow(row, compoundSlugLookup))
    .filter(Boolean)
    .sort((a, b) => a.slug.localeCompare(b.slug))

  const herbsSummary = toSummaryRows(herbs)

  writeJson(path.join(outputDir, 'herbs.json'), herbs)
  writeJson(path.join(outputDir, 'herbs-summary.json'), herbsSummary)

  const detailDir = path.join(outputDir, 'herbs-detail')
  fs.mkdirSync(detailDir, { recursive: true })
  for (const herb of herbs) {
    writeJson(path.join(detailDir, `${herb.slug}.json`), herb)
  }

  console.log(`[generate-monograph-projection] workbook: ${path.relative(repoRoot, workbookPath)}`)
  console.log(`[generate-monograph-projection] records: ${herbs.length}`)
  console.log(`[generate-monograph-projection] output: ${path.relative(repoRoot, outputDir)}`)
}

main()
