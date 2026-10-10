import { describe, expect, it, beforeAll, afterAll } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { runClaimDnaBatch, loadBatchState } from '@/scripts/claim-dna/run-1b'

// Curated 1B slice: covers cached, packed, uncached, and shared-PMID claims.
const BATCH_ID = 'test-batch-1b'
const CLAIM_IDS = ['rg-0456', 'rg-0291', 'study-row-10', 'rg-0344', 'rg-0345']

describe('round 1b batch orchestration', () => {
  it('processes multiple claims reusing the 1A pipeline', () => {
    const { manifest, results } = runClaimDnaBatch({ batchId: BATCH_ID, claimIds: CLAIM_IDS })
    expect(results).toHaveLength(5)
    expect(manifest.aggregate_metrics.total_claims_processed).toBe(5)
    // Every claim went through the 1A pipeline: statuses present, no auto-supports.
    for (const r of results) {
      expect(r.evidence_relationship).toBe('unassessed')
      expect(r.evidence_assessment).toBe('not_evaluated')
      expect(['primary_linked', 'unresolved']).toContain(r.provenance_status)
    }
  })

  it('handles packed PMIDs (multiple identifiers per claim)', () => {
    const { results } = runClaimDnaBatch({ batchId: `${BATCH_ID}-packed`, claimIds: ['rg-0291'] })
    const r = results[0]
    // rg-0291 has "15070181; 22167571" — two identities, not one.
    expect(r.canonical_identities.length).toBeGreaterThanOrEqual(2)
    expect(r.join_metrics.identity_resolutions).toBeGreaterThanOrEqual(2)
  })

  it('handles absent metadata without failing', () => {
    const { results } = runClaimDnaBatch({ batchId: `${BATCH_ID}-uncached`, claimIds: ['study-row-10'] })
    const r = results[0]
    expect(r.resolution_status).toBe('metadata_unavailable')
    expect(r.join_metrics.successful_joins).toBe(0)
    expect(r.join_metrics.unresolved_identifiers).toBeGreaterThanOrEqual(1)
    // Provenance is still recorded even when metadata is absent.
    expect(r.provenance_status).toBe('primary_linked')
  })

  it('deduplicates shared canonical identities across claims', () => {
    const { manifest } = runClaimDnaBatch({ batchId: `${BATCH_ID}-dedup`, claimIds: ['rg-0344', 'rg-0345'] })
    // Both claims cite PMID 34269984 — one shared identity, two referencers.
    const shared = manifest.shared_identities['pmid:34269984']
    expect(shared).toBeDefined()
    expect(shared.referenced_by.sort()).toEqual(['rg-0344', 'rg-0345'])
    expect(manifest.aggregate_metrics.duplicate_identities).toBe(1)
    // Total unique identities < sum of per-claim identities (deduplication worked).
    const perClaimTotal = manifest.claims.reduce((s, c) => s + c.canonical_identities.length, 0)
    expect(manifest.aggregate_metrics.total_publication_identities).toBeLessThanOrEqual(perClaimTotal)
  })

  it('is incremental: second run skips unchanged claims', () => {
    const batchId = `${BATCH_ID}-incremental`
    const first = runClaimDnaBatch({ batchId, claimIds: CLAIM_IDS })
    expect(first.manifest.aggregate_metrics.total_claims_reprocessed).toBe(5)
    expect(first.manifest.aggregate_metrics.total_claims_skipped).toBe(0)

    const second = runClaimDnaBatch({ batchId, claimIds: CLAIM_IDS })
    expect(second.manifest.aggregate_metrics.total_claims_reprocessed).toBe(0)
    expect(second.manifest.aggregate_metrics.total_claims_skipped).toBe(5)
    // Manifest is deterministic across runs (processing_ms excluded from bytes? no —
    // processing_ms IS in the manifest, so bytes differ. SHA of the deterministic
    // *content* excluding timing is stable. We verify claim-level determinism.)
    for (const r of second.results) {
      const prev = first.results.find((p) => p.claim_id === r.claim_id)
      expect(r.artifact_sha256).toBe(prev?.artifact_sha256)
    }
    // State file persists hashes for the next incremental run.
    const state = loadBatchState(process.cwd(), batchId)
    expect(state).not.toBeNull()
    expect(Object.keys(state!.claims)).toHaveLength(5)
  })

  it('reports truthful aggregate metrics', () => {
    const { manifest } = runClaimDnaBatch({ batchId: `${BATCH_ID}-metrics`, claimIds: CLAIM_IDS })
    const m = manifest.aggregate_metrics
    expect(m.total_claims_processed).toBe(5)
    expect(m.successful_metadata_joins).toBeGreaterThanOrEqual(1)
    expect(m.traceability_coverage).toBe(1)
    expect(m.processing_ms).toBeGreaterThanOrEqual(0)
    // Batch-level traceability covers every claim plus the dedup step.
    const claimTraces = manifest.traceability.filter((t) => t.output.startsWith('claim:'))
    expect(claimTraces).toHaveLength(5)
    expect(manifest.traceability.some((t) => t.output === 'shared_identities')).toBe(true)
  })

  it('never infers evidence relationships at batch scale', () => {
    const { manifest } = runClaimDnaBatch({ batchId: `${BATCH_ID}-governance`, claimIds: CLAIM_IDS })
    for (const c of manifest.claims) {
      expect(c.evidence_relationship).not.toBe('supports')
      expect(c.evidence_relationship).not.toBe('contradicts')
      expect(c.evidence_relationship).toBe('unassessed')
    }
  })
})

describe('round 1b malformed records (fixtures)', () => {
  let fixtureRoot: string
  const batchId = 'fixture-batch-1b'

  beforeAll(() => {
    fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'claim-dna-1b-'))
    const claims = [
      { id: 'good-claim', claim: 'Good claim.', pmid: '38561618', profile_slug: 'test' },
      // Missing pmid entirely.
      { id: 'no-pmid', claim: 'Claim without PMID.', profile_slug: 'test' },
      // Empty-string pmid.
      { id: 'empty-pmid', claim: 'Claim with empty PMID.', pmid: '', profile_slug: 'test' },
    ]
    fs.mkdirSync(path.join(fixtureRoot, 'public', 'data'), { recursive: true })
    fs.writeFileSync(
      path.join(fixtureRoot, 'public', 'data', 'claims.json'),
      JSON.stringify(claims),
      'utf8',
    )
    // Minimal cache with the good PMID.
    fs.mkdirSync(path.join(fixtureRoot, 'ops', 'cache'), { recursive: true })
    fs.writeFileSync(
      path.join(fixtureRoot, 'ops', 'cache', 'pubmed-metadata.json'),
      JSON.stringify({ records: { '38561618': { title: 'Fixture Title' } } }),
      'utf8',
    )
    fs.writeFileSync(
      path.join(fixtureRoot, 'ops', 'cache', 'pubmed-abstracts.json'),
      JSON.stringify({ abstracts: {} }),
      'utf8',
    )
    fs.mkdirSync(path.join(fixtureRoot, 'scripts', 'claim-dna'), { recursive: true })
    fs.writeFileSync(
      path.join(fixtureRoot, 'scripts', 'claim-dna', 'adapter-1a.ts'),
      '// fixture adapter',
      'utf8',
    )
  })

  afterAll(() => {
    fs.rmSync(fixtureRoot, { recursive: true, force: true })
  })

  it('handles missing and empty PMIDs gracefully', () => {
    const { results } = runClaimDnaBatch({
      batchId,
      claimIds: ['good-claim', 'no-pmid', 'empty-pmid'],
      root: fixtureRoot,
    })
    expect(results).toHaveLength(3)
    const byId = Object.fromEntries(results.map((r) => [r.claim_id, r]))
    expect(byId['good-claim'].provenance_status).toBe('primary_linked')
    expect(byId['no-pmid'].provenance_status).toBe('unresolved')
    expect(byId['no-pmid'].resolution_status).toBe('not_attempted')
    expect(byId['empty-pmid'].provenance_status).toBe('unresolved')
    // The batch completes; malformed records don't abort processing.
    expect(byId['good-claim'].join_metrics.successful_joins).toBe(1)
  })
})
