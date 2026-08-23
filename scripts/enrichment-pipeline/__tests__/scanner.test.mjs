import { describe, expect, it } from 'vitest'
import { canonicalFingerprint } from '../lib/canonical.mjs'
import { filterJobs, scanGaps } from '../lib/scanner.mjs'
import { jobId, shardOf } from '../lib/ids.mjs'
import {
  combineBands,
  compareJobs,
  entityRiskRules,
  jobRiskBand,
  loadPriorityConfig,
  researchBudget,
  valueBand,
} from '../lib/priority.mjs'
import { makeCanonical, publishedHerb } from './fixtures.mjs'

const config = loadPriorityConfig()

describe('deterministic job ids', () => {
  it('depends only on entity and requested field set', () => {
    const a = jobId({ entityType: 'herb', slug: 'x', fields: ['b', 'a'] })
    const b = jobId({ entityType: 'herb', slug: 'x', fields: ['a', 'b', 'a'] })
    expect(a).toBe(b)
  })

  it('changes when the requested field set changes', () => {
    const a = jobId({ entityType: 'herb', slug: 'x', fields: ['a'] })
    const b = jobId({ entityType: 'herb', slug: 'x', fields: ['a', 'b'] })
    expect(a).not.toBe(b)
  })

  it('assigns a stable shard independent of queue order', () => {
    const id = jobId({ entityType: 'herb', slug: 'x', fields: ['a'] })
    expect(shardOf(id, 4)).toBe(shardOf(id, 4))
    expect(shardOf(id, 4)).toBeGreaterThanOrEqual(0)
    expect(shardOf(id, 4)).toBeLessThan(4)
    expect(() => shardOf(id, 0)).toThrow(/positive integer/)
  })
})

describe('gap scanner', () => {
  const canonical = makeCanonical([
    publishedHerb({ slug: 'gap-herb', latin_name: '', keywords: '' }),
    publishedHerb({ slug: 'filled-herb', latin_name: 'Withania somnifera', keywords: 'ashwagandha' }),
    publishedHerb({ slug: 'placeholder-herb', latin_name: 'n/a', keywords: 'tbd' }),
  ])

  it('is read-only against canonical data', () => {
    const before = canonicalFingerprint(canonical)
    scanGaps(canonical)
    expect(canonicalFingerprint(canonical)).toBe(before)
  })

  it('produces byte-identical results on repeated scans', () => {
    expect(JSON.stringify(scanGaps(canonical))).toBe(JSON.stringify(scanGaps(canonical)))
  })

  it('queues missing fields and does not queue populated ones', () => {
    const scan = scanGaps(canonical)
    const latinJobs = scan.jobs.filter((j) => j.requested_fields.includes('latin_name'))
    const slugs = latinJobs.map((j) => j.slug).sort()
    expect(slugs).toEqual(['gap-herb', 'placeholder-herb'])
  })

  it('classifies missing-like placeholders as gaps, not as populated values', () => {
    const scan = scanGaps(canonical)
    const job = scan.jobs.find((j) => j.slug === 'placeholder-herb' && j.requested_fields.includes('latin_name'))
    expect(job.reasons.latin_name).toBe('placeholder')
  })

  it('never queues a prohibited or derived field', () => {
    const scan = scanGaps(canonical)
    const queued = new Set(scan.jobs.flatMap((j) => j.requested_fields))
    for (const forbidden of ['slug', 'runtime_export_decision', 'governance_status', 'net_score', 'source_count']) {
      expect(queued.has(forbidden), forbidden).toBe(false)
    }
  })

  it('skips fields that do not apply to the entity type', () => {
    const compounds = makeCanonical([publishedHerb({ slug: 'a-compound', entity_type: 'compound', latin_name: '' })])
    const scan = scanGaps(compounds)
    expect(scan.jobs.some((j) => j.requested_fields.includes('latin_name'))).toBe(false)
  })

  it('keeps automatic and manual-review work in separate jobs', () => {
    const scan = scanGaps(canonical)
    for (const job of scan.jobs) {
      expect(['automatic', 'manual-review']).toContain(job.mode)
      expect(new Set(job.requested_fields.map(() => job.mode)).size).toBe(1)
    }
  })

  it('does not re-queue a filled cell because of an open gap ticket', () => {
    // An `open` Maintenance_Queue row means "this cell is blank, go find a
    // value". Once the value exists the ticket is stale, not a dispute. Reading
    // it as a dispute means filling the cell never closes the job.
    const filled = makeCanonical([publishedHerb({ slug: 'filled-herb', latin_name: 'Withania somnifera' })], {
      maintenanceRows: [
        { entity_slug: 'filled-herb', issue_area: 'latin_name', status: 'open', priority: 'P1' },
      ],
    })
    const scan = scanGaps(filled)
    expect(scan.jobs.some((j) => j.requested_fields.includes('latin_name'))).toBe(false)
  })

  it('re-queues a filled cell only when a maintenance row disputes the existing value', () => {
    const disputed = makeCanonical([publishedHerb({ slug: 'filled-herb', latin_name: 'Withania somnifera' })], {
      maintenanceRows: [
        {
          entity_slug: 'filled-herb',
          issue_area: 'latin_name',
          status: 'latin_name_present_needs_authority_check',
          priority: 'P1',
        },
      ],
    })
    const job = scanGaps(disputed).jobs.find((j) => j.requested_fields.includes('latin_name'))
    expect(job).toBeTruthy()
    expect(job.reasons.latin_name).toBe('unsupported')
  })

  it('supports filtering by field, band, mode, and entity type', () => {
    const scan = scanGaps(canonical)
    expect(filterJobs(scan.jobs, { field: 'latin_name' }).every((j) => j.requested_fields.includes('latin_name'))).toBe(
      true,
    )
    expect(filterJobs(scan.jobs, { mode: 'automatic' }).every((j) => j.mode === 'automatic')).toBe(true)
    expect(filterJobs(scan.jobs, { entityType: 'compound' })).toHaveLength(0)
  })
})

describe('priority', () => {
  it('does not order the queue alphabetically', () => {
    const canonical = makeCanonical([
      publishedHerb({ slug: 'aaa', latin_name: '', runtime_export_decision: 'hidden_until_grounded', public_search_visibility: 'hidden', seo_indexing_recommendation: 'noindex' }),
      publishedHerb({ slug: 'zzz', latin_name: '', runtime_export_decision: 'primary_runtime_priority', ai_retrieval_priority: 'highest', semantic_priority: 'highest' }),
    ])
    const scan = scanGaps(canonical)
    expect(scan.jobs[0].slug).toBe('zzz')
  })

  it('uses the slug only to break exact ties', () => {
    const a = { priority: 'P2', score: 50, field_priority: 'P2', slug: 'zebra', job_id: 'job_b' }
    const b = { priority: 'P2', score: 50, field_priority: 'P2', slug: 'apple', job_id: 'job_a' }
    expect([a, b].sort(compareJobs)[0].slug).toBe('apple')
  })

  it('lets a safety gap on a published entity reach P0', () => {
    const row = publishedHerb({ contraindications_or_flags: '' })
    const fired = entityRiskRules({ row, runtimeVisibility: 1, hasIntegrityDefect: false }, config)
    expect(jobRiskBand(fired, ['contraindications_or_flags']).band).toBe('P0')
  })

  it('does not promote an unrelated field just because the entity has a safety gap', () => {
    const row = publishedHerb({ contraindications_or_flags: '' })
    const fired = entityRiskRules({ row, runtimeVisibility: 1, hasIntegrityDefect: false }, config)
    expect(jobRiskBand(fired, ['keywords']).band).toBe('P4')
  })

  it('does not raise risk for a hidden entity', () => {
    const row = publishedHerb({
      contraindications_or_flags: '',
      runtime_export_decision: 'hidden_until_grounded',
      public_search_visibility: 'hidden',
      seo_indexing_recommendation: 'noindex',
    })
    const fired = entityRiskRules({ row, runtimeVisibility: 0.05, hasIntegrityDefect: false }, config)
    expect(fired).toHaveLength(0)
  })

  it('raises every job on an entity with a structural defect', () => {
    const fired = entityRiskRules({ row: publishedHerb(), runtimeVisibility: 0, hasIntegrityDefect: true }, config)
    expect(jobRiskBand(fired, ['keywords']).band).toBe('P0')
  })

  it('maps scores onto value bands and never below P4', () => {
    expect(valueBand(90, config)).toBe('P1')
    expect(valueBand(60, config)).toBe('P2')
    expect(valueBand(0, config)).toBe('P4')
  })

  it('lets risk raise urgency but never lower it', () => {
    expect(combineBands({ score: 0, fieldPriority: 'P4', risk: 'P0' }, config)).toBe('P0')
    expect(combineBands({ score: 100, fieldPriority: 'P1', risk: 'P4' }, config)).toBe('P1')
  })

  it('falls back gracefully when no signal resolves', () => {
    const blank = makeCanonical([
      {
        entity_type: 'herb',
        slug: 'blank',
        name: 'Blank',
        latin_name: '',
      },
    ])
    const scan = scanGaps(blank)
    for (const job of scan.jobs) {
      expect(Number.isFinite(job.score)).toBe(true)
      expect(job.score).toBeGreaterThanOrEqual(0)
      expect(job.score).toBeLessThanOrEqual(100)
    }
  })
})

describe('research budgets', () => {
  it('applies the most specific rule', () => {
    const base = researchBudget({ fields: ['secondary_effects'], band: 'P3' }, config)
    const latin = researchBudget({ fields: ['latin_name'], band: 'P3' }, config)
    expect(latin.max_sources_examined).toBeLessThan(base.max_sources_examined)
  })

  it('widens the budget for high-priority bands', () => {
    const p3 = researchBudget({ fields: ['secondary_effects'], band: 'P3' }, config)
    const p0 = researchBudget({ fields: ['secondary_effects'], band: 'P0' }, config)
    expect(p0.max_sources_examined).toBeGreaterThan(p3.max_sources_examined)
    expect(p0.stop_when_supported).toBe(false)
  })

  it('supports declared exceptions and rejects unknown ones', () => {
    const exception = researchBudget({ fields: ['secondary_effects'], band: 'P3', exception: 'literature_review' }, config)
    expect(exception.max_sources_examined).toBe(60)
    expect(() => researchBudget({ fields: [], band: 'P3', exception: 'made-up' }, config)).toThrow(/Unknown research budget/)
  })
})
