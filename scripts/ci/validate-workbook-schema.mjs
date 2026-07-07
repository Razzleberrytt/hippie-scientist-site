#!/usr/bin/env node
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { readWorkbookExcelJS } from '../utils/read-workbook-exceljs.mjs'
import { resolveWorkbookPath, assertWorkbookExists } from '../workbook-source.mjs'

/**
 * Workbook schema-contract + health guard.
 *
 * `validate-workbook-source.mjs` only checks that the file exists and is a
 * non-empty .xlsx. This guard validates the *structure the pipeline depends on*
 * so an accidental formatting/rename/duplicate change fails fast with a clear
 * message (sheet / column / row / slug) instead of failing deep in the build or
 * silently changing site output.
 *
 * Hard failures (exit 1):
 *   - required entity sheet missing
 *   - a parser/policy-critical column missing from the entity sheet
 *   - blank slug, duplicate slug, or non-normalized slug (whitespace / casing)
 *
 * Loud warnings (still exit 0 — deterministic and functional, but flagged):
 *   - the full ExcelJS read path failed and the deterministic streaming reader
 *     was used (the workbook cannot currently be opened for *writing*; see
 *     docs/workbook-pipeline.md). This surfaces a silent degradation.
 *   - a policy-referenced column that is absent everywhere (informational drift).
 */

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

// The entity sheet the parser requires (with its historical fallbacks).
const ENTITY_SHEET_CANDIDATES = ['Entity_Master', 'Sheet7', 'Herb Master V3']

// Columns the parser and indexability policy actually consume. Renaming or
// removing any of these breaks the build or silently changes indexability.
const REQUIRED_ENTITY_COLUMNS = [
  'entity_type',
  'slug',
  'name',
  'summary',
  'primary_effects_or_targets',
  'evidence_tier',
  'runtime_export_decision',
  'profile_status',
]

// Referenced by the indexability policy but not necessarily present; absence is
// informational (it just scores as "missing"), not a hard failure.
const SOFT_POLICY_COLUMNS = ['summary_quality']

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const errors = []
const warnings = []

const workbookPath = resolveWorkbookPath(repoRoot)
assertWorkbookExists(workbookPath)

const handle = await readWorkbookExcelJS(workbookPath)
if (!handle.workbook) {
  warnings.push(
    'Full ExcelJS read failed; using the deterministic streaming reader. ExcelJS-based read/write is unavailable, but targeted ' +
      'programmatic edits ARE supported via the surgical editor: `npm run workbook:edit -- --slug <slug> --column <col> --value <v>` ' +
      '(scripts/data/edit-entity-master-cell.mjs), proven byte-stable by `npm run workbook:roundtrip-test`. See docs/workbook-pipeline.md §7.',
  )
}

const sheetNames = handle.getSheetNames()
const entitySheet = ENTITY_SHEET_CANDIDATES.find((name) => sheetNames.includes(name))
if (!entitySheet) {
  errors.push(`Required entity sheet not found. Looked for: ${ENTITY_SHEET_CANDIDATES.join(', ')}. Present: ${sheetNames.join(', ')}`)
}

let rows = []
let columns = []
if (entitySheet) {
  rows = handle.getSheetData(entitySheet)
  columns = rows.length ? Object.keys(rows[0]) : []

  for (const col of REQUIRED_ENTITY_COLUMNS) {
    if (!columns.includes(col)) {
      errors.push(`[${entitySheet}] missing required column: "${col}" (parser/indexability depends on it)`)
    }
  }
  for (const col of SOFT_POLICY_COLUMNS) {
    if (!columns.includes(col)) {
      warnings.push(`[${entitySheet}] policy-referenced column "${col}" is absent — it always scores as missing. Confirm this is intended.`)
    }
  }

  // Slug integrity — report the exact row (1-based incl. header) and slug.
  if (columns.includes('slug')) {
    const seen = new Map()
    rows.forEach((row, i) => {
      const dataRow = i + 2 // +1 header, +1 to 1-based
      const raw = String(row.slug ?? '')
      const slug = raw.trim()
      if (!slug) {
        errors.push(`[${entitySheet}] row ${dataRow}: blank slug (name="${String(row.name ?? '').trim() || '?'}")`)
        return
      }
      if (raw !== slug) {
        errors.push(`[${entitySheet}] row ${dataRow}: slug "${raw}" has leading/trailing whitespace`)
      }
      if (!SLUG_RE.test(slug)) {
        errors.push(`[${entitySheet}] row ${dataRow}: slug "${slug}" is not normalized (expected lowercase, digits, hyphens)`)
      }
      if (seen.has(slug)) {
        errors.push(`[${entitySheet}] row ${dataRow}: duplicate slug "${slug}" (first seen row ${seen.get(slug)})`)
      } else {
        seen.set(slug, dataRow)
      }
    })
  }
}

// Deterministic health snapshot — a content hash so a reviewer can tell whether
// a workbook re-save actually changed parsed entity data.
if (rows.length) {
  const typeCounts = {}
  for (const r of rows) {
    const t = String(r.entity_type ?? 'unknown').trim().toLowerCase() || 'unknown'
    typeCounts[t] = (typeCounts[t] || 0) + 1
  }
  const hash = crypto.createHash('sha256').update(JSON.stringify(rows)).digest('hex').slice(0, 16)
  console.log(`[validate-workbook-schema] entity sheet: ${entitySheet} — ${rows.length} rows, ${columns.length} columns`)
  console.log(`[validate-workbook-schema] entity types: ${Object.entries(typeCounts).map(([k, v]) => `${k}=${v}`).join(', ')}`)
  console.log(`[validate-workbook-schema] entity content hash: ${hash}`)
  console.log(`[validate-workbook-schema] sheets (${sheetNames.length}): ${sheetNames.join(', ')}`)
}

for (const w of warnings) console.warn(`[validate-workbook-schema] WARN: ${w}`)

if (errors.length) {
  console.error(`\n[validate-workbook-schema] FAILED with ${errors.length} error(s):`)
  for (const e of errors) console.error(`  - ${e}`)
  process.exit(1)
}

console.log(`[validate-workbook-schema] PASS: schema contract satisfied${warnings.length ? ` (${warnings.length} warning(s) above)` : ''}.`)
