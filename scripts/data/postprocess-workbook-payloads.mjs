#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import XLSX from 'xlsx'
import { resolveWorkbookPath } from '../workbook-source.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')
const outDir = path.resolve(repoRoot, 'public/data')

const payloadSheets = [
  ['Compound Card Payload', 'compound-card-payload.json'],
  ['Compound Detail Payload', 'compound-detail-payload.json'],
  ['SEO Page Payload', 'seo-page-payload.json'],
  ['CTA Gate Payload', 'cta-gate-payload.json'],
  ['Route Build Manifest', 'route-build-manifest.json'],
]

const clean = value => value === null || value === undefined ? '' : String(value).trim()
const slug = value => clean(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
const splitList = value => clean(value).split(/[|;,]/).map(item => item.trim()).filter(Boolean)

const keySlug = key => slug(key).replace(/-/g, '_')

function normalizeRow(row) {
  const normalized = {}
  for (const [key, value] of Object.entries(row)) {
    const normalizedKey = keySlug(key)
    if (!normalizedKey) continue
    normalized[normalizedKey] = typeof value === 'string' ? clean(value) : value
  }

  const rowSlug = slug(
    normalized.slug ||
    normalized.compound_slug ||
    normalized.herb_slug ||
    normalized.entity_slug ||
    normalized.page_slug ||
    normalized.route_slug ||
    normalized.item_slug ||
    normalized.canonical_slug ||
    normalized.id ||
    normalized.compound_id ||
    normalized.herb_id ||
    normalized.name ||
    normalized.title ||
    normalized.h1 ||
    normalized.headline ||
    normalized.route ||
    normalized.path
  )

  const route = clean(normalized.route || normalized.path)
  return { ...normalized, slug: rowSlug, route }
}

function dedupe(rows) {
  const seen = new Set()
  return rows.filter(row => {
    const key = row.slug || row.route || row.path
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function readJson(fileName) {
  const filePath = path.join(outDir, fileName)
  if (!fs.existsSync(filePath)) return []
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

function writeJson(fileName, rows) {
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, fileName), JSON.stringify(rows, null, 2))
}

function hasMeaningfulSources(row) {
  return Array.isArray(row.sources) && row.sources.length > 0
}

function sourceListFromRow(row) {
  const fields = [
    row.sources,
    row.source_urls,
    row.source_url,
    row.pmids,
    row.pmid,
    row.references,
    row.citation_urls,
    row.evidence_sources,
  ]
  return fields.flatMap(splitList).filter(Boolean)
}

function enrichSources(fileName) {
  const rows = readJson(fileName)
  if (!rows.length) return
  const enriched = rows.map(row => ({ ...row, sources: hasMeaningfulSources(row) ? row.sources : sourceListFromRow(row) }))
  writeJson(fileName, enriched)
  const count = enriched.filter(row => Array.isArray(row.sources) && row.sources.length > 0).length
  console.log(`[data-postprocess] ${fileName}: ${count}/${enriched.length} rows with sources`)
}

function main() {
  const workbookPath = resolveWorkbookPath(repoRoot)
  const workbook = XLSX.readFile(workbookPath)

  for (const [sheetName, fileName] of payloadSheets) {
    const sheet = workbook.Sheets[sheetName]
    if (!sheet) {
      console.warn(`[data-postprocess] optional sheet missing: ${sheetName}`)
      continue
    }

    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })
    const normalizedRows = dedupe(rows.map(normalizeRow).filter(row => row.slug || row.route || row.path))

    if (rows.length > 0 && normalizedRows.length === 0) {
      console.warn(`[data-postprocess] ${sheetName}: ${rows.length} rows found but no usable slug/route aliases`)
    }

    writeJson(fileName, normalizedRows)
    console.log(`[data-postprocess] ${fileName}: ${normalizedRows.length} rows`)
  }

  enrichSources('herbs.json')
  enrichSources('compounds.json')
}

main()
