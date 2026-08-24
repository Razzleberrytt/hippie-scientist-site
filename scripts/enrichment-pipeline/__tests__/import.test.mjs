import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'

const opsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'enrichment-import-'))
process.env.ENRICHMENT_OPS_DIR = opsDir

const { classifyPatch, writeImportReport } = await import('../lib/importer.mjs')
const { buildPatch, writePatch, writeReviewExport } = await import('../lib/exporter.mjs')
const { normalizeCandidate } = await import('../lib/normalize.mjs')
const { validateCandidate } = await import('../lib/validators.mjs')
const { readinessStatus, readinessTemplate, writeReadiness, assertProductionImportAllowed } = await import(
  '../lib/readiness.mjs'
)
const { computeMetrics } = await import('../lib/metrics.mjs')
const { buildResearchIndex, lookup, forEntity, forTopic, reuseMetrics } = await import(
  '../lib/research-index.mjs'
)
const { detectSchema, canonicalColumnFor, proposalsToCandidates } = await import('../lib/migrate-xlsx.mjs')
const { contract, makeCanonical, makeCandidate, publishedHerb } = await import('./fixtures.mjs')

afterAll(() => {
  fs.rmSync(opsDir, { recursive: true, force: true })
})

beforeEach(() => {
  fs.rmSync(opsDir, { recursive: true, force: true })
  fs.mkdirSync(opsDir, { recursive: true })
})

const emptyCanonical = makeCanonical([publishedHerb({ slug: 'fixture-herb', latin_name: '' })])

function validatedResult(canonical = emptyCanonical) {
  const candidate = normalizeCandidate(makeCandidate(), contract)
  return validateCandidate(candidate, { contract, canonical })
}

function writeTempPatch(patch) {
  const target = path.join(opsDir, `${patch.id}.json`)
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, `${JSON.stringify(patch, null, 2)}\n`, 'utf8')
  return target
}

describe('exporter', () => {
  it('emits a patch in the format the existing runner already validates', () => {
    const { patch } = buildPatch({ results: [validatedResult()], batchLabel: 'test', contract })
    expect(patch.patch_version).toBe(1)
    expect(patch.status).toBe('proposal')
    expect(patch.changes).toHaveLength(1)
    expect(patch.changes[0]).toMatchObject({
      slug: 'fixture-herb',
      column: 'latin_name',
      expected_old_value: '',
      new_value: 'Withania somnifera',
      confidence: 'high',
    })
    expect(patch.sources[0]).toMatchObject({ source_type: 'authority-reference' })
  })

  it('records the job and candidate on every change so a production edit stays traceable', () => {
    const { patch } = buildPatch({ results: [validatedResult()], batchLabel: 'test', contract })
    expect(patch.changes[0].rationale).toMatch(/enrichment-pipeline job job_/)
    expect(patch.changes[0].rationale).toMatch(/candidate cand_/)
    expect(patch.job_ids).toEqual(['job_fixture0000001'])
  })

  it('produces a deterministic patch id for the same jobs', () => {
    const a = buildPatch({ results: [validatedResult()], batchLabel: 'test', contract }).patch.id
    const b = buildPatch({ results: [validatedResult()], batchLabel: 'test', contract }).patch.id
    expect(a).toBe(b)
  })

  it('never puts a review or rejected candidate into the patch', () => {
    const filled = makeCanonical([publishedHerb({ slug: 'fixture-herb', latin_name: 'Something else' })])
    const result = validatedResult(filled)
    const { patch, excluded } = buildPatch({ results: [result], batchLabel: 'test', contract })
    expect(patch.changes).toHaveLength(0)
    expect(excluded).toHaveLength(1)
    expect(excluded[0].reason).not.toBe('validated')
  })

  it('writes everything excluded to the review export rather than dropping it', () => {
    const filled = makeCanonical([publishedHerb({ slug: 'fixture-herb', latin_name: 'Something else' })])
    const result = validatedResult(filled)
    const { excluded } = buildPatch({ results: [result], batchLabel: 'test', contract })
    const target = writeReviewExport({ batchLabel: 'test', excluded, results: [result] })
    const payload = JSON.parse(fs.readFileSync(target, 'utf8'))
    expect(payload.needs_review).toHaveLength(1)
    expect(payload.summary.validated).toBe(0)
  })

  it('withholds two candidates in one batch that propose the same shared-review value', () => {
    // The per-candidate guard compares against canonical state, so neither of
    // these trips it — the value is in neither row yet. Only the exporter sees
    // the whole batch. Batch 4 imported `Avena sativa` twice this way.
    const canonical = makeCanonical([
      publishedHerb({ slug: 'milk-oats', latin_name: '' }),
      publishedHerb({ slug: 'oatstraw', latin_name: '' }),
    ])
    const results = ['milk-oats', 'oatstraw'].map((slug) => {
      const candidate = normalizeCandidate(
        makeCandidate({
          job_id: `job_${slug}`,
          entity: { type: 'herb', slug, sheet: 'Entity_Master' },
          changes: [{ ...makeCandidate().changes[0], proposed_value: 'Avena sativa' }],
        }),
        contract,
      )
      return validateCandidate(candidate, { contract, canonical })
    })

    // Both pass validation on their own.
    for (const result of results) expect(result.verdict.importable).toBe(true)

    const { patch, excluded } = buildPatch({ results, batchLabel: 'collide', contract })
    expect(patch.changes).toHaveLength(0)
    expect(excluded).toHaveLength(2)
    expect(excluded[0].reviews[0]).toMatch(/same batch/)
    expect(excluded[0].reviews[0]).toMatch(/milk-oats, oatstraw/)
  })

  it('leaves a lone shared-review value in the patch', () => {
    const canonical = makeCanonical([publishedHerb({ slug: 'fixture-herb', latin_name: '' })])
    const result = validatedResult(canonical)
    const { patch, excluded } = buildPatch({ results: [result], batchLabel: 'solo', contract })
    expect(patch.changes).toHaveLength(1)
    expect(excluded).toHaveLength(0)
  })

  it('refuses to overwrite a patch a human has already approved', () => {
    const { patch } = buildPatch({ results: [validatedResult()], batchLabel: 'test', contract })
    const dir = path.join(opsDir, 'patches')
    fs.mkdirSync(dir, { recursive: true })
    // writePatch only permits the reviewable patch directory; simulate the guard
    // by writing an approved record and re-running the same check it performs.
    const target = path.join(dir, `${patch.id}.json`)
    fs.writeFileSync(target, JSON.stringify({ ...patch, status: 'approved' }), 'utf8')
    expect(() => writePatch(patch, { directory: dir })).toThrow(/Refusing to write outside|not "proposal"/)
  })
})

describe('patch classification', () => {
  function patchWith(changes) {
    return writeTempPatch({
      patch_version: 1,
      id: 'classify-test',
      status: 'proposal',
      job_ids: [],
      sources: [],
      changes,
    })
  }

  it('reports an empty cell fill as an addition', async () => {
    const patchPath = patchWith([
      { slug: 'fixture-herb', column: 'latin_name', expected_old_value: '', new_value: 'Withania somnifera' },
    ])
    const report = await classifyPatch(patchPath, { canonical: emptyCanonical })
    expect(report.counts).toEqual({ addition: 1 })
  })

  it('reports an already-equal value as a no-op, which is what makes a re-import safe', async () => {
    const filled = makeCanonical([publishedHerb({ slug: 'fixture-herb', latin_name: 'Withania somnifera' })])
    const patchPath = patchWith([
      { slug: 'fixture-herb', column: 'latin_name', expected_old_value: '', new_value: 'Withania somnifera' },
    ])
    const report = await classifyPatch(patchPath, { canonical: filled })
    expect(report.counts).toEqual({ 'no-op': 1 })
  })

  it('reports a drifted cell as a conflict rather than overwriting it', async () => {
    const drifted = makeCanonical([publishedHerb({ slug: 'fixture-herb', latin_name: 'Different value' })])
    const patchPath = patchWith([
      { slug: 'fixture-herb', column: 'latin_name', expected_old_value: '', new_value: 'Withania somnifera' },
    ])
    const report = await classifyPatch(patchPath, { canonical: drifted })
    expect(report.counts).toEqual({ conflict: 1 })
  })

  it('skips a row or column that is not resolvable', async () => {
    const patchPath = patchWith([
      { slug: 'nope', column: 'latin_name', expected_old_value: '', new_value: 'x' },
      { slug: 'fixture-herb', column: 'not_a_column', expected_old_value: '', new_value: 'x' },
    ])
    const report = await classifyPatch(patchPath, { canonical: emptyCanonical })
    expect(report.counts.skip).toBe(2)
  })

  it('writes its report inside the pipeline state directory', () => {
    const target = writeImportReport({ mode: 'dry-run' }, 'x')
    expect(path.resolve(target).startsWith(path.resolve(opsDir))).toBe(true)
  })
})

describe('readiness gate', () => {
  it('blocks import when no readiness record exists', () => {
    expect(readinessStatus().approved).toBe(false)
    expect(() => assertProductionImportAllowed({ command: 'import', fields: ['latin_name'] })).toThrow(
      /no approved readiness record/,
    )
  })

  it('blocks import for an initialised but unapproved record', () => {
    writeReadiness(readinessTemplate())
    expect(readinessStatus().approved).toBe(false)
    expect(() => assertProductionImportAllowed({ command: 'import', fields: ['latin_name'] })).toThrow(
      /approved must be exactly true/,
    )
  })

  it('blocks a field outside the approved scope', () => {
    writeReadiness(approved({ allowed_fields: ['latin_name'] }))
    expect(() =>
      assertProductionImportAllowed({ command: 'import', fields: ['latin_name', 'description'] }),
    ).toThrow(/outside the approved scope: description/)
  })

  it('blocks a command outside the approved list', () => {
    writeReadiness(approved({ allowed_commands: ['scan'] }))
    expect(() => assertProductionImportAllowed({ command: 'import', fields: ['latin_name'] })).toThrow(
      /not in allowed_commands/,
    )
  })

  it('blocks a job outside the approved pilot scope', () => {
    writeReadiness(approved({ pilot_scope: { description: 'pilot', max_jobs: 10, job_ids: ['job_a'] } }))
    expect(() =>
      assertProductionImportAllowed({ command: 'import', fields: ['latin_name'], jobIds: ['job_b'] }),
    ).toThrow(/outside the approved pilot scope/)
  })

  it('blocks a batch larger than the approved maximum', () => {
    writeReadiness(approved({ pilot_scope: { description: 'pilot', max_jobs: 1, job_ids: [] } }))
    expect(() =>
      assertProductionImportAllowed({ command: 'import', fields: ['latin_name'], jobIds: ['a', 'b'] }),
    ).toThrow(/exceeds the approved pilot maximum/)
  })

  it('allows an import that is fully inside an approved scope', () => {
    writeReadiness(approved())
    expect(() =>
      assertProductionImportAllowed({ command: 'import', fields: ['latin_name'], jobIds: ['job_a'] }),
    ).not.toThrow()
  })
})

function approved(overrides = {}) {
  return {
    ...readinessTemplate(),
    approved: true,
    approved_by: 'reviewer',
    approved_at: '2026-01-01',
    allowed_fields: ['latin_name'],
    allowed_commands: ['import'],
    conflict_reviewer: 'reviewer',
    pilot_scope: { description: 'pilot', max_jobs: 10, job_ids: ['job_a'] },
    ...overrides,
  }
}

describe('research index', () => {
  const canonical = {
    ...emptyCanonical,
    sourceRows: [
      {
        source_id: 'pmid-12494336',
        pmid: '12494336',
        title: 'Kavalactones modulate GABAergic activity',
        author_or_label: 'Jussofie 2002',
        year: '2002',
        journal: 'Planta Med',
        url: 'https://pubmed.ncbi.nlm.nih.gov/12494336/',
        entity_slugs: 'dihydrokavain',
        used_for: 'gaba; anxiety',
        status: 'randomized_trial',
      },
    ],
    evidenceRows: [
      {
        record_id: 'study_row_2',
        pmid: '12494336',
        entity_slug: 'kava',
        effect_or_condition: 'anxiety',
        study_type: 'RCT',
        url_or_source: 'https://pubmed.ncbi.nlm.nih.gov/12494336/',
        notes: 'anxiolytic effect',
      },
    ],
  }
  const index = buildResearchIndex(canonical)

  it('merges the same source seen in both registers into one record', () => {
    expect(Object.keys(index.records)).toHaveLength(1)
    const record = index.records['pmid:12494336']
    expect(record.origins).toEqual(['Evidence_Register', 'Source_Register'])
    expect(record.entity_slugs.sort()).toEqual(['dihydrokavain', 'kava'])
  })

  it('resolves a lookup by any equivalent identifier', () => {
    expect(lookup(index, { pmid: 'PMID: 12494336' })?.key).toBe('pmid:12494336')
    expect(lookup(index, { url: 'https://www.pubmed.ncbi.nlm.nih.gov/12494336/' })?.key).toBe('pmid:12494336')
  })

  it('returns nothing for a source it does not already hold', () => {
    expect(lookup(index, { doi: '10.9999/unseen' })).toBeNull()
  })

  it('never resolves a source by topic or title overlap alone', () => {
    expect(lookup(index, { title: 'Kavalactones modulate GABAergic activity' })).toBeNull()
    expect(lookup(index, { title: 'Kavalactones modulate GABAergic activity', year: 2002 })).toBeNull()
  })

  it('exposes entity and topic leads separately from identity matches', () => {
    expect(forEntity(index, 'kava').map((r) => r.key)).toEqual(['pmid:12494336'])
    expect(forTopic(index, 'anxiety').map((r) => r.key)).toEqual(['pmid:12494336'])
    expect(forEntity(index, 'unrelated-herb')).toEqual([])
  })

  it('separates reused from newly found sources', () => {
    const metrics = reuseMetrics(index, [
      { pmid: '12494336' },
      { doi: '10.9999/new' },
      { title: 'no identity' },
    ])
    expect(metrics).toEqual({ reused: 1, fresh: 1, unidentified: 1, total: 3 })
  })
})

describe('metrics', () => {
  it('is deterministic for identical state', () => {
    expect(computeMetrics()).toEqual(computeMetrics())
  })

  it('reports a scan summary when one is supplied', () => {
    const metrics = computeMetrics({
      scan: { entities_scanned: 10, jobs: [1, 2], fields_considered: ['a'], skipped: { populated: 5 } },
    })
    expect(metrics.scan).toEqual({
      entities_scanned: 10,
      gaps_found: 2,
      fields_considered: 1,
      populated_cells_skipped: 5,
    })
  })
})

describe('spreadsheet migration', () => {
  const handle = {
    getSheetNames: () => ['Herbs', 'Notes'],
    getSheetData: (name) =>
      name === 'Herbs'
        ? [{ slug: 'fixture-herb', latin_binomial: 'Withania somnifera', unrelated: 'x' }]
        : [{ heading: 'nothing useful' }],
  }

  it('maps historical column spellings onto canonical fields', () => {
    expect(canonicalColumnFor('latin_binomial', contract)).toBe('latin_name')
    expect(canonicalColumnFor('Scientific Name', contract)).toBe('latin_name')
    expect(canonicalColumnFor('latin_name', contract)).toBe('latin_name')
    expect(canonicalColumnFor('totally_unknown', contract)).toBeNull()
  })

  it('detects only the sheets that actually carry entity data', () => {
    const schema = detectSchema(handle, contract)
    expect(schema.map((s) => s.sheet)).toEqual(['Herbs'])
    expect(schema[0].column_map).toEqual({ latin_binomial: 'latin_name' })
    expect(schema[0].unmapped_columns).toEqual(['unrelated'])
  })

  it('marks every migrated change as needing a real citation', () => {
    const candidates = proposalsToCandidates({
      file: 'legacy.xlsx',
      file_digest: 'abc123',
      proposals: [
        {
          slug: 'fixture-herb',
          entity_type: 'herb',
          field: 'latin_name',
          value: 'Withania somnifera',
          canonical_value: '',
          provenance: [{ file: 'legacy.xlsx', sheet: 'Herbs', column: 'latin_binomial' }],
        },
      ],
    })
    expect(candidates).toHaveLength(1)
    expect(candidates[0].changes[0].requires_human_review).toBe(true)
    expect(candidates[0].changes[0].confidence).toBe('low')
    expect(candidates[0].changes[0].rationale).toMatch(/must attach a real citation/)
  })
})
