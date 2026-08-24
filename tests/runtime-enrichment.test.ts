import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { gunzipSync } from 'node:zlib'
import { beforeAll, describe, expect, it } from 'vitest'
import { readWorkbookExcelJS } from '../scripts/utils/read-workbook-exceljs.mjs'
import { readWorkbook } from '../scripts/data/workbook-parser.mjs'
import { resolveWorkbookPath } from '../scripts/workbook-source.mjs'
import { countEligibleNewRuntimeRelationships } from '../scripts/tests/runtime-enrichment-relationship-growth.mjs'

const root = process.cwd()
const dir = path.join(root, 'data-sources', 'runtime-enrichment')
const ledgerPath = path.join(dir, '2026-08-23-enrichment.json.gz')
const manifest = JSON.parse(fs.readFileSync(path.join(dir, '2026-08-23-manifest.json'), 'utf8'))

// Loaded lazily. This used to gunzip at module scope, so a corrupt ledger threw
// during import and vitest reported the whole file as unloadable -- no test
// name, no assertion, just a zlib error. Deferring the read lets the integrity
// test below name the actual problem.
let ledger: any

describe('enrichment ledger integrity', () => {
  // The manifest records `ledger.sha256` and `ledger.bytes`; for a while nothing
  // read them, and a ledger truncated to 15,009 of 153,710 bytes reached the
  // repository. It failed loudly by luck -- a truncation on a record boundary
  // can gunzip and parse fine, and this ledger attaches citations to published
  // profiles, so a silently partial import would put unverified evidence on
  // live pages.
  it('matches the digest recorded in its own manifest', () => {
    const compressed = fs.readFileSync(ledgerPath)
    expect(compressed.length).toBe(manifest.ledger.bytes)
    expect(createHash('sha256').update(compressed).digest('hex')).toBe(manifest.ledger.sha256)
  })

  it('is refused by the parser when it does not match', async () => {
    // Guards the guard: proves workbook-parser verifies before decompressing,
    // so deleting the check fails here rather than in production data.
    const parser = fs.readFileSync(
      path.join(root, 'scripts', 'data', 'workbook-parser.mjs'),
      'utf8',
    )
    expect(parser).toContain('verifyLedgerIntegrity')
    expect(parser.indexOf('verifyLedgerIntegrity(compressed)')).toBeLessThan(
      parser.indexOf('gunzipSync(compressed)'),
    )
  })
})

const ALLOWED_ENTITY_CONTEXT = new Set([
  'slug', 'entity_type', 'name',
  'region', 'preparation', 'taxon_scope', 'safety_distinction',
  'preparation_distinction', 'plant_part_context', 'entity_normalization',
  'identity_note', 'found_in', 'formation_context', 'safety_context',
  'source_scope', 'mechanism_context', 'interaction_context',
  'scientific_name_note', 'compound_class_note', 'enrichment_review_note',
  'enrichment_source_urls',
])

describe('Aug 23 additive enrichment ledger', () => {
  // Scoped to this block so the integrity suite above still reports. A
  // file-scope hook fails during collection and skips every test, including
  // the one that would have named the cause.
  beforeAll(() => {
    ledger = JSON.parse(gunzipSync(fs.readFileSync(ledgerPath)).toString('utf8'))
  })

  it('matches reviewed batch counts', () => {
    expect(ledger.entities).toHaveLength(manifest.counts.entity_context_rows)
    expect(ledger.evidence).toHaveLength(manifest.counts.evidence_rows)
    expect(ledger.sources).toHaveLength(manifest.counts.source_rows)
    expect(ledger.relationships).toHaveLength(manifest.counts.relationship_rows)
  })

  it('keeps entity enrichment additive and outside governance fields', () => {
    for (const row of ledger.entities) {
      expect(row.slug).toBeTruthy()
      for (const key of Object.keys(row)) expect(ALLOWED_ENTITY_CONTEXT.has(key)).toBe(true)
    }
  })

  it('has unique evidence/source ids with source provenance', () => {
    const evidenceIds = ledger.evidence.map((row: any) => row.record_id)
    const sourceIds = ledger.sources.map((row: any) => row.source_id)
    expect(new Set(evidenceIds).size).toBe(evidenceIds.length)
    expect(new Set(sourceIds).size).toBe(sourceIds.length)
    const sourceSet = new Set(sourceIds)
    for (const row of ledger.evidence) {
      expect(row.entity_slug || row.profile_slug).toBeTruthy()
      if (row.source_id) expect(sourceSet.has(row.source_id)).toBe(true)
      expect(row.pmid || row.doi || row.url_or_source || row.title).toBeTruthy()
    }
  })

  it('applies only validated net-new rows to the virtual workbook', async () => {
    const workbookPath = resolveWorkbookPath(root)
    const raw = await readWorkbookExcelJS(workbookPath)
    const enriched = await readWorkbook(workbookPath)

    expect(enriched.Sheets.Evidence_Register.length - raw.getSheetData('Evidence_Register').length)
      .toBe(manifest.counts.evidence_rows_after_canonical_dedupe)
    expect(enriched.Sheets.Source_Register.length - raw.getSheetData('Source_Register').length)
      .toBe(manifest.counts.source_rows_after_canonical_dedupe)

    const expectedRelationshipGrowth = countEligibleNewRuntimeRelationships(
      raw.getSheetData('Entity_Master'),
      raw.getSheetData('Entity_Relationships'),
      ledger.relationships,
    )
    expect(enriched.Sheets.Entity_Relationships.length - raw.getSheetData('Entity_Relationships').length)
      .toBe(expectedRelationshipGrowth)

    const bySlug = new Map(enriched.Sheets.Entity_Master.map((row: any) => [row.slug, row]))
    const rawBySlug = new Map(raw.getSheetData('Entity_Master').map((row: any) => [row.slug, row]))
    let touched = 0
    for (const overlay of ledger.entities) {
      const resolved: any = bySlug.get(overlay.slug)
      const canonical: any = rawBySlug.get(overlay.slug)
      expect(resolved).toBeTruthy()
      expect(canonical).toBeTruthy()
      const contextKeys = Object.keys(overlay).filter((key) => !['slug', 'entity_type', 'name'].includes(key))
      if (contextKeys.some((key) => resolved[key] && !canonical[key])) touched += 1
    }
    expect(touched).toBe(manifest.counts.entity_context_rows)
    // Two full workbook reads. ExcelJS fails on this workbook's
    // namespace-prefixed OOXML and falls back to a streaming reader that
    // normalizes 14 files first, so this clears 15s alone but not under
    // full-suite parallelism.
  }, 60000)
})
