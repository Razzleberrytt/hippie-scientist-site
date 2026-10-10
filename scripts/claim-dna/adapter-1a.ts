/**
 * Round 1A adapter: production claim -> synthetic ResearchProfile.
 *
 * Read-only over public/data/claims.json. Emits the existing ResearchProfile
 * shape from lib/research-coverage.ts so any consumer of that interface
 * (research-claim-* analytics, suite bridges) works unchanged.
 *
 * Engineering constraint: sourceRefIds must reference synthetic source-record
 * IDs (src_pubmed-{pmid}), NOT raw PMIDs. uniqueClaimStudyIdentities silently
 * drops refs with no matching source record.
 */
import fs from 'node:fs'
import path from 'node:path'

import type { ResearchClaim, ResearchProfile, ResearchSource } from '@/lib/research-coverage'

export type ProductionClaim = Record<string, unknown> & {
  id?: string
  title?: string
  claim?: string
  pmid?: string
  source_url?: string
  evidence_tier?: string
  profile_slug?: string
  study_class?: string
}

export function sourceRecordIdForPmid(pmid: string): string {
  return `src_pubmed-${pmid}`
}

export function pubmedUrlForPmid(pmid: string): string {
  return `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`
}

/** Split packed PMID strings ("15070181; 22167571") into individual PMIDs. */
export function splitPmids(raw: string): string[] {
  return String(raw ?? '')
    .split(/[;,]/)
    .map((p) => p.trim())
    .filter((p) => /^\d+$/.test(p))
}

export function loadProductionClaims(root = process.cwd()): ProductionClaim[] {
  const file = path.join(root, 'public', 'data', 'claims.json')
  const parsed = JSON.parse(fs.readFileSync(file, 'utf8'))
  if (!Array.isArray(parsed)) throw new Error('claims.json is not an array')
  return parsed as ProductionClaim[]
}

export function findProductionClaim(claims: ProductionClaim[], claimId: string): ProductionClaim {
  const claim = claims.find((c) => String(c.id ?? '') === claimId)
  if (!claim) throw new Error(`production claim not found: ${claimId}`)
  return claim
}

/**
 * Adapt one production claim into a synthetic ResearchProfile.
 * The profile is synthetic and analysis-only; claims.json is never modified.
 */
export function adaptClaimToProfile(claim: ProductionClaim): ResearchProfile {
  const claimId = String(claim.id ?? '').trim()
  if (!claimId) throw new Error('production claim has no id')
  const pmids = splitPmids(String(claim.pmid ?? ''))

  const sources: ResearchSource[] = pmids.map((pmid) => ({
    id: sourceRecordIdForPmid(pmid),
    pmid,
    url: pubmedUrlForPmid(pmid),
    // Traceability: record which production field produced this source record.
    _adapterSource: `claims.json:pmid:${claimId}`,
  }))

  const researchClaim: ResearchClaim = {
    id: claimId,
    predicate: String(claim.claim ?? claim.title ?? ''),
    // Production claims are published; the synthetic profile treats them as
    // analyzable. This does not confer approval on the underlying science.
    // Confidence is left undefined: the adapter asserts no certainty level.
    reviewStatus: 'approved',
    sourceRefIds: sources.map((s) => String(s.id)),
    _adapterSource: `claims.json:id:${claimId}`,
  }

  return {
    slug: String(claim.profile_slug ?? 'unknown-profile'),
    sources,
    claimMap: [researchClaim],
    _adapterClaimId: claimId,
  }
}
