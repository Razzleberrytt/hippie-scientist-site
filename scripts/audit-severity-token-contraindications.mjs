#!/usr/bin/env node

// Standing script for a query that has been hand-rolled from scratch in
// numerous separate enrichment cycles (see docs/LOOP_NOTES.md, the
// "severity-tier-only compound contraindications" thread): a population of
// compounds whose `contraindications_or_flags` workbook cell holds a bare
// severity/category token (e.g. "moderate", "kidney", "pregnancy,liver")
// instead of real sourced safety prose. Non-empty tokens like this pass the
// naive "is this field filled?" check in `audit-safety-fill-rate.mjs`, so
// they only ever surfaced via a one-off regex query re-derived by hand each
// cycle. This script formalizes that query so future cycles can just run it.
import { assertWorkbookExists, resolveWorkbookPath } from './workbook-source.mjs'
import { getSheet, readWorkbook, sheetToRows } from './data/workbook-parser.mjs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

const ENTITY_SHEET_CANDIDATES = ['Entity_Master', 'Sheet7']

function clean(value) {
  return String(value ?? '').trim()
}

function slugFor(row, index) {
  return (
    clean(row.slug) ||
    clean(row.canonical_slug) ||
    clean(row.canonicalCompoundId) ||
    clean(row.compoundName) ||
    clean(row.name) ||
    `compound-${index + 1}`
  )
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// A "token" fragment is a bare identifier with no whitespace — real prose
// clauses are always multi-word sentences. A value only counts as
// TOKEN_ONLY when every comma/semicolon-separated fragment matches this
// shape; a single stray real clause among several tokens is enough to
// classify the whole value as PROSE.
const TOKEN_FRAGMENT = /^[a-z][a-z_]*$/i

export function classifyContraindicationValue(rawValue) {
  const value = clean(rawValue)
  if (!value) return 'EMPTY'
  const fragments = value
    .split(/[,;]+/)
    .map((fragment) => fragment.trim())
    .filter(Boolean)
  if (fragments.length > 0 && fragments.every((fragment) => TOKEN_FRAGMENT.test(fragment))) {
    return 'TOKEN_ONLY'
  }
  return 'PROSE'
}

function resolveSheetName(workbook, candidates) {
  return candidates.find((candidate) => getSheet(workbook, candidate)) || null
}

async function loadRuntimeExportDecisions(repoRoot) {
  const compoundsPath = path.join(repoRoot, 'public', 'data', 'compounds.json')
  const raw = await readFile(compoundsPath, 'utf8')
  const compounds = JSON.parse(raw)
  const bySlug = new Map()
  for (const compound of compounds) {
    if (compound?.slug) bySlug.set(compound.slug, compound.runtime_export_decision ?? null)
  }
  return bySlug
}

async function main() {
  const repoRoot = process.cwd()
  const workbookPath = resolveWorkbookPath(repoRoot)
  assertWorkbookExists(workbookPath)
  const workbook = await readWorkbook(workbookPath)

  const entitySheetName = resolveSheetName(workbook, ENTITY_SHEET_CANDIDATES)
  if (!entitySheetName) {
    throw new Error(
      `[audit:severity-tokens] could not find the entity sheet — tried ${ENTITY_SHEET_CANDIDATES.join(', ')}`,
    )
  }
  const rows = sheetToRows(getSheet(workbook, entitySheetName)).filter(
    (row) => clean(row.entity_type).toLowerCase() === 'compound',
  )

  const runtimeDecisions = await loadRuntimeExportDecisions(repoRoot)

  const records = rows.map((row, index) => {
    const slug = slugFor(row, index)
    return {
      slug,
      value: clean(row.contraindications_or_flags),
      status: classifyContraindicationValue(row.contraindications_or_flags),
      runtimeExportDecision: runtimeDecisions.get(slug) ?? null,
    }
  })

  const gaps = records.filter((record) => record.status !== 'PROSE')
  const fullPublicGaps = gaps
    .filter((record) => record.runtimeExportDecision === 'full_public_runtime')
    .sort((a, b) => a.slug.localeCompare(b.slug))

  const lines = [
    'SEVERITY-TOKEN / EMPTY CONTRAINDICATIONS REPORT',
    '================================================',
    `Total compounds in workbook: ${records.length}`,
    `Empty contraindications_or_flags: ${gaps.filter((r) => r.status === 'EMPTY').length}`,
    `Token-only contraindications_or_flags: ${gaps.filter((r) => r.status === 'TOKEN_ONLY').length}`,
    `Real prose: ${records.length - gaps.length}`,
    '',
    `full_public_runtime compounds with a gap (empty or token-only): ${fullPublicGaps.length}`,
    ...fullPublicGaps.map((record) => `  ${record.slug} — ${record.status}${record.value ? ` (${record.value})` : ''}`),
  ]

  console.log(lines.join('\n'))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
