import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * End-to-end proof against the real canonical workbook.
 *
 * Everything up to the import runs against production data read-only. The one
 * step that writes runs against a temporary *copy* of the workbook, so this
 * suite exercises the real atomic writer and the real idempotency guarantee
 * without ever putting canonical data at risk. The final assertion checks that
 * the real workbook is byte-identical to how the suite found it.
 */

const opsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'enrichment-e2e-'))
process.env.ENRICHMENT_OPS_DIR = opsDir

const { loadCanonical, canonicalFingerprint } = await import('../lib/canonical.mjs')
const { loadContract } = await import('../lib/contract.mjs')
const { scanGaps } = await import('../lib/scanner.mjs')
const { buildCandidate } = await import('../lib/candidates.mjs')
const { normalizeCandidate } = await import('../lib/normalize.mjs')
const { validateCandidate } = await import('../lib/validators.mjs')
const { buildPatch } = await import('../lib/exporter.mjs')
const { classifyPatch, dryRun, importPatch } = await import('../lib/importer.mjs')
const { readinessTemplate, writeReadiness } = await import('../lib/readiness.mjs')
const { buildResearchIndex } = await import('../lib/research-index.mjs')
const { buildWorkerBrief } = await import('../lib/worker.mjs')
const { workbookPath } = await import('../lib/paths.mjs')

const contract = loadContract()

let canonical
let job
let workbookBefore
let tempWorkbook
let patchPath

beforeAll(async () => {
  workbookBefore = fs.readFileSync(workbookPath)
  canonical = await loadCanonical()

  const scan = scanGaps(canonical, { contract })
  job = scan.jobs.find((j) => j.mode === 'automatic' && j.requested_fields.join() === 'latin_name')
  expect(job, 'expected at least one automatic latin_name job in the live workbook').toBeTruthy()

  tempWorkbook = path.join(opsDir, 'workbook-copy.xlsx')
  fs.copyFileSync(workbookPath, tempWorkbook)
}, 120_000)

afterAll(() => {
  fs.rmSync(opsDir, { recursive: true, force: true })
})

function candidateForJob() {
  return buildCandidate({
    job,
    worker: 'e2e-test',
    changes: [
      {
        field: 'latin_name',
        operation: 'set',
        current_value: '',
        proposed_value: 'Testus fixturae',
        confidence: 'high',
        evidence_level: 'regulatory-monograph',
        source_ids: ['powo-e2e'],
        rationale: 'Fixture value used to prove the import path end to end.',
      },
    ],
    sources: [
      {
        id: 'powo-e2e',
        class: 'reference-database-authority',
        url: 'https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:000000-0',
        title: 'Testus fixturae',
        year: 2026,
      },
    ],
    clock: () => Date.parse('2026-01-01T00:00:00.000Z'),
  })
}

describe('end to end against the live workbook', () => {
  it('scans the real workbook without mutating it', () => {
    const before = canonicalFingerprint(canonical)
    scanGaps(canonical, { contract })
    expect(canonicalFingerprint(canonical)).toBe(before)
  })

  it('builds a field-limited brief for a real job', () => {
    const index = buildResearchIndex(canonical)
    const brief = buildWorkerBrief({ job, canonical, contract, researchIndex: index })
    expect(brief.requested_fields.map((f) => f.field)).toEqual(['latin_name'])
    expect(brief.entity.slug).toBe(job.slug)
    expect(brief.requested_fields[0].current_value).toBe('')
  })

  it('validates a well-formed candidate against real canonical data', () => {
    const result = validateCandidate(normalizeCandidate(candidateForJob(), contract), { contract, canonical })
    expect(result.verdict.errors).toEqual([])
    expect(result.verdict.status).toBe('validated')
    expect(result.verdict.importable).toBe(true)
  })

  it(
    'produces a patch the existing runner accepts, without touching canonical data',
    async () => {
      const result = validateCandidate(normalizeCandidate(candidateForJob(), contract), { contract, canonical })
      const { patch } = buildPatch({ results: [result], batchLabel: 'e2e', contract })
      patchPath = path.join(opsDir, `${patch.id}.json`)
      fs.writeFileSync(patchPath, `${JSON.stringify(patch, null, 2)}\n`, 'utf8')

      const report = await dryRun(patchPath, { canonical, writeReport: false })
      expect(report.runner_ok, report.runner_output).toBe(true)
      expect(report.workbook_unchanged).toBe(true)
      expect(report.counts).toEqual({ addition: 1 })
    },
    120_000,
  )

  it(
    'applies atomically to a workbook copy and is idempotent on a second run',
    async () => {
      const approvedPatch = { ...JSON.parse(fs.readFileSync(patchPath, 'utf8')), status: 'approved' }
      fs.writeFileSync(patchPath, `${JSON.stringify(approvedPatch, null, 2)}\n`, 'utf8')

      writeReadiness({
        ...readinessTemplate(),
        approved: true,
        approved_by: 'e2e-test',
        approved_at: '2026-01-01',
        allowed_fields: ['latin_name'],
        allowed_commands: ['import'],
        conflict_reviewer: 'e2e-test',
        pilot_scope: { description: 'end-to-end test', max_jobs: 10, job_ids: approvedPatch.job_ids },
      })

      const report = await importPatch(patchPath, { workbook: tempWorkbook })
      expect(report.runner_ok, report.runner_output).toBe(true)
      expect(report.idempotency.verified).toBe(true)

      const second = await importPatch(patchPath, { workbook: tempWorkbook })
      expect(second.counts).toEqual({ 'no-op': 1 })
    },
    240_000,
  )

  it(
    'reports a conflict instead of overwriting a value that changed underneath it',
    async () => {
      // The copy now holds the applied value, so a patch still expecting the
      // original empty cell must be refused rather than re-applied.
      const stale = {
        ...JSON.parse(fs.readFileSync(patchPath, 'utf8')),
        id: 'e2e-stale',
        changes: [
          {
            slug: job.slug,
            column: 'latin_name',
            expected_old_value: '',
            new_value: 'Different value entirely',
            confidence: 'high',
            source_ids: ['powo-e2e'],
            rationale: 'stale patch',
          },
        ],
      }
      const stalePath = path.join(opsDir, 'e2e-stale.json')
      fs.writeFileSync(stalePath, `${JSON.stringify(stale, null, 2)}\n`, 'utf8')

      const report = await classifyPatch(stalePath, { canonical: await loadCanonical({ workbookPath: tempWorkbook, force: true }) })
      expect(report.counts).toEqual({ conflict: 1 })
      await expect(importPatch(stalePath, { workbook: tempWorkbook })).rejects.toThrow(/conflicting change/)
    },
    120_000,
  )

  it('leaves the real canonical workbook byte-identical', () => {
    expect(fs.readFileSync(workbookPath).equals(workbookBefore)).toBe(true)
  })
})
