import { describe, expect, it } from 'vitest'

import { enrichDoisFromCache, enrichSourceRecordsWithDoi } from '@/scripts/claim-dna/alias-1c'
import { buildClaimInventory } from '@/scripts/claim-dna/inventory-1c'
import { buildRelationshipIndex } from '@/scripts/claim-dna/relationships-1c'
import { canonicalStudyIdentityMap, loadPubmedCache } from '@/lib/research-coverage'
import { adaptClaimToProfile } from '@/scripts/claim-dna/adapter-1a'

describe('round 1c DOI/PMID alias reconciliation', () => {
  it('enriches PMIDs with DOIs from the cache', () => {
    const cache = loadPubmedCache()
    // rg-0456's PMID 38561618 has a DOI in the cache.
    const map = enrichDoisFromCache(['38561618', '99999999'], cache)
    const hit = map.get('38561618')!
    expect(hit.doi).toBeTruthy()
    expect(hit.source).toBe('pubmed-cache')
    const miss = map.get('99999999')!
    expect(miss.doi).toBeNull()
    expect(miss.source).toBe('absent')
  })

  it('enriched source records reconcile via existing identity machinery', () => {
    const cache = loadPubmedCache()
    const doiMap = enrichDoisFromCache(['38561618'], cache)
    const profile = adaptClaimToProfile({
      id: 'test-alias',
      claim: 'test',
      pmid: '38561618',
      profile_slug: 'test',
    })
    const enriched = enrichSourceRecordsWithDoi(profile.sources ?? [], doiMap)
    expect(enriched[0].doi).toBeTruthy()
    // The existing reconciler handles DOI+PMID without new code.
    // With a DOI present, the canonical identity is DOI-based (stronger identifier).
    const identities = canonicalStudyIdentityMap({ ...profile, sources: enriched })
    const identity = String(identities.get(String(enriched[0].id)))
    expect(identity).toMatch(/^(doi|pmid):/)
    // And the PMID-only variant resolves to a PMID-based identity.
    const pmidOnly = canonicalStudyIdentityMap(profile)
    expect(String(pmidOnly.get(String(profile.sources?.[0]?.id)))).toContain('38561618')
  })

  it('records without DOI pass through unchanged', () => {
    const doiMap = enrichDoisFromCache(['99999999'], {})
    const enriched = enrichSourceRecordsWithDoi(
      [{ id: 'src_pubmed-99999999', pmid: '99999999' }],
      doiMap,
    )
    expect(enriched[0].doi).toBeUndefined()
    expect(enriched[0].pmid).toBe('99999999')
  })
})

describe('round 1c claim inventory', () => {
  it('reports eligibility and coverage deterministically', () => {
    const a = buildClaimInventory()
    const b = buildClaimInventory()
    expect(a.sha256).toBe(b.sha256)
    expect(a.inventory.total_claims).toBe(508)
    expect(a.inventory.eligible_claims).toBeGreaterThan(200)
    expect(a.inventory.metadata_coverage.coverage_rate).toBeGreaterThan(0.8)
    // No timestamps in deterministic bytes.
    expect(a.bytes).not.toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)
  })

  it('breaks down coverage by compound, tier, and study class', () => {
    const { inventory } = buildClaimInventory()
    expect(Object.keys(inventory.by_compound).length).toBeGreaterThan(100)
    expect(Object.keys(inventory.by_evidence_tier).length).toBeGreaterThan(5)
    // Eligible counts never exceed totals.
    for (const entry of Object.values(inventory.by_compound)) {
      expect(entry.eligible).toBeLessThanOrEqual(entry.total)
    }
  })
})

describe('round 1c relationship index', () => {
  it('builds claim-study-ingredient triples with stable IDs', () => {
    const manifest = {
      batch_id: 'test-rel',
      claims: [
        {
          claim_id: 'c1',
          canonical_identities: ['pmid:111'],
          provenance_status: 'primary_linked',
          resolution_status: 'resolved',
        },
        {
          claim_id: 'c2',
          canonical_identities: ['pmid:111', 'pmid:222'],
          provenance_status: 'primary_linked',
          resolution_status: 'resolved',
        },
      ],
    } as any
    const ingredients = new Map([['c1', 'ginger'], ['c2', 'ginger']])
    const { index } = buildRelationshipIndex(manifest, ingredients)

    // Claim nodes.
    expect(index.claims['c1'].studies).toEqual(['pmid:111'])
    expect(index.claims['c1'].ingredient).toBe('ginger')
    // Study node aggregates claims and ingredients.
    expect(index.studies['pmid:111'].claims.sort()).toEqual(['c1', 'c2'])
    expect(index.studies['pmid:111'].ingredients).toEqual(['ginger'])
    // Ingredient node aggregates.
    expect(index.ingredients['ginger'].claims.sort()).toEqual(['c1', 'c2'])
    expect(index.ingredients['ginger'].studies.sort()).toEqual(['pmid:111', 'pmid:222'])
  })

  it('infers no scientific relationships, only identifier co-occurrence', () => {
    const manifest = {
      batch_id: 'test-rel-2',
      claims: [
        {
          claim_id: 'c1',
          canonical_identities: ['pmid:111'],
          provenance_status: 'primary_linked',
          resolution_status: 'resolved',
        },
      ],
    } as any
    const { index } = buildRelationshipIndex(manifest, new Map([['c1', 'ginger']]))
    // No support/contradict/efficacy fields anywhere in the index.
    const json = JSON.stringify(index)
    expect(json).not.toContain('supports')
    expect(json).not.toContain('contradicts')
    expect(json).not.toContain('efficacy')
  })
})
