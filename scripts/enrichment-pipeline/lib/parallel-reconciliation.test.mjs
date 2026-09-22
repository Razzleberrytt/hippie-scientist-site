import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import { reconcileParallelSubmissions } from './parallel-reconciliation.mjs'

describe('parallel enrichment reconciliation bridge', () => {
  it('reads both stores without mutating them and emits provenance', () => {
    const legacyBefore = fs.readFileSync('ops/enrichment-submissions.json', 'utf8')
    const result = reconcileParallelSubmissions()
    const legacyAfter = fs.readFileSync('ops/enrichment-submissions.json', 'utf8')

    expect(result.readOnly).toBe(true)
    expect(legacyAfter).toBe(legacyBefore)
    expect(result.summary.legacyCount).toBeGreaterThan(0)
    expect(result.summary.parallelCount).toBeGreaterThan(0)
    for (const row of result.candidates) {
      expect(row.provenance).toEqual(expect.objectContaining({
        submissionId: expect.any(String),
        workpackId: expect.any(String),
        sourceId: expect.any(String),
        reviewDecision: expect.any(String),
      }))
    }
  })

  it('keeps eligible candidates unique by submission id and fingerprint', () => {
    const result = reconcileParallelSubmissions()
    const ids = result.candidates.map(row => row.provenance.submissionId)
    const fingerprints = result.candidates.map(row => row.reconciliation.findingFingerprint)
    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(fingerprints).size).toBe(fingerprints.length)
  })

  it('keeps blocked findings out of the eligible stream', () => {
    const result = reconcileParallelSubmissions()
    for (const row of result.blocked) expect(row.reconciliation.eligible).toBe(false)
  })
  it('surfaces staged missing-registry sources as read-only intake requirements', () => {
    const result = reconcileParallelSubmissions()
    const caffeine = result.sourceIntakeRequirements.filter(row => row.entitySlug === 'caffeine')

    expect(result.summary.sourceIntakeRequirementCount).toBe(result.sourceIntakeRequirements.length)
    expect(caffeine.length).toBeGreaterThanOrEqual(1)
    for (const row of caffeine) {
      expect(row.status).toBe('requires_source_intake')
      expect(row.workpackId).toBe('wp_compound_caffeine')
      expect(row.sourceId).toMatch(/^src_/u)
      expect(row.submissionIds.length).toBeGreaterThan(0)
    }

    const surfaced = new Set(caffeine.flatMap(row => row.submissionIds))
    for (const blocked of result.blocked.filter(row =>
      row.sourceKind === 'parallel' &&
      row.submission?.entitySlug === 'caffeine' &&
      row.reconciliation?.reasons?.includes('source_missing_from_registry')
    )) {
      expect(surfaced.has(blocked.submission.submissionId)).toBe(true)
      expect(blocked.reconciliation.eligible).toBe(false)
    }
  })
})
