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
  write(outDir, 'relationships.json', map)

  console.log('[data] build complete')
}

main()
