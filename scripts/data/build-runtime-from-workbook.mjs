#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import XLSX from 'xlsx'
import { resolveWorkbookPath } from '../workbook-source.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')

const SHEETS = {
  herbs: 'Herb Master V3',
  compounds: 'Compound Master V3',
  compoundDetailPayload: 'Compound Detail Payload',
}

const AGENT_PATCH_KEYS = [
  'compound_slug',
  'effect_target',
  'study_type',
  'population',
  'effect_direction',
  'effect_size',
  'sample_size',
  'duration',
  'dose',
  'pmid_or_source',
]

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

  return rows.map(row => {
    const out = {}

    for (const [k, v] of Object.entries(row)) {
      const key = slug(k).replace(/-/g, '_')
      out[key] = clean(v)
    }

    out.slug = slug(out.slug || out.name || out.title)
    return out
  }).filter(r => r.slug)
}

function loadAgentPatches() {
  const patchDir = path.resolve(repoRoot, 'agent/patches')

  try {
    if (!fs.existsSync(patchDir)) return []

    const files = fs.readdirSync(patchDir).filter(file => file.endsWith('.json'))
    if (files.length === 0) return []

    return files.flatMap(file => {
      try {
        const parsed = JSON.parse(fs.readFileSync(path.join(patchDir, file), 'utf8'))
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    })
  } catch {
    return []
  }
}

function normalizeAgentPatch(entry) {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return null

  const out = {}
  for (const key of AGENT_PATCH_KEYS) out[key] = clean(entry[key])

  out.compound_slug = slug(out.compound_slug)

  if (!out.compound_slug || !out.study_type || !out.population) return null

  return out
}

function dedupeAgentPatches(entries) {
  const seen = new Set()

  return entries.filter(entry => {
    const key = JSON.stringify(entry)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function mergeAgentEvidence(compoundDetailRows, patchRows) {
  const normalizedPatches = dedupeAgentPatches(
    patchRows.map(normalizeAgentPatch).filter(Boolean)
  )

  if (normalizedPatches.length === 0) return compoundDetailRows

  const detailSlugs = new Set(compoundDetailRows.map(row => slug(row.slug)))
  const patchesBySlug = new Map()

  for (const patch of normalizedPatches) {
    if (!detailSlugs.has(patch.compound_slug)) continue

    const existing = patchesBySlug.get(patch.compound_slug) || []
    existing.push(patch)
    patchesBySlug.set(patch.compound_slug, existing)
  }

  if (patchesBySlug.size === 0) return compoundDetailRows

  return compoundDetailRows.map(row => {
    const rowSlug = slug(row.slug)
    const patches = patchesBySlug.get(rowSlug)
    if (!patches || patches.length === 0) return row

    const currentEvidence = Array.isArray(row.agent_evidence) ? row.agent_evidence : []
    const mergedEvidence = dedupeAgentPatches([...currentEvidence, ...patches])

    return {
      ...row,
      agent_evidence: mergedEvidence,
    }
  })
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

  // ✅ Fallback payload logic (CORRECTLY PLACED)
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

  compoundDetailRows = mergeAgentEvidence(compoundDetailRows, loadAgentPatches())

  write(outDir, 'compound-detail-payload.json', dedupe(compoundDetailRows))

  console.log(`[data] compound-detail-payload.json: ${compoundDetailRows.length} rows`)
  console.log('[data] build complete')
}

main()
