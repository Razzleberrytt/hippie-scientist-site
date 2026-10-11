/**
 * Round 1C: Claim-to-study-to-ingredient relationship index.
 *
 * Builds a reusable, provenance-preserving index from batch results:
 *   claim_id -> { studies: [canonical_ids], ingredient: profile_slug }
 *   study_id -> { claims: [claim_ids], ingredients: [profile_slugs] }
 *   ingredient -> { claims: [claim_ids], studies: [canonical_ids] }
 *
 * All IDs are stable (canonical claim IDs, typed publication identifiers, profile slugs).
 * Provenance is preserved: each relationship records which batch run produced it.
 * No scientific relationships are inferred — only identifier co-occurrence.
 *
 * Publication identifiers are interpreted through the typed identity layer
 * (lib/study-identity.ts): a DOI-canonical identifier never appears inside a
 * PMID field. When no verified PMID association is available, pmid is null.
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

import { sortKeysDeep } from './run-1a'
import { parseStudyIdentity, pmidForIdentity } from '@/lib/study-identity'
import type { BatchManifest } from './run-1b'

export const RELATIONSHIP_SCHEMA_VERSION = 'claim-dna-1c-relationships/0.1'

export type ClaimNode = {
  claim_id: string
  ingredient: string
  studies: string[]
  provenance_status: string
  resolution_status: string
}

export type StudyNode = {
  canonical_id: string
  /** Verified PMID, or null when the identity is DOI-canonical without a verified PMID association. */
  pmid: string | null
  claims: string[]
  ingredients: string[]
}

export type IngredientNode = {
  profile_slug: string
  claims: string[]
  studies: string[]
}

export type RelationshipIndex = {
  schema_version: string
  batch_id: string
  claims: Record<string, ClaimNode>
  studies: Record<string, StudyNode>
  ingredients: Record<string, IngredientNode>
}

function sha256Hex(s: string): string {
  return crypto.createHash('sha256').update(s, 'utf8').digest('hex')
}

export function buildRelationshipIndex(
  manifest: BatchManifest,
  claimIngredients: Map<string, string>,
  pmidByCanonicalRoot: Map<string, string> = new Map(),
): { index: RelationshipIndex; bytes: string; sha256: string } {
  const claims: Record<string, ClaimNode> = {}
  const studies: Record<string, StudyNode> = {}
  const ingredients: Record<string, IngredientNode> = {}

  for (const c of manifest.claims) {
    const ingredient = claimIngredients.get(c.claim_id) ?? '(unknown)'
    claims[c.claim_id] = {
      claim_id: c.claim_id,
      ingredient,
      studies: [...c.canonical_identities].sort(),
      provenance_status: c.provenance_status,
      resolution_status: c.resolution_status,
    }

    // Ingredient node.
    const ing = ingredients[ingredient] ?? { profile_slug: ingredient, claims: [], studies: [] }
    if (!ing.claims.includes(c.claim_id)) ing.claims.push(c.claim_id)
    for (const sid of c.canonical_identities) {
      if (!ing.studies.includes(sid)) ing.studies.push(sid)
    }
    ingredients[ingredient] = ing

    // Study nodes. PMID fields carry verified PMIDs or null — a DOI-canonical
    // identifier is never written into a PMID field.
    for (const sid of c.canonical_identities) {
      const pmid = pmidForIdentity(parseStudyIdentity(sid), pmidByCanonicalRoot)
      const st = studies[sid] ?? { canonical_id: sid, pmid, claims: [], ingredients: [] }
      if (!st.claims.includes(c.claim_id)) st.claims.push(c.claim_id)
      if (!st.ingredients.includes(ingredient)) st.ingredients.push(ingredient)
      studies[sid] = st
    }
  }

  // Sort all arrays for determinism.
  for (const ing of Object.values(ingredients)) {
    ing.claims.sort()
    ing.studies.sort()
  }
  for (const st of Object.values(studies)) {
    st.claims.sort()
    st.ingredients.sort()
  }

  const index = sortKeysDeep({
    schema_version: RELATIONSHIP_SCHEMA_VERSION,
    batch_id: manifest.batch_id,
    claims,
    studies,
    ingredients,
  }) as unknown as RelationshipIndex

  const bytes = JSON.stringify(index, null, 2) + '\n'
  return { index, bytes, sha256: sha256Hex(bytes) }
}

export function writeRelationshipIndex(
  result: { bytes: string },
  root = process.cwd(),
): string {
  const dir = path.join(root, 'ops', 'claim-dna-1c')
  fs.mkdirSync(dir, { recursive: true })
  const p = path.join(dir, 'relationship-index.json')
  fs.writeFileSync(p, result.bytes, 'utf8')
  return p
}
