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
})
