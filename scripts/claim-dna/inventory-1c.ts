/**
 * Round 1C: Production claim inventory with eligibility and coverage reporting.
 *
 * Scans claims.json and reports:
 *   - total claims, eligible (has PMID), ineligible breakdown
 *   - coverage by compound (profile_slug)
 *   - coverage by evidence tier and study class
 *   - PubMed cache metadata coverage for eligible claims
 *
 * Deterministic: sorted keys, no timestamps in output bytes.
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

import { loadPubmedCache } from '@/lib/research-coverage'
import { loadProductionClaims, splitPmids } from './adapter-1a'
import { sortKeysDeep } from './run-1a'

export const INVENTORY_SCHEMA_VERSION = 'claim-dna-1c-inventory/0.1'

export type ClaimInventory = {
  schema_version: string
  total_claims: number
  eligible_claims: number
  ineligible_claims: number
  ineligible_reasons: Record<string, number>
  by_compound: Record<string, { total: number; eligible: number }>
  by_evidence_tier: Record<string, { total: number; eligible: number }>
  by_study_class: Record<string, { total: number; eligible: number }>
  metadata_coverage: {
    eligible_pmids: number
    pmids_in_cache: number
    pmids_with_usable_metadata: number
    coverage_rate: number
  }
  eligible_claim_ids: string[]
}

function sha256Hex(s: string): string {
  return crypto.createHash('sha256').update(s, 'utf8').digest('hex')
}

export function buildClaimInventory(root = process.cwd()): { inventory: ClaimInventory; bytes: string; sha256: string } {
  const claims = loadProductionClaims(root)
  const cache = loadPubmedCache(root)

  const byCompound: Record<string, { total: number; eligible: number }> = {}
  const byTier: Record<string, { total: number; eligible: number }> = {}
  const byStudyClass: Record<string, { total: number; eligible: number }> = {}
  const ineligibleReasons: Record<string, number> = {}
  const eligibleIds: string[] = []
  const eligiblePmids = new Set<string>()

  const bump = (map: Record<string, { total: number; eligible: number }>, key: string, eligible: boolean) => {
    const k = key || '(unspecified)'
    map[k] = map[k] ?? { total: 0, eligible: 0 }
    map[k].total++
    if (eligible) map[k].eligible++
  }

  for (const claim of claims) {
    const pmids = splitPmids(String(claim.pmid ?? ''))
    const eligible = pmids.length > 0
    if (!eligible) {
      const reason = !claim.pmid ? 'missing_pmid' : 'invalid_pmid_format'
      ineligibleReasons[reason] = (ineligibleReasons[reason] ?? 0) + 1
    } else {
      eligibleIds.push(String(claim.id))
      pmids.forEach((p) => eligiblePmids.add(p))
    }
    bump(byCompound, String(claim.profile_slug ?? ''), eligible)
    bump(byTier, String(claim.evidence_tier ?? ''), eligible)
    bump(byStudyClass, String(claim.study_class ?? ''), eligible)
  }

  // Metadata coverage for eligible PMIDs.
  let inCache = 0
  let usable = 0
  for (const pmid of eligiblePmids) {
    const rec = cache[pmid] as Record<string, unknown> | undefined
    if (rec && typeof rec === 'object') {
      inCache++
      if (String(rec.title ?? '').trim()) usable++
    }
  }

  const inventory = sortKeysDeep({
    schema_version: INVENTORY_SCHEMA_VERSION,
    total_claims: claims.length,
    eligible_claims: eligibleIds.length,
    ineligible_claims: claims.length - eligibleIds.length,
    ineligible_reasons: ineligibleReasons,
    by_compound: byCompound,
    by_evidence_tier: byTier,
    by_study_class: byStudyClass,
    metadata_coverage: {
      eligible_pmids: eligiblePmids.size,
      pmids_in_cache: inCache,
      pmids_with_usable_metadata: usable,
      coverage_rate: eligiblePmids.size > 0 ? usable / eligiblePmids.size : 0,
    },
    eligible_claim_ids: [...eligibleIds].sort(),
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
  console.log(`  total: ${inventory.total_claims} | eligible: ${inventory.eligible_claims} (${((inventory.eligible_claims / inventory.total_claims) * 100).toFixed(1)}%)`)
  console.log(`  metadata coverage: ${(inventory.metadata_coverage.coverage_rate * 100).toFixed(1)}%`)
}
