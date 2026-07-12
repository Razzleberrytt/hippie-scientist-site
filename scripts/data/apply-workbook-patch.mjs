#!/usr/bin/env node
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { readWorkbookExcelJS } from '../utils/read-workbook-exceljs.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')
const DEFAULT_WORKBOOK = path.join(repoRoot, 'data-sources/herb_monograph_master.xlsx')
const ENTITY_SHEET_CANDIDATES = ['Entity_Master', 'Sheet7', 'Herb Master V3']
const EDITOR = path.join(repoRoot, 'scripts/data/edit-entity-master-cell.mjs')
const SCHEMA_VALIDATOR = path.join(repoRoot, 'scripts/ci/validate-workbook-schema.mjs')

const PATCH_STATUSES = new Set(['proposal', 'approved', 'applied'])
const CONFIDENCE_LEVELS = new Set(['low', 'moderate', 'high'])
const REQUIRED_ENTITY_FIELDS = new Set([
  'entity_type',
  'slug',
  'name',
  'summary',
  'primary_effects_or_targets',
  'evidence_tier',
  'runtime_export_decision',
  'profile_status',
])
const PROTECTED_COLUMNS = new Set([
  'slug',
  'entity_type',
  'runtime_export_decision',
  'profile_status',
  'visibility_tier',
  'robots',
  'sitemap_included',
  'donotpromote',
  'do_not_promote',
  'donotmonetize',
  'do_not_monetize',
  'governance_status',
  'legal_status',
  'controlled_status',
  'controlled_schedule',
  'dea_status',
  'dea_watchlist_status',
  'regulatory_status',
])
const HUMAN_REVIEW_COLUMNS = new Set([
  'dosage',
  'typical_dosage',
  'dosage_or_preferred_form',
  'contraindications',
  'contraindications_or_flags',
  'interactions',
  'side_effects',
  'runtime_safety',
  'safety_level',
  'evidence_grade',
  'evidence_tier',
  'evidence_risk_of_bias',
])
const DOI_PATTERN = /^10\.\d{4,9}\/\S+$/i

function usage(exitCode = 0) {
  const stream = exitCode === 0 ? process.stdout : process.stderr
  stream.write(`Reviewable Entity_Master workbook patch runner\n\nUsage:\n  node scripts/data/apply-workbook-patch.mjs --patch data-sources/workbook-patches/example.json\n  node scripts/data/apply-workbook-patch.mjs --patch patch.json --apply --out /tmp/edited.xlsx\n  node scripts/data/apply-workbook-patch.mjs --patch patch.json --apply --in-place --approve-human-review\n\nOptions:\n  --patch <path>          JSON patch file (required)\n  --workbook <path>       Workbook path (default: data-sources/herb_monograph_master.xlsx)\n  --apply                 Write the patch; omitted means validation/dry-run only\n  --out <path>            Output workbook path when applying\n  --in-place              Atomically replace the source workbook when applying\n  --approve-human-review  Confirm review of dosage, safety, interaction, or evidence-grade fields\n  --help                  Show this help\n`)
  process.exit(exitCode)
}

function parseArgs(argv) {
  const args = {
    patch: '',
    workbook: DEFAULT_WORKBOOK,
    apply: false,
    out: '',
    inPlace: false,
    approveHumanReview: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    const next = () => {
      index += 1
      if (index >= argv.length) throw new Error(`Missing value for ${arg}`)
      return argv[index]
    }

    switch (arg) {
      case '--patch':
        args.patch = next()
        break
      case '--workbook':
        args.workbook = next()
        break
      case '--apply':
        args.apply = true
        break
      case '--out':
        args.out = next()
        break
      case '--in-place':
        args.inPlace = true
        break
      case '--approve-human-review':
        args.approveHumanReview = true
        break
      case '--help':
      case '-h':
        usage(0)
        break
      default:
        throw new Error(`Unknown argument: ${arg}`)
    }
  }

  if (!args.patch) throw new Error('--patch is required')
  if (args.out && args.inPlace) throw new Error('Use either --out or --in-place, not both')
  if (args.apply && !args.out && !args.inPlace) {
    throw new Error('--apply requires --out or --in-place')
  }
  if (!args.apply && (args.out || args.inPlace)) {
    throw new Error('--out and --in-place require --apply')
  }

  return args
}

function normalizeText(value) {
  return String(value ?? '').replace(/\r\n/g, '\n')
}

function normalizeSlug(value) {
  return String(value ?? '').trim().toLowerCase()
}

function canonicalColumn(value) {
  return String(value ?? '').trim().toLowerCase()
}

function displayValue(value, maxLength = 110) {
  const text = normalizeText(value).replace(/\s+/g, ' ').trim()
  if (!text) return '(blank)'
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text
}

function readJson(filePath) {
  let parsed
  try {
    parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch (error) {
    throw new Error(`Cannot parse patch JSON ${filePath}: ${error.message}`)
  }
  return parsed
}

function validatePatchStructure(patch, patchPath) {
  const errors = []
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) {
    throw new Error(`${patchPath}: patch root must be an object`)
  }
  if (patch.patch_version !== 1) errors.push('patch_version must equal 1')
  if (!String(patch.id || '').trim()) errors.push('id is required')
  if (!PATCH_STATUSES.has(patch.status)) {
    errors.push(`status must be one of: ${[...PATCH_STATUSES].join(', ')}`)
  }
  if (!Array.isArray(patch.sources) || patch.sources.length === 0) {
    errors.push('sources must contain at least one peer-reviewed source')
  }
  if (!Array.isArray(patch.changes) || patch.changes.length === 0) {
    errors.push('changes must contain at least one proposed cell edit')
  }

  const sourceIds = new Set()
  for (const [index, source] of (patch.sources || []).entries()) {
    const prefix = `sources[${index}]`
    const id = String(source?.id || '').trim()
    const doi = String(source?.doi || '').trim()
    if (!id) errors.push(`${prefix}.id is required`)
    if (id && sourceIds.has(id)) errors.push(`${prefix}.id duplicates ${id}`)
    if (id) sourceIds.add(id)
    if (!DOI_PATTERN.test(doi)) errors.push(`${prefix}.doi is not a valid DOI`)
    if (!String(source?.title || '').trim()) errors.push(`${prefix}.title is required`)
    if (!Number.isInteger(source?.year) || source.year < 1900 || source.year > 2100) {
      errors.push(`${prefix}.year must be a plausible integer year`)
    }
    if (source?.editorial_notice) {
      errors.push(`${prefix} has editorial_notice=${source.editorial_notice}; resolve before use`)
    }
  }

  const changeKeys = new Set()
  for (const [index, change] of (patch.changes || []).entries()) {
    const prefix = `changes[${index}]`
    const slug = normalizeSlug(change?.slug)
    const column = canonicalColumn(change?.column)
    const key = `${slug}::${column}`
    if (!slug) errors.push(`${prefix}.slug is required`)
    if (!column) errors.push(`${prefix}.column is required`)
    if (changeKeys.has(key)) errors.push(`${prefix} duplicates ${key}`)
    changeKeys.add(key)
    if (!Object.prototype.hasOwnProperty.call(change || {}, 'expected_old_value')) {
      errors.push(`${prefix}.expected_old_value is required`)
    }
    if (!Object.prototype.hasOwnProperty.call(change || {}, 'new_value')) {
      errors.push(`${prefix}.new_value is required`)
    }
    if (!CONFIDENCE_LEVELS.has(change?.confidence)) {
      errors.push(`${prefix}.confidence must be one of: ${[...CONFIDENCE_LEVELS].join(', ')}`)
    }
    if (!Array.isArray(change?.source_ids) || change.source_ids.length === 0) {
      errors.push(`${prefix}.source_ids must contain at least one source id`)
    } else {
      for (const sourceId of change.source_ids) {
        if (!sourceIds.has(sourceId)) errors.push(`${prefix}.source_ids references unknown source ${sourceId}`)
      }
    }
    if (!String(change?.rationale || '').trim()) errors.push(`${prefix}.rationale is required`)
    if (PROTECTED_COLUMNS.has(column)) {
      errors.push(`${prefix}.${column} is governance-protected and cannot be changed by workbook patches`)
    }
    if (HUMAN_REVIEW_COLUMNS.has(column) && change?.requires_human_review !== true) {
      errors.push(`${prefix}.${column} must set requires_human_review=true`)
    }
    if (REQUIRED_ENTITY_FIELDS.has(column) && normalizeText(change?.new_value).trim() === '') {
      errors.push(`${prefix}.${column} cannot be blank`)
    }
  }

  if (errors.length > 0) {
    throw new Error(`${patchPath}: invalid workbook patch:\n- ${errors.join('\n- ')}`)
  }
}

async function loadEntityRows(workbookPath) {
  if (!fs.existsSync(workbookPath)) throw new Error(`Workbook not found: ${workbookPath}`)
  const workbook = await readWorkbookExcelJS(workbookPath)
  const sheetNames = workbook.getSheetNames()
  const entitySheet = ENTITY_SHEET_CANDIDATES.find((name) => sheetNames.includes(name))
  if (!entitySheet) {
    throw new Error(
      `Workbook is missing required entity sheet. Looked for: ${ENTITY_SHEET_CANDIDATES.join(', ')}. ` +
      `Present: ${sheetNames.join(', ')}`,
    )
  }
  return { entitySheet, rows: workbook.getSheetData(entitySheet) }
}

function validateAgainstWorkbook(patch, rows, patchPath, entitySheet) {
  const bySlug = new Map()
  for (const row of rows) {
    const slug = normalizeSlug(row.slug)
    if (!slug) continue
    if (!bySlug.has(slug)) bySlug.set(slug, [])
    bySlug.get(slug).push(row)
  }

  const validated = []
  for (const [index, change] of patch.changes.entries()) {
    const slug = normalizeSlug(change.slug)
    const column = String(change.column).trim()
    const matches = bySlug.get(slug) || []
    if (matches.length !== 1) {
      throw new Error(`${patchPath}: changes[${index}] expected one ${slug} row, found ${matches.length}`)
    }
    const row = matches[0]
    if (!Object.prototype.hasOwnProperty.call(row, column)) {
      throw new Error(`${patchPath}: changes[${index}] column ${column} does not exist in ${entitySheet}`)
    }
    const actual = normalizeText(row[column])
    const expected = normalizeText(change.expected_old_value)
    if (patch.status !== 'applied' && actual !== expected) {
      throw new Error(
        `${patchPath}: stale patch for ${slug}.${column}\n` +
        `  expected: ${displayValue(expected)}\n` +
        `  actual:   ${displayValue(actual)}`,
      )
    }
    validated.push({ ...change, slug, column, actual })
  }
  return validated
}

function runNode(scriptPath, args, options = {}) {
  const result = spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
    ...options,
  })
  if (result.status !== 0) {
    const output = [result.stdout, result.stderr].filter(Boolean).join('\n').trim()
    throw new Error(`${path.relative(repoRoot, scriptPath)} failed${output ? `:\n${output}` : ''}`)
  }
  return result.stdout?.trim() || ''
}

function applyPatch({ patch, changes, workbookPath, outPath, inPlace, approveHumanReview, entitySheet }) {
  if (patch.status !== 'approved') {
    throw new Error(`Patch status must be approved before writing; current status is ${patch.status}`)
  }
  const humanReviewChanges = changes.filter((change) => change.requires_human_review === true)
  if (humanReviewChanges.length > 0 && !approveHumanReview) {
    throw new Error(
      `Patch contains ${humanReviewChanges.length} human-review field(s); rerun with --approve-human-review after review`,
    )
  }

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hippie-workbook-patch-'))
  let currentInput = workbookPath
  try {
    for (const [index, change] of changes.entries()) {
      const nextOutput = path.join(tempDir, `step-${String(index + 1).padStart(3, '0')}.xlsx`)
      runNode(EDITOR, [
        '--workbook', currentInput,
        '--sheet', entitySheet,
        '--slug', change.slug,
        '--column', change.column,
        '--value', normalizeText(change.new_value),
        '--out', nextOutput,
      ])
      currentInput = nextOutput
    }

    const finalPath = inPlace ? workbookPath : path.resolve(outPath)
    fs.mkdirSync(path.dirname(finalPath), { recursive: true })
    if (inPlace) {
      const atomicPath = `${workbookPath}.patch-${process.pid}.tmp`
      fs.copyFileSync(currentInput, atomicPath)
      fs.renameSync(atomicPath, workbookPath)
    } else {
      fs.copyFileSync(currentInput, finalPath)
    }

    const schemaOutput = runNode(SCHEMA_VALIDATOR, [], {
      env: {
        ...process.env,
        HERB_XLSX_PATH: finalPath,
        ...(inPlace ? {} : { ALLOW_EXTERNAL_WORKBOOK_PATH: 'true' }),
      },
    })
    if (schemaOutput) console.log(schemaOutput)
    console.log(`[workbook-patch] Applied ${changes.length} change(s) to ${path.relative(repoRoot, finalPath) || finalPath}`)
    console.log('[workbook-patch] Next: npm run data:build:core && npm run guard:source-of-truth')
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true })
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const patchPath = path.resolve(args.patch)
  const workbookPath = path.resolve(args.workbook)
  const patch = readJson(patchPath)
  validatePatchStructure(patch, patchPath)
  const { entitySheet, rows } = await loadEntityRows(workbookPath)
  const changes = validateAgainstWorkbook(patch, rows, patchPath, entitySheet)

  console.log(`[workbook-patch] ${args.apply ? 'APPLY' : 'CHECK'} ${patch.id}: ${changes.length} change(s)`)
  for (const change of changes) {
    const review = change.requires_human_review ? ' [human review]' : ''
    console.log(`- ${change.slug}.${change.column}${review}`)
    console.log(`  old: ${displayValue(change.actual)}`)
    console.log(`  new: ${displayValue(change.new_value)}`)
  }

  if (!args.apply) {
    console.log('[workbook-patch] PASS: proposal matches the current workbook; no file was written.')
    return
  }

  applyPatch({
    patch,
    changes,
    workbookPath,
    outPath: args.out,
    inPlace: args.inPlace,
    approveHumanReview: args.approveHumanReview,
    entitySheet,
  })
}

main().catch((error) => {
  console.error(`[workbook-patch] ERROR: ${error.message}`)
  process.exit(1)
})
