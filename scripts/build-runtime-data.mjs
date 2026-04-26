#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import XLSX from 'xlsx'
import { resolveWorkbookPath } from './workbook-source.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')

const REQUIRED_SHEET = 'Herb Master V3'
const MAP_SHEET = 'Herb Compound Map V3'
const DEFAULT_SUMMARY = 'Profile pending review'

function normalizeText(value) {
  if (value === null || value === undefined) return ''
  if (typeof value === 'number' && Number.isNaN(value)) return ''
  return String(value).replace(/\s+/g, ' ').trim()
}

function normalizeSlug(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function normalizeList(value) {
  const text = normalizeText(value)
  if (!text) return []
  return [...new Set(text.split(/[;|,\n]/).map(item => normalizeText(item)).filter(Boolean))]
}

function toSimpleRow(row) {
  const out = {}
  for (const [key, value] of Object.entries(row || {})) {
    const normalizedKey = normalizeText(key)
    if (!normalizedKey) continue
    out[normalizedKey] = value
  }
  return out
}

function readSheetRows(workbook, sheetName, optional = false) {
  const sheet = workbook.Sheets[sheetName]
  if (!sheet) {
    if (optional) return []
    throw new Error(`[data-next] Missing required sheet: ${sheetName}`)
  }
  return XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false, blankrows: false }).map(toSimpleRow)
}

function firstNonEmpty(row, keys) {
  for (const key of keys) {
    const value = normalizeText(row[key])
    if (value) return value
  }
  return ''
}

function buildHerbRecord(row, activeCompounds) {
  const name = normalizeText(firstNonEmpty(row, ['name', 'herbName']))
  const slug = normalizeSlug(firstNonEmpty(row, ['slug', 'herbSlug', 'name']))
  const scientificName = normalizeText(firstNonEmpty(row, ['scientificName', 'scientific_name', 'latinName', 'botanicalName']))
  const summary = normalizeText(firstNonEmpty(row, ['summary', 'hero'])) || DEFAULT_SUMMARY
  const description = normalizeText(firstNonEmpty(row, ['description']))
  const mechanismTags = normalizeList(firstNonEmpty(row, ['mechanismTags', 'mechanisms', 'mechanism']))
  const interactions = normalizeList(firstNonEmpty(row, ['interactions']))

  return {
    name,
    slug,
    scientificName,
    summary,
    description,
    mechanismTags,
    activeCompounds,
    interactions,
  }
}

function writeJson(filePath, payload) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
}

function run() {
  const outputDir = path.join(repoRoot, 'public', 'data-next')
  const workbookPath = resolveWorkbookPath(repoRoot)
  const workbook = XLSX.readFile(workbookPath)

  const herbRows = readSheetRows(workbook, REQUIRED_SHEET)
  const mapRows = readSheetRows(workbook, MAP_SHEET, true)

  const activeCompoundsByHerbSlug = new Map()
  for (const row of mapRows) {
    const herbSlug = normalizeSlug(firstNonEmpty(row, ['herb_slug', 'herbSlug', 'herb']))
    const compoundName = normalizeText(firstNonEmpty(row, ['compound_name', 'compoundName', 'canonicalCompoundName', 'compound']))
    if (!herbSlug || !compoundName) continue
    const existing = activeCompoundsByHerbSlug.get(herbSlug) || []
    if (!existing.includes(compoundName)) existing.push(compoundName)
    activeCompoundsByHerbSlug.set(herbSlug, existing)
  }

  const herbs = []
  const seenSlugs = new Set()
  for (const row of herbRows) {
    const slug = normalizeSlug(firstNonEmpty(row, ['slug', 'herbSlug', 'name']))
    const name = normalizeText(firstNonEmpty(row, ['name', 'herbName']))
    if (!name || !slug || seenSlugs.has(slug)) continue
    seenSlugs.add(slug)
    const activeCompounds = activeCompoundsByHerbSlug.get(slug) || []
    herbs.push(buildHerbRecord(row, activeCompounds))
  }

  const summary = herbs.map(item => ({
    name: item.name,
    slug: item.slug,
    scientificName: item.scientificName,
    summary: item.summary,
    mechanismTags: item.mechanismTags,
  }))

  writeJson(path.join(outputDir, 'herbs.json'), herbs)
  writeJson(path.join(outputDir, 'herbs-summary.json'), summary)

  for (const herb of herbs) {
    writeJson(path.join(outputDir, 'herbs-detail', `${herb.slug}.json`), herb)
  }

  writeJson(path.join(outputDir, '_meta', 'build-info.json'), {
    generatedAt: new Date().toISOString(),
    source: {
      workbookPath,
      sheet: REQUIRED_SHEET,
      mapSheet: MAP_SHEET,
    },
    output: 'public/data-next',
    counts: {
      herbs: herbs.length,
      herbsSummary: summary.length,
      herbDetails: herbs.length,
    },
  })

  console.log('[data-next] out=public/data-next')
  console.log(`[data-next] wrote herbs=${herbs.length}`)
  console.log(`[data-next] detail files herbs=${herbs.length}`)
}

run()
