import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { classifyRuntimeTrust, loadDeliberateAbstentions, summarize } from './audit-safety-fill-rate.mjs'

const historicalSlugs = [
  'green-tea-egcg-isolated',
  'green-tea-extract',
  'green-tea-extract-egcg',
  'turmeric',
]

describe('safety fill-rate runtime classification', () => {
  it.each(historicalSlugs)('%s requires runtime-owned labelled safety', slug => {
    const sourceOnly = classifyRuntimeTrust({
      slug,
      runtime_export_decision: 'cluster_member_runtime',
      safety_notes: 'Source-only narrative.',
      contraindications_or_flags: 'Readable precaution.',
    })
    const complete = classifyRuntimeTrust({
      slug,
      runtime_export_decision: 'cluster_member_runtime',
      runtime_safety: 'Safety evidence: limited human evidence. Uncertainty remains.',
      safety_notes: 'Source narrative.',
      contraindications_or_flags: 'Readable precaution.',
    })

    expect(sourceOnly).toBe('SOURCE_ONLY_NOT_RUNTIME')
    expect(complete).toBe('RUNTIME_TRUST_COMPLETE')
  })

  it('rejects an invalid empty runtime override', () => {
    expect(classifyRuntimeTrust({
      runtime_export_decision: 'cluster_member_runtime',
      runtime_safety: '',
      safety_notes: 'Source narrative.',
    })).toBe('SOURCE_ONLY_NOT_RUNTIME')
  })
})

describe('deliberate abstention detection', () => {
  function withPatchFixture(patches, fn) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'workbook-patches-'))
    try {
      for (const [name, contents] of Object.entries(patches)) {
        fs.writeFileSync(path.join(dir, name), JSON.stringify(contents))
      }
      return fn(dir)
    } finally {
      fs.rmSync(dir, { recursive: true, force: true })
    }
  }

  it('treats an applied, human-review-flagged blank-flags change as a deliberate abstention', () => {
    withPatchFixture(
      {
        'batch.json': {
          status: 'applied',
          changes: [
            {
              slug: 'bacopaside-ii',
              column: 'contraindications_or_flags',
              new_value: '',
              requires_human_review: true,
              rationale: 'Whole-extract trials cannot establish an isolated-constituent contraindication.',
            },
          ],
        },
      },
      (dir) => {
        const abstentions = loadDeliberateAbstentions(dir)
        expect(abstentions.get('bacopaside-ii')?.patchFile).toBe('batch.json')
      },
    )
  })

  it('ignores proposal-status patches, non-flags columns, and changes without human review', () => {
    withPatchFixture(
      {
        'batch.json': {
          status: 'proposal',
          changes: [{ slug: 'a', column: 'contraindications_or_flags', new_value: '', requires_human_review: true }],
        },
        'batch2.json': {
          status: 'applied',
          changes: [
            { slug: 'b', column: 'safety_notes', new_value: '', requires_human_review: true },
            { slug: 'c', column: 'contraindications_or_flags', new_value: '', requires_human_review: false },
            { slug: 'd', column: 'contraindications_or_flags', new_value: 'pregnancy', requires_human_review: true },
          ],
        },
      },
      (dir) => {
        expect(loadDeliberateAbstentions(dir).size).toBe(0)
      },
    )
  })

  it('excludes a deliberate abstention from summarize gaps but keeps it visible as PRIMARY_ONLY', () => {
    const abstentions = new Map([['betaine', { patchFile: 'safety-coverage-batch-1-2026-07-15.json', rationale: 'insufficient product-specific evidence' }]])
    const rows = [
      { slug: 'betaine', safety_notes: 'Human intervention data were limited.' },
      { slug: 'some-untouched-compound', safety_notes: 'Narrative present.' },
    ]
    const { records } = summarize(rows, 'compound', abstentions)
    const betaine = records.find((r) => r.slug === 'betaine')
    const untouched = records.find((r) => r.slug === 'some-untouched-compound')

    expect(betaine.status).toBe('PRIMARY_ONLY')
    expect(betaine.deliberateAbstention?.patchFile).toBe('safety-coverage-batch-1-2026-07-15.json')
    expect(untouched.status).toBe('PRIMARY_ONLY')
    expect(untouched.deliberateAbstention).toBeNull()
  })
})
