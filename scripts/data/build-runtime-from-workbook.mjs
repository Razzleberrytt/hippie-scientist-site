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
  herbCompoundMap: 'Herb Compound Map V3',
  stackGenerator: 'Stack Generator V1',
}

function clean(v) {
  if (!v) return ''
  return String(v).trim()
}

function slug(v) {
  return clean(v)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function read(workbook, name) {
  const sheet = workbook.Sheets[name]
  if (!sheet) {
    console.warn(`[data] Missing sheet: ${name}`)
    return []
  }
  return XLSX.utils.sheet_to_json(sheet, { defval: '' })
}

function readOptional(workbook, name) {
  const sheet = workbook.Sheets[name]
  if (!sheet) return []
  return XLSX.utils.sheet_to_json(sheet, { defval: '' })
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

function main() {
  const outDir = path.resolve(repoRoot, 'public/data')
  const workbookPath = resolveWorkbookPath(repoRoot)

  const wb = XLSX.readFile(workbookPath)

  const herbs = dedupe(
    read(wb, SHEETS.herbs).map(r => ({
      slug: slug(r.slug || r.name),
      name: clean(r.name),
      summary: clean(r.summary),
      compounds: [],
    })),
  )

  const compounds = dedupe(
    read(wb, SHEETS.compounds).map(r => ({
      slug: slug(r.slug || r.name),
      name: clean(r.name),
      mechanism: clean(r.mechanism_summary),
      evidence: clean(r.evidence_grade),
      dosage: clean(r.dosage_range),
      safety: clean(r.safety_notes),
      herbs: [],
    })),
  )

  const map = read(wb, SHEETS.herbCompoundMap).map(r => ({
    herb: slug(r.herb_slug || r.herb),
    compound: slug(r.compound_slug || r.compound),
  }))

  const stackGeneratorRows = readOptional(wb, SHEETS.stackGenerator).map(r => ({
    goal_slug: slug(r.goal_slug || r.goal),
    effect_slug: slug(r.effect_slug || r.effect),
    mechanism_slug: slug(r.mechanism_slug || r.mechanism),
    compound_slug: slug(r.compound_slug || r.compound),
    stack_variant: clean(r.stack_variant || r.variant).toLowerCase(),
    eligible: clean(r.eligible).toLowerCase(),
    role_override: clean(r.role_override || r.role).toLowerCase(),
    dosage: clean(r.dosage),
    timing: clean(r.timing),
    evidence_tier: clean(r.evidence_tier || r.evidence),
    safety_flags: clean(r.safety_flags),
    avoid_if: clean(r.avoid_if),
    caution_notes: clean(r.caution_notes),
    time_to_effect: clean(r.time_to_effect),
    duration: clean(r.duration),
    affiliate_priority: clean(r.affiliate_priority),
    stack_priority: clean(r.stack_priority),
    source_fields: clean(r.source_fields),
    notes: clean(r.notes),
  }))

  if (stackGeneratorRows.length > 0) {
    console.log(`[data] stack generator rows: ${stackGeneratorRows.length}`)
  } else {
    console.log('[data] Stack Generator V1 not found; skipping stack generator prep')
  }

  const herbMap = new Map(herbs.map(h => [h.slug, h]))
  const compMap = new Map(compounds.map(c => [c.slug, c]))

  map.forEach(m => {
    const h = herbMap.get(m.herb)
    const c = compMap.get(m.compound)
    if (!h || !c) return
    h.compounds.push(c.slug)
    c.herbs.push(h.slug)
  })

  write(outDir, 'herbs.json', herbs)
  write(outDir, 'compounds.json', compounds)
  write(outDir, 'herb-compound-map.json', map)

  console.log('[data] build complete')
}

main()
