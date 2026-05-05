#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import XLSX from 'xlsx'
import Ajv from 'ajv'
import { resolveWorkbookPath } from '../workbook-source.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')

const ajv = new Ajv({ allErrors: true })

const SHEETS = {
  herbs: 'Herb Master V3',
  compounds: 'Compound Master V3',
  compoundDetailPayload: 'Compound Detail Payload',
}

function clean(v) {
  return v ? String(v).trim() : ''
}

function slug(v) {
  return clean(v)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function splitList(v) {
  return clean(v)
    .split(/[|;,]/)
    .map(s => clean(s))
    .filter(Boolean)
}

function dedupe(rows) {
  const seen = new Set()

  return rows.filter(r => {
    if (!r.slug || seen.has(r.slug)) return false
    seen.add(r.slug)
    return true
  })
}

function write(outDir, name, data) {
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, name), JSON.stringify(data, null, 2))
}

function read(workbook, name) {
  const sheet = workbook.Sheets[name]
  if (!sheet) return []
  return XLSX.utils.sheet_to_json(sheet, { defval: '' })
}

function readOptionalPayload(workbook, config) {
  const sheet = workbook.Sheets[config.sheet]
  if (!sheet) return []

  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })

  return rows
    .map(row => {
      const out = {}

      for (const [k, v] of Object.entries(row)) {
        const key = slug(k).replace(/-/g, '_')
        out[key] = clean(v)
      }

      out.slug = slug(out.slug || out.name || out.title)
      return out
    })
    .filter(r => r.slug)
}

function loadSchema(name) {
  try {
    return JSON.parse(
      fs.readFileSync(
        path.join(repoRoot, 'agent', 'schemas', name),
        'utf8'
      )
    )
  } catch {
    return null
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) return []

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      return walk(fullPath)
    }

    return fullPath.endsWith('.json') ? [fullPath] : []
  })
}

function dedupePatches(rows) {
  const seen = new Set()

  return rows.filter(row => {
    const key = row.patch_id || JSON.stringify(row)

    if (seen.has(key)) return false

    seen.add(key)
    return true
  })
}

function loadAgentPatches() {
  const patchDir = path.resolve(repoRoot, 'agent/patches')

  try {
    if (!fs.existsSync(patchDir)) return []

    const evidenceSchema = loadSchema('evidence.schema.json')
    const enrichmentSchema = loadSchema('enrichment.schema.json')
    const affiliateSchema = loadSchema('affiliate.schema.json')

    const validators = {
      evidence: evidenceSchema ? ajv.compile(evidenceSchema) : null,
      enrichment: enrichmentSchema ? ajv.compile(enrichmentSchema) : null,
      affiliate: affiliateSchema ? ajv.compile(affiliateSchema) : null,
    }

    const files = walk(patchDir)

    const patches = []

    for (const file of files) {
      try {
        const parsed = JSON.parse(fs.readFileSync(file, 'utf8'))

        if (!parsed || typeof parsed !== 'object') continue

        const validator = validators[parsed.patch_type]

        if (!validator) continue

        const valid = validator(parsed)

        if (!valid) continue

        patches.push(parsed)
      } catch {
        continue
      }
    }

    return dedupePatches(patches)
  } catch {
    return []
  }
}

function main() {
  const outDir = path.resolve(repoRoot, 'public/data')
  const workbookPath = resolveWorkbookPath(repoRoot)
  const wb = XLSX.readFile(workbookPath)

  const herbs = dedupe(
    read(wb, SHEETS.herbs).map(r => ({
      slug: slug(r.slug || r.name),
      name: clean(r.name),
      summary: clean(r.summary),
      effects: splitList(r.primary_effects),
    }))
  )

  const compounds = dedupe(
    read(wb, SHEETS.compounds).map(r => ({
      slug: slug(r.slug || r.name),
      name: clean(r.name),
      summary: clean(r.summary),
      mechanism: clean(r.mechanism),
      effects: splitList(r.primary_effects),
      evidence: clean(r.evidence),
      safety: clean(r.safety),
      dosage: clean(r.dosage),
    }))
  )

  write(outDir, 'herbs.json', herbs)
  write(outDir, 'compounds.json', compounds)

  let compoundDetailRows = readOptionalPayload(wb, {
    sheet: SHEETS.compoundDetailPayload,
  })

  if (!compoundDetailRows || compoundDetailRows.length === 0) {
    console.warn('[data] Using fallback compound-detail-payload from compounds.json')

    compoundDetailRows = compounds.map(c => ({
      slug: c.slug,
      name: c.name,
      summary: c.summary,
      mechanism: c.mechanism,
      effects: c.effects,
      evidence: c.evidence,
      safety: c.safety,
      dosage: c.dosage,
    }))
  }

  write(outDir, 'compound-detail-payload.json', dedupe(compoundDetailRows))
  write(outDir, 'agent-patches.json', loadAgentPatches())

  console.log(`[data] compound-detail-payload.json: ${compoundDetailRows.length} rows`)
  console.log('[data] build complete')
}

main()
