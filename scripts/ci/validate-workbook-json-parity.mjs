#!/usr/bin/env node
/**
 * Workbook/JSON parity check.
 *
 * public/data is disposable — `npm run data:build` regenerates herbs.json /
 * compounds.json entirely from data-sources/herb_monograph_master.xlsx
 * (Entity_Master sheet) and deletes any compounds-detail/herbs-detail file
 * whose slug isn't in the freshly-regenerated list (see
 * scripts/data/apply-governance-overlay.mjs's orphan reconciliation step).
 *
 * If a herb or compound is ever added directly to public/data/*.json without
 * a matching workbook row (e.g. by hand-editing JSON instead of running
 * data:build after a workbook edit), it will build and deploy fine right up
 * until someone runs the full data pipeline again — at which point it, and
 * its detail file, disappear with no error or warning. This happened once
 * already (8 peptide compounds shipped straight to JSON, silently dropped
 * on the next full rebuild, only caught by accident).
 *
 * This check fails loudly, before that happens again: any slug present in
 * public/data/herbs.json or compounds.json but absent from the workbook's
 * Entity_Master sheet is a parity violation.
 */
import fs from 'node:fs'
import path from 'node:path'
import { readWorkbook, getSheet, sheetToRows } from '../data/workbook-parser.mjs'
import { assertWorkbookExists, resolveWorkbookPath } from '../workbook-source.mjs'

const repoRoot = process.cwd()
const dataDirArg = process.argv.find((arg) => arg.startsWith('--data-dir='))
const dataDir = path.resolve(repoRoot, dataDirArg ? dataDirArg.split('=')[1] : 'public/data')

function clean(v) {
  if (v === null || v === undefined) return ''
  return String(v).trim()
}

function readJsonArray(filePath) {
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function main() {
  const workbookPath = resolveWorkbookPath(repoRoot)
  assertWorkbookExists(workbookPath)

  const wb = await readWorkbook(workbookPath)

  const entityMasterSheet = getSheet(wb, 'Entity_Master') || getSheet(wb, 'Sheet7')
  const legacyHerbSheet = getSheet(wb, 'Herb Master V3') || getSheet(wb, 'Herb Monographs') || getSheet(wb, 'Site Export Herbs')
  const legacyCompoundSheet = getSheet(wb, 'Compound Master V3') || getSheet(wb, 'Site Export Compounds')

  const workbookHerbSlugs = new Set()
  const workbookCompoundSlugs = new Set()

  // Mirror build-runtime-from-workbook.mjs's own precedence exactly: once Entity_Master
  // exists, it is the SOLE source for herb/compound rows and legacy sheets are ignored
  // entirely (see its hasEntityMaster branch). A validator that unioned in legacy-sheet
  // slugs regardless would treat a legacy-only slug as "safe" even though the real
  // pipeline would drop it on the next data:build — recreating the exact silent
  // JSON-only data-loss gap this check exists to catch.
  if (entityMasterSheet) {
    for (const row of sheetToRows(entityMasterSheet)) {
      const slug = clean(row.slug).toLowerCase()
      if (!slug) continue
      const entityType = clean(row.entity_type).toLowerCase()
      if (entityType === 'compound') workbookCompoundSlugs.add(slug)
      else workbookHerbSlugs.add(slug) // blank entity_type defaults to herb, matching build-runtime-from-workbook.mjs
    }
  } else {
    if (legacyHerbSheet) {
      for (const row of sheetToRows(legacyHerbSheet)) {
        const slug = clean(row.slug).toLowerCase()
        if (slug) workbookHerbSlugs.add(slug)
      }
    }
    if (legacyCompoundSheet) {
      for (const row of sheetToRows(legacyCompoundSheet)) {
        const slug = clean(row.slug).toLowerCase()
        if (slug) workbookCompoundSlugs.add(slug)
      }
    }
  }

  const herbsJson = readJsonArray(path.join(dataDir, 'herbs.json'))
  const compoundsJson = readJsonArray(path.join(dataDir, 'compounds.json'))

  const orphanHerbs = herbsJson
    .map((r) => clean(r.slug).toLowerCase())
    .filter((slug) => slug && !workbookHerbSlugs.has(slug))
    .sort()
  const orphanCompounds = compoundsJson
    .map((r) => clean(r.slug).toLowerCase())
    .filter((slug) => slug && !workbookCompoundSlugs.has(slug))
    .sort()

  console.log(`[validate-workbook-json-parity] Workbook: ${workbookHerbSlugs.size} herb rows, ${workbookCompoundSlugs.size} compound rows.`)
  console.log(`[validate-workbook-json-parity] public/data: ${herbsJson.length} herbs, ${compoundsJson.length} compounds.`)

  if (orphanHerbs.length === 0 && orphanCompounds.length === 0) {
    console.log('[validate-workbook-json-parity] PASS: every herb/compound in public/data has a matching workbook row.')
    return
  }

  console.error('[validate-workbook-json-parity] FAIL: the following slugs exist in public/data but NOT in the workbook.')
  console.error('They will be silently deleted (along with their compounds-detail/herbs-detail file) the next time')
  console.error('someone runs `npm run data:build`. Add them to data-sources/herb_monograph_master.xlsx (Entity_Master')
  console.error('sheet) to fix, or remove them from public/data if they were never meant to ship.')
  if (orphanHerbs.length > 0) {
    console.error(`\nHerbs (${orphanHerbs.length}):`)
    for (const slug of orphanHerbs) console.error(`  - ${slug}`)
  }
  if (orphanCompounds.length > 0) {
    console.error(`\nCompounds (${orphanCompounds.length}):`)
    for (const slug of orphanCompounds) console.error(`  - ${slug}`)
  }
  process.exit(1)
}

main().catch((error) => {
  console.error('[validate-workbook-json-parity] FAIL:', error.message)
  process.exit(1)
})
