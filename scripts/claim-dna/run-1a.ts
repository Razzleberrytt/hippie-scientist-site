/**
 * Round 1A orchestrator: one production claim -> deterministic Claim DNA artifact.
 *
 * Pipeline:
 *   claims.json -> adapter -> ResearchProfile -> identity resolution
 *     -> PubMed cache metadata -> three-state classification -> artifact
 *
 * The artifact is deterministic: sorted keys, no wall-clock timestamps in the
 * bytes. Generation time/size go in a separate audit receipt.
 *
 * Every analytical output carries traceability: which inputs produced it,
 * via which function. A join without traceability is not a verified join.
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

import {
  canonicalStudyIdentityMap,
  loadPubmedCache,
  uniqueClaimStudyIdentities,
  type PubmedCache,
  type ResearchProfile,
} from '@/lib/research-coverage'
import {
  adaptClaimToProfile,
  findProductionClaim,
  loadProductionClaims,
  splitPmids,
} from './adapter-1a'

export const ARTIFACT_SCHEMA_VERSION = 'claim-dna-1a/0.1'
export const GENERATOR_VERSION = 'round-1a-runner/0.1'

export type ProvenanceStatus =
  | 'primary_linked'
  | 'secondary_linked'
  | 'editorial_documented'
  | 'unresolved'
  | 'review_required'
export type ResolutionStatus =
  | 'resolved'
  | 'metadata_unavailable'
  | 'unrecognized_identifier'
  | 'not_attempted'
export type EvidenceAssessment = 'not_evaluated'

export type TraceEntry = {
  output: string
  inputs: string[]
  via: string
}

/** Usable metadata requires at least a title. An empty object (or a record
 * with no title) in the cache is not a successful resolution. */
export function hasUsableMetadata(meta: unknown): boolean {
  if (!meta || typeof meta !== 'object') return false
  const title = String((meta as Record<string, unknown>).title ?? '').trim()
  return title.length > 0
}

function sha256Hex(input: string): string {
  return crypto.createHash('sha256').update(input, 'utf8').digest('hex')
}

/** Recursively sort object keys for deterministic serialization. */
export function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeysDeep)
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const k of Object.keys(value as Record<string, unknown>).sort()) {
      out[k] = sortKeysDeep((value as Record<string, unknown>)[k])
    }
    return out
  }
  return value
}

export type ClaimDnaInput = {
  claimId: string
  root?: string
}

export type ClaimDnaResult = {
  artifact: Record<string, unknown>
  artifactBytes: string
  artifactSha256: string
  trace: TraceEntry[]
}

export function buildClaimDna({ claimId, root = process.cwd() }: ClaimDnaInput): ClaimDnaResult {
  const trace: TraceEntry[] = []

  // 1. Load production claim (input fingerprint).
  const claims = loadProductionClaims(root)
  const claim = findProductionClaim(claims, claimId)
  const claimJson = JSON.stringify(claim)
  const claimHash = sha256Hex(claimJson)
  trace.push({
    output: 'production_claim',
    inputs: [`public/data/claims.json#${claimId}`],
    via: 'loadProductionClaims+findProductionClaim',
  })

  // 2. Adapt to ResearchProfile.
  const rawProfile = adaptClaimToProfile(claim)
  const pmids = splitPmids(String(claim.pmid ?? ''))
  trace.push({
    output: 'synthetic_research_profile',
    inputs: [`public/data/claims.json#${claimId}`],
    via: 'adaptClaimToProfile',
  })

  // 3. The adapter already emits one source record per PMID (splitPmids),
  // so the packed-PMID normalization that listResearchProfiles applies
  // internally is not needed here. Use the adapter output directly.
  const profile: ResearchProfile = rawProfile;
  trace.push({
    output: 'normalized_profile',
    inputs: ['synthetic_research_profile'],
    via: 'adapter emits pre-normalized single-PMID source records',
  })

  // 4. Identity resolution.
  const identities = canonicalStudyIdentityMap(profile)
  const researchClaim = (profile.claimMap ?? [])[0]
  if (!researchClaim) throw new Error('adapter produced no claim')
  const studyIdentities = uniqueClaimStudyIdentities(researchClaim, identities)
  trace.push({
    output: 'canonical_study_identities',
    inputs: (researchClaim.sourceRefIds ?? []).map(String),
    via: 'canonicalStudyIdentityMap+uniqueClaimStudyIdentities',
  })

  // 5. PubMed cache metadata resolution.
  // Only records with usable metadata (non-empty title) count as resolved.
  // An empty object in the cache is metadata_unavailable, not resolved.
  const cache: PubmedCache = loadPubmedCache(root)
  const metadataByPmid: Record<string, Record<string, unknown>> = {}
  const pmidsWithUsableMetadata: string[] = []
  const pmidsWithoutUsableMetadata: string[] = []
  for (const pmid of pmids) {
    const meta = cache[pmid]
    if (hasUsableMetadata(meta)) {
      const { abstract, ...rest } = meta as Record<string, unknown>
      metadataByPmid[pmid] = rest
      pmidsWithUsableMetadata.push(pmid)
      trace.push({
        output: `publication_metadata:${pmid}`,
        inputs: [`ops/cache/pubmed-metadata.json#records.${pmid}`],
        via: 'loadPubmedCache (usable)',
      })
    } else {
      pmidsWithoutUsableMetadata.push(pmid)
      trace.push({
        output: `publication_metadata:${pmid}`,
        inputs: [`ops/cache/pubmed-metadata.json#records.${pmid}`],
        via: 'loadPubmedCache (absent or unusable)',
      })
    }
  }

  // 6. Three-state classification (independent dimensions).
  // provenance_status is about PROVENANCE (does the claim link to source
  // identifiers?), NOT about study design. A meta-analysis with a PMID is
  // primary_linked because its provenance is a direct identifier link —
  // the status must never be read as "this is primary research."
  const provenance_status: ProvenanceStatus =
    pmids.length > 0 ? 'primary_linked' : 'unresolved'
  const resolution_status: ResolutionStatus =
    pmids.length === 0
      ? 'not_attempted'
      : pmidsWithoutUsableMetadata.length === 0
        ? 'resolved'
        : 'metadata_unavailable'
  const evidence_assessment: EvidenceAssessment = 'not_evaluated'
  trace.push({
    output: 'provenance_status',
    inputs: pmids.length > 0 ? [`claims.json:pmid:${claimId}`] : [],
    via: 'pmid presence check',
  })
  trace.push({
    output: 'resolution_status',
    inputs: pmids.map((p) => `ops/cache/pubmed-metadata.json#records.${p}`),
    via: 'cache membership check',
  })
  trace.push({
    output: 'evidence_assessment',
    inputs: [],
    via: 'constant: not evaluated in Round 1',
  })

  // 7. Evidence relationship: NEVER inferred from citation presence.
  const evidence_relationship = 'unassessed'
  trace.push({
    output: 'evidence_relationship',
    inputs: [],
    via: 'constant: directionality requires evidence examination',
  })

  // 7b. Truthful join metrics. A successful metadata join requires BOTH
  // canonical identity resolution AND usable publication metadata.
  // Identity alone (or metadata alone) is not a join.
  const identityPmids = new Set(
    studyIdentities
      .map((id) => String(id).replace(/^pmid:/, ''))
      .filter((p) => /^\d+$/.test(p)),
  )
  const successfulJoinPmids = pmidsWithUsableMetadata.filter((p) => identityPmids.has(p))
  const join_metrics = {
    identity_resolutions: studyIdentities.length,
    metadata_resolutions: pmidsWithUsableMetadata.length,
    unresolved_identifiers: pmidsWithoutUsableMetadata.length,
    successful_joins: successfulJoinPmids.length,
    successful_join_pmids: successfulJoinPmids,
  }
  trace.push({
    output: 'join_metrics',
    inputs: [
      ...studyIdentities.map((id) => `identity:${id}`),
      ...pmidsWithUsableMetadata.map((p) => `metadata:${p}`),
    ],
    via: 'identity+metadata intersection',
  })

  // 8. Input fingerprints for change-driven rebuilds.
  // The adapter fingerprint is content-derived: hash the actual adapter
  // source bytes, not a version string. Any meaningful modification to the
  // adapter changes the fingerprint without a manual version bump.
  // Whole-file hash (implementation) is distinct from per-record hashes.
  const adapterPath = path.join(root, 'scripts', 'claim-dna', 'adapter-1a.ts')
  let adapterBytes = ''
  try {
    adapterBytes = fs.readFileSync(adapterPath, 'utf8')
  } catch {
    // If the adapter file is unavailable, fall back to the generator version
    // so the fingerprint is still present (but weaker).
    adapterBytes = GENERATOR_VERSION
  }
  const cacheJson = JSON.stringify(pmids.map((p) => cache[p] ?? null))
  const input_hashes = {
    'public/data/claims.json': claimHash,
    'ops/cache/pubmed-metadata.json': sha256Hex(cacheJson),
    'scripts/claim-dna/adapter-1a.ts': sha256Hex(adapterBytes),
  }

  const artifact = sortKeysDeep({
    schema_version: ARTIFACT_SCHEMA_VERSION,
    generator_version: GENERATOR_VERSION,
    claim_id: claimId,
    claim_text: String(claim.claim ?? claim.title ?? ''),
    profile_slug: String(claim.profile_slug ?? ''),
    provenance_status,
    resolution_status,
    evidence_assessment,
    evidence_relationship,
    pmids,
    sources: (profile.sources ?? []).map((s) => ({
      id: String(s.id),
      pmid: String(s.pmid ?? ''),
      url: String(s.url ?? ''),
    })),
    analytical_outputs: {
      canonical_study_identities: studyIdentities,
      publication_metadata: metadataByPmid,
    },
    join_metrics,
    traceability: trace,
    input_hashes,
    manifest: {
      source_fingerprints: input_hashes,
      schema_version: ARTIFACT_SCHEMA_VERSION,
      generator_version: GENERATOR_VERSION,
    },
  }) as Record<string, unknown>

  const artifactBytes = JSON.stringify(artifact, null, 2) + '\n'
  return {
    artifact,
    artifactBytes,
    artifactSha256: sha256Hex(artifactBytes),
    trace,
  }
}

export function writeArtifact(
  result: ClaimDnaResult,
  claimId: string,
  root = process.cwd(),
): { artifactPath: string; bytes: number } {
  // Prototype artifacts stage OUTSIDE public/ so they are not web-accessible.
  // public/ files may be served even when no page links to them.
  const dir = path.join(root, 'ops', 'claim-dna-1a')
  fs.mkdirSync(dir, { recursive: true })
  const artifactPath = path.join(dir, `${claimId}.json`)
  fs.writeFileSync(artifactPath, result.artifactBytes, 'utf8')
  return { artifactPath, bytes: Buffer.byteLength(result.artifactBytes, 'utf8') }
}

export function writeAuditReceipt(
  opts: {
    claimId: string
    artifactSha256: string
    bytes: number
    generationMs: number
    joinMetrics: {
      identity_resolutions: number
      metadata_resolutions: number
      unresolved_identifiers: number
      successful_joins: number
    }
  },
  root = process.cwd(),
): string {
  const dir = path.join(root, 'ops', 'claim-dna-1a')
  fs.mkdirSync(dir, { recursive: true })
  const receiptPath = path.join(dir, `${opts.claimId}.audit.json`)
  const receipt = sortKeysDeep({
    claim_id: opts.claimId,
    artifact_sha256: opts.artifactSha256,
    artifact_bytes: opts.bytes,
    generation_ms: opts.generationMs,
    identity_resolutions: opts.joinMetrics.identity_resolutions,
    metadata_resolutions: opts.joinMetrics.metadata_resolutions,
    unresolved_identifiers: opts.joinMetrics.unresolved_identifiers,
    successful_joins: opts.joinMetrics.successful_joins,
    generated_at: new Date().toISOString(),
    generator_version: GENERATOR_VERSION,
  })
  fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2) + '\n', 'utf8')
  return receiptPath
}

// CLI: node scripts/claim-dna/run-1a.ts <claim-id>
const invokedAsScript = process.argv[1]?.endsWith('run-1a.ts')
if (invokedAsScript) {
  const claimId = process.argv[2]
  if (!claimId) {
    console.error('usage: run-1a.ts <claim-id>')
    process.exit(1)
  }
  const t0 = Date.now()
  const result = buildClaimDna({ claimId })
  const { artifactPath, bytes } = writeArtifact(result, claimId)
  const generationMs = Date.now() - t0
  const jm = result.artifact['join_metrics'] as {
    identity_resolutions: number
    metadata_resolutions: number
    unresolved_identifiers: number
    successful_joins: number
  }
  writeAuditReceipt({
    claimId,
    artifactSha256: result.artifactSha256,
    bytes,
    generationMs,
    joinMetrics: jm,
  })
  console.log(`claim-dna 1a: ${claimId} -> ${artifactPath}`)
  console.log(`  sha256: ${result.artifactSha256.slice(0, 16)}... | bytes: ${bytes} | ms: ${generationMs}`)
  console.log(`  identity: ${jm.identity_resolutions} | metadata: ${jm.metadata_resolutions} | unresolved: ${jm.unresolved_identifiers} | joins: ${jm.successful_joins}`)
}
