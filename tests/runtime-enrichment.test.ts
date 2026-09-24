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

type Batch = {
  manifestPath: string
  manifest: any
  ledgerPath: string
  ledger?: any
}

const batches: Batch[] = fs.readdirSync(dir)
  .filter((name) => name.endsWith('-manifest.json'))
  .sort()
  .map((name) => {
    const manifestPath = path.join(dir, name)
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
    return {
      manifestPath,
      manifest,
      ledgerPath: path.join(dir, String(manifest?.ledger?.file || '')),
    }
  })

function decodeLedger(batch: Batch) {
  const payload = fs.readFileSync(batch.ledgerPath)
  const raw = batch.ledgerPath.endsWith('.gz')
    ? gunzipSync(payload).toString('utf8')
    : payload.toString('utf8')
  return JSON.parse(raw)
}

function mergedLedger() {
  const merged = { entities: [] as any[], evidence: [] as any[], sources: [] as any[], relationships: [] as any[] }
  for (const batch of batches) {
    const ledger = batch.ledger ?? decodeLedger(batch)
    batch.ledger = ledger
    for (const key of Object.keys(merged) as Array<keyof typeof merged>) merged[key].push(...ledger[key])
  }
  return merged
}

describe('enrichment ledger integrity', () => {
  it('discovers at least one manifest-backed additive batch', () => {
    expect(batches.length).toBeGreaterThan(0)
  })

  it('matches every ledger digest recorded in its own manifest', () => {
    for (const batch of batches) {
      expect(fs.existsSync(batch.ledgerPath), `missing ledger for ${path.basename(batch.manifestPath)}`).toBe(true)
      const payload = fs.readFileSync(batch.ledgerPath)
      expect(payload.length, path.basename(batch.ledgerPath)).toBe(batch.manifest.ledger.bytes)
      expect(createHash('sha256').update(payload).digest('hex'), path.basename(batch.ledgerPath))
        .toBe(batch.manifest.ledger.sha256)
    }
  })

  it('verifies bytes before decoding any ledger payload', () => {
    const parser = fs.readFileSync(path.join(root, 'scripts', 'data', 'workbook-parser.mjs'), 'utf8')
    expect(parser).toContain('verifyLedgerIntegrity')
    expect(parser.indexOf('verifyLedgerIntegrity(payload, manifest'))
      .toBeLessThan(parser.indexOf('parseEnrichmentLedger(payload, ledgerPath)'))
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

describe('manifest-backed additive enrichment ledgers', () => {
  let ledger: ReturnType<typeof mergedLedger>

  beforeAll(() => {
    for (const batch of batches) batch.ledger = decodeLedger(batch)
    ledger = mergedLedger()
  })

  it('matches reviewed counts for every batch', () => {
    for (const batch of batches) {
      expect(batch.ledger.entities, batch.manifest.batch_id).toHaveLength(batch.manifest.counts.entity_context_rows)
      expect(batch.ledger.evidence, batch.manifest.batch_id).toHaveLength(batch.manifest.counts.evidence_rows)
      expect(batch.ledger.sources, batch.manifest.batch_id).toHaveLength(batch.manifest.counts.source_rows)
      expect(batch.ledger.relationships, batch.manifest.batch_id).toHaveLength(batch.manifest.counts.relationship_rows)
    }
  })

  it('keeps entity enrichment additive and outside governance fields', () => {
    for (const row of ledger.entities) {
      expect(row.slug).toBeTruthy()
      for (const key of Object.keys(row)) expect(ALLOWED_ENTITY_CONTEXT.has(key)).toBe(true)
    }
  })

  it('keeps ids unique inside each reviewed batch and preserves source provenance', () => {
    const allSourceIds = new Set(ledger.sources.map((row: any) => row.source_id))
    for (const batch of batches) {
      const evidenceIds = batch.ledger.evidence.map((row: any) => row.record_id)
      const sourceIds = batch.ledger.sources.map((row: any) => row.source_id)
      expect(new Set(evidenceIds).size, batch.manifest.batch_id).toBe(evidenceIds.length)
      expect(new Set(sourceIds).size, batch.manifest.batch_id).toBe(sourceIds.length)
    }

    for (const row of ledger.evidence) {
      expect(row.entity_slug || row.profile_slug).toBeTruthy()
      if (row.source_id) expect(allSourceIds.has(row.source_id)).toBe(true)
      expect(row.pmid || row.doi || row.url_or_source || row.title).toBeTruthy()
    }
  })

  it('applies reviewed net-new rows to the virtual workbook', async () => {
    const workbookPath = resolveWorkbookPath(root)
    const raw = await readWorkbookExcelJS(workbookPath)
    const enriched = await readWorkbook(workbookPath)

    const clean = (value: unknown) => String(value ?? '').replace(/\\s+/g, ' ').trim()
    const slug = (value: unknown) => clean(value)
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\\u0300-\\u036f]/g, '')
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
    const first = (row: any, keys: string[]) => {
      for (const key of keys) if (clean(row?.[key])) return row[key]
      return ''
    }
    const normalizeDoi = (value: unknown) => {
      const doi = clean(value).toLowerCase()
      for (const prefix of ['https://dx.doi.org/', 'http://dx.doi.org/', 'https://doi.org/', 'http://doi.org/']) {
        if (doi.startsWith(prefix)) return doi.slice(prefix.length)
      }
      return doi
    }
    const evidenceKey = (row: any) => {
      const entity = slug(first(row, ['entity_slug', 'profile_slug', 'slug', 'herb_slug', 'compound_slug']))
      const pmid = clean(first(row, ['pmid', 'PMID'])).toLowerCase()
      const doi = clean(first(row, ['doi', 'DOI'])).toLowerCase().replace(/^https?:\\/\\/(?:dx\\.)?doi\\.org\\//, '')
      const title = clean(first(row, ['title', 'study title', 'claim', 'summary', 'supported_claim_language'])).toLowerCase()
      const source = pmid ? `pmid:${pmid}` : doi ? `doi:${doi}` : title ? `title:${title}` : ''
      return entity && source ? `${entity}|${source}` : ''
    }
    const sourceKey = (row: any) => {
      const pmid = clean(first(row, ['pmid', 'PMID'])).toLowerCase()
      const doi = clean(first(row, ['doi', 'DOI'])).toLowerCase().replace(/^https?:\\/\\/(?:dx\\.)?doi\\.org\\//, '')
      const title = clean(first(row, ['title'])).toLowerCase()
      return pmid ? `pmid:${pmid}` : doi ? `doi:${doi}` : title ? `title:${title}` : ''
    }

    const evidenceKeys = new Set(raw.getSheetData('Evidence_Register').map(evidenceKey).filter(Boolean))
    let expectedEvidence = 0
    for (const row of ledger.evidence) {
      const key = evidenceKey(row)
      if (!key || evidenceKeys.has(key)) continue
      evidenceKeys.add(key)
      expectedEvidence += 1
    }

    const sourceKeys = new Set(raw.getSheetData('Source_Register').map(sourceKey).filter(Boolean))
    let expectedSources = 0
    for (const row of ledger.sources) {
      const key = sourceKey(row)
      if (!key || sourceKeys.has(key)) continue
      sourceKeys.add(key)
      expectedSources += 1
    }

    expect(enriched.Sheets.Evidence_Register.length - raw.getSheetData('Evidence_Register').length)
      .toBe(expectedEvidence)
    expect(enriched.Sheets.Source_Register.length - raw.getSheetData('Source_Register').length)
      .toBe(expectedSources)

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
    const expectedTouched = batches.reduce(
      (sum, batch) => sum + Number(batch.manifest.counts.entity_context_rows || 0),
      0,
    )
    expect(touched).toBe(expectedTouched)
  }, 60000)

  it('keeps the Sep 24 medication batch evidence-only and fail-closed by construction', () => {
    const medication = batches.find((batch) => batch.manifest.batch_id === '2026-09-24-medication-anchor-enrichment')
    expect(medication).toBeTruthy()
    expect(medication!.ledger.entities).toEqual([])
    expect(medication!.ledger.relationships).toEqual([])

    const slugs = new Set(medication!.ledger.evidence.map((row: any) => row.entity_slug))
    expect(slugs).toEqual(new Set(['sertraline', 'fluoxetine']))

    const blockedKeys = new Set([
      'runtime_export_decision', 'profile_status', 'robots', 'sitemap_included',
      'indexability_status', 'governance_status', 'affiliate_ready',
    ])
    for (const row of [...medication!.ledger.evidence, ...medication!.ledger.sources]) {
      for (const key of Object.keys(row)) expect(blockedKeys.has(key)).toBe(false)
    }
  })
})
