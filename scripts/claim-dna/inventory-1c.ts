/**
 * Round 1C: Production claim inventory with PMID-linkage and coverage reporting.
 *
 * Scans claims.json and reports:
 *   - total claims, PMID-linked claims, and claims without PMID linkage
 *   - coverage by compound (profile_slug)
 *   - coverage by evidence tier and study class
 *   - PubMed cache metadata coverage for distinct linked PMIDs
 *
 * Terminology note: "without PMID linkage" describes identifier linkage only.
 * It is NOT a statement about scientific provenance — a claim without a PMID
 * can still carry documented provenance through other source identifiers.
 *
 * Deterministic: sorted keys, no timestamps in output bytes.
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

import { loadPubmedCache } from '@/lib/research-coverage'
import { loadProductionClaims, splitPmids } from './adapter-1a'
import { sortKeysDeep } from './run-1a'

export const INVENTORY_SCHEMA_VERSION = 'claim-dna-1c-inventory/0.2'

export type ClaimInventory = {
  schema_version: string
  total_claims: number
  pmid_linked_claims: number
  claims_without_pmid_linkage: number
  without_pmid_linkage_reasons: Record<string, number>
  by_compound: Record<string, { total: number; pmid_linked: number }>
  by_evidence_tier: Record<string, { total: number; pmid_linked: number }>
  by_study_class: Record<string, { total: number; pmid_linked: number }>
  metadata_coverage: {
    distinct_linked_pmids: number
    pmids_in_cache: number
    pmids_with_usable_metadata: number
    coverage_rate: number
  }
  pmid_linked_claim_ids: string[]
}

function sha256Hex(s: string): string {
  return crypto.createHash('sha256').update(s, 'utf8').digest('hex')
}

export function buildClaimInventory(root = process.cwd()): { inventory: ClaimInventory; bytes: string; sha256: string } {
  const claims = loadProductionClaims(root)
  const cache = loadPubmedCache(root)

  const byCompound: Record<string, { total: number; pmid_linked: number }> = {}
  const byTier: Record<string, { total: number; pmid_linked: number }> = {}
  const byStudyClass: Record<string, { total: number; pmid_linked: number }> = {}
  const withoutLinkageReasons: Record<string, number> = {}
  const linkedIds: string[] = []
  const linkedPmids = new Set<string>()

  const bump = (map: Record<string, { total: number; pmid_linked: number }>, key: string, linked: boolean) => {
    const k = key || '(unspecified)'
    map[k] = map[k] ?? { total: 0, pmid_linked: 0 }
    map[k].total++
    if (linked) map[k].pmid_linked++
  }

  for (const claim of claims) {
    const pmids = splitPmids(String(claim.pmid ?? ''))
    const linked = pmids.length > 0
    if (!linked) {
      const reason = !claim.pmid ? 'missing_pmid_field' : 'invalid_pmid_format'
      withoutLinkageReasons[reason] = (withoutLinkageReasons[reason] ?? 0) + 1
    } else {
      linkedIds.push(String(claim.id))
      pmids.forEach((p) => linkedPmids.add(p))
    }
    bump(byCompound, String(claim.profile_slug ?? ''), linked)
    bump(byTier, String(claim.evidence_tier ?? ''), linked)
    bump(byStudyClass, String(claim.study_class ?? ''), linked)
  }

  // Metadata coverage for distinct linked PMIDs. The coverage rate measures
  // usable metadata among distinct linked PMIDs — not among all claims.
  let inCache = 0
  let usable = 0
  for (const pmid of linkedPmids) {
    const rec = cache[pmid] as Record<string, unknown> | undefined
    if (rec && typeof rec === 'object') {
      inCache++
      if (String(rec.title ?? '').trim()) usable++
    }
  }

  const inventory = sortKeysDeep({
    schema_version: INVENTORY_SCHEMA_VERSION,
    total_claims: claims.length,
    pmid_linked_claims: linkedIds.length,
    claims_without_pmid_linkage: claims.length - linkedIds.length,
    without_pmid_linkage_reasons: withoutLinkageReasons,
    by_compound: byCompound,
    by_evidence_tier: byTier,
    by_study_class: byStudyClass,
    metadata_coverage: {
      distinct_linked_pmids: linkedPmids.size,
      pmids_in_cache: inCache,
      pmids_with_usable_metadata: usable,
      coverage_rate: linkedPmids.size > 0 ? usable / linkedPmids.size : 0,
    },
    pmid_linked_claim_ids: [...linkedIds].sort(),
  }) as unknown as ClaimInventory

  const bytes = JSON.stringify(inventory, null, 2) + '\n'
  return { inventory, bytes, sha256: sha256Hex(bytes) }
}

export function writeInventory(
  result: { bytes: string },
  root = process.cwd(),
): string {
  const dir = path.join(root, 'ops', 'claim-dna-1c')
  fs.mkdirSync(dir, { recursive: true })
  const p = path.join(dir, 'inventory.json')
  fs.writeFileSync(p, result.bytes, 'utf8')
  return p
}

// CLI: node scripts/claim-dna/inventory-1c.ts
const invokedAsScript = process.argv[1]?.endsWith('inventory-1c.ts')
if (invokedAsScript) {
  const { inventory, sha256 } = buildClaimInventory()
  const p = writeInventory({ bytes: JSON.stringify(inventory, null, 2) + '\n' })
  console.log(`claim-dna 1c inventory -> ${p}`)
  console.log(`  sha256: ${sha256.slice(0, 16)}...`)
  console.log(`  total: ${inventory.total_claims} | pmid-linked: ${inventory.pmid_linked_claims} (${((inventory.pmid_linked_claims / inventory.total_claims) * 100).toFixed(1)}%)`)
  console.log(`  metadata coverage: ${(inventory.metadata_coverage.coverage_rate * 100).toFixed(1)}% of ${inventory.metadata_coverage.distinct_linked_pmids} distinct linked PMIDs`)
}
