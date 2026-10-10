/**
 * Round 1B orchestrator: multi-claim Claim DNA batch processing.
 *
 * Reuses Round 1A components (buildClaimDna) for each claim; adds:
 *   - batch orchestration over selected claim sets
 *   - cross-claim canonical identity deduplication (provenance preserved per claim)
 *   - incremental rebuilds (hash-based change detection, skip unchanged)
 *   - aggregate metrics and batch-level traceability
 *
 * Design constraints (from 1B requirements):
 *   - Never infer support/approval/quality/causation from citation presence.
 *   - Deterministic: sorted keys, content-derived fingerprints, no wall-clock
 *     in manifest bytes. Timestamps live in the separate audit receipt.
 *   - Private staging: ops/claim-dna-1b/, never public/.
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

import { loadPubmedCache } from '@/lib/research-coverage'
import { findProductionClaim, loadProductionClaims, splitPmids } from './adapter-1a'

import {
  buildClaimDna,
  sortKeysDeep,
  type ClaimDnaResult,
} from './run-1a'

export const BATCH_SCHEMA_VERSION = 'claim-dna-1b/0.1'
export const BATCH_GENERATOR_VERSION = 'round-1b-runner/0.1'

export type BatchClaimResult = {
  claim_id: string
  artifact_sha256: string
  input_hashes: Record<string, string>
  join_metrics: {
    identity_resolutions: number
    metadata_resolutions: number
    unresolved_identifiers: number
    successful_joins: number
  }
  provenance_status: string
  resolution_status: string
  evidence_assessment: string
  evidence_relationship: string
  canonical_identities: string[]
  reprocessed: boolean
}

export type SharedIdentity = {
  canonical_id: string
  pmid: string
  referenced_by: string[]
}

export type BatchManifest = {
  schema_version: string
  generator_version: string
  batch_id: string
  claims: Array<Omit<BatchClaimResult, 'reprocessed'>>
  shared_identities: Record<string, SharedIdentity>
  aggregate_metrics: {
    total_claims_processed: number
    total_publication_identities: number
    successful_metadata_joins: number
    unresolved_identifiers: number
    duplicate_identities: number
    traceability_coverage: number
  }
  traceability: Array<{ output: string; inputs: string[]; via: string }>
}

export type BatchState = {
  batch_id: string
  claims: Record<string, { input_hashes: Record<string, string>; artifact_sha256: string; generator_fingerprint?: string }>
}

function batchDir(root: string): string {
  return path.join(root, 'ops', 'claim-dna-1b')
}

function statePath(root: string, batchId: string): string {
  return path.join(batchDir(root), `${batchId}.state.json`)
}

function manifestPath(root: string, batchId: string): string {
  return path.join(batchDir(root), `${batchId}.manifest.json`)
}

function auditPath(root: string, batchId: string): string {
  return path.join(batchDir(root), `${batchId}.audit.json`)
}

export function loadBatchState(root: string, batchId: string): BatchState | null {
  const p = statePath(root, batchId)
  if (!fs.existsSync(p)) return null
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8')) as BatchState
  } catch {
    return null
  }
}

function hashesEqual(a: Record<string, string>, b: Record<string, string>): boolean {
  const ka = Object.keys(a).sort()
  const kb = Object.keys(b).sort()
  if (ka.length !== kb.length) return false
  return ka.every((k) => a[k] === b[k])
}

export type RunBatchInput = {
  batchId: string
  claimIds: string[]
  root?: string
}

export type RunBatchResult = {
  manifest: BatchManifest
  manifestBytes: string
  manifestSha256: string
  results: BatchClaimResult[]
  run_metrics: {
    total_claims_reprocessed: number
    total_claims_skipped: number
    processing_ms: number
  }
}

function sha256Hex(value: string): string {
  return crypto.createHash('sha256').update(value, 'utf8').digest('hex')
}

export function runClaimDnaBatch({ batchId, claimIds, root = process.cwd() }: RunBatchInput): RunBatchResult {
  const t0 = Date.now()
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/.test(batchId)) throw new Error('invalid batch id')
  if (!Array.isArray(claimIds) || claimIds.length === 0) throw new Error('batch requires claim IDs')
  if (new Set(claimIds).size !== claimIds.length) throw new Error('duplicate claim IDs in batch')
  if (claimIds.some((id) => !/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/.test(id))) throw new Error('invalid claim id')
  const dir = batchDir(root)
  fs.mkdirSync(dir, { recursive: true })

  // Load shared inputs once. Fingerprints exactly mirror Round 1A inputs,
  // allowing unchanged claims to skip expensive buildClaimDna entirely.
  const claims = loadProductionClaims(root)
  const pubmed = loadPubmedCache(root)
  const adapterBytes = fs.readFileSync(path.join(root, 'scripts', 'claim-dna', 'adapter-1a.ts'), 'utf8')
  const adapterHash = sha256Hex(adapterBytes)
  // Recompute outputs if either pipeline implementation changes, even when
  // input claims and metadata are unchanged.
  const generatorFingerprint = sha256Hex(
    fs.readFileSync(path.join(root, 'scripts', 'claim-dna', 'run-1a.ts'), 'utf8') + '\n' +
    fs.readFileSync(path.join(root, 'scripts', 'claim-dna', 'run-1b.ts'), 'utf8'),
  )

  const prevState = loadBatchState(root, batchId)
  const newState: BatchState = { batch_id: batchId, claims: {} }
  const results: BatchClaimResult[] = []
  const batchTrace: BatchManifest['traceability'] = []

  // Deduplication accumulator: canonical_id -> {pmid, referenced_by}
  const identityRefs = new Map<string, { pmid: string; referenced_by: string[] }>()

  for (const claimId of claimIds) {
    const productionClaim = findProductionClaim(claims, claimId)
    const pmids = splitPmids(String(productionClaim.pmid ?? ''))
    const inputHashes: Record<string, string> = {
      'public/data/claims.json': sha256Hex(JSON.stringify(productionClaim)),
      'ops/cache/pubmed-metadata.json': sha256Hex(JSON.stringify(pmids.map((p) => pubmed[p] ?? null))),
      'scripts/claim-dna/adapter-1a.ts': adapterHash,
    }
    const claimPath = path.join(dir, `${claimId}.json`)
    const prev = prevState?.claims?.[claimId]
    let reusedArtifact: Record<string, unknown> | null = null

    // Hash-match alone is insufficient: also verify artifact existence,
    // integrity and readability before claiming a skipped rebuild.
    if (prev && prev.generator_fingerprint === generatorFingerprint && hashesEqual(prev.input_hashes, inputHashes) && fs.existsSync(claimPath)) {
      try {
        const bytes = fs.readFileSync(claimPath, 'utf8')
        if (sha256Hex(bytes) === prev.artifact_sha256) {
          const parsed = JSON.parse(bytes)
          if (parsed && typeof parsed === 'object' && parsed.claim_id === claimId) {
            reusedArtifact = parsed as Record<string, unknown>
          }
        }
      } catch {
        // Corrupt artifacts regenerate through the real Round 1A pipeline.
      }
    }
    const reprocessed = reusedArtifact === null
    let artifact: Record<string, unknown>
    let artifactSha256: string
    if (reprocessed) {
      const dna: ClaimDnaResult = buildClaimDna({ claimId, root })
      artifact = dna.artifact
      artifactSha256 = dna.artifactSha256
      if (!hashesEqual(inputHashes, artifact.input_hashes as Record<string, string>)) {
        throw new Error(`claim input changed during generation: ${claimId}`)
      }
      fs.writeFileSync(claimPath, dna.artifactBytes, 'utf8')
    } else {
      artifact = reusedArtifact!
      artifactSha256 = prev!.artifact_sha256
    }
    newState.claims[claimId] = { input_hashes: inputHashes, artifact_sha256: artifactSha256, generator_fingerprint: generatorFingerprint }

    const joinMetrics = (artifact['join_metrics'] as BatchClaimResult['join_metrics']) ?? {
      identity_resolutions: 0,
      metadata_resolutions: 0,
      unresolved_identifiers: 0,
      successful_joins: 0,
    }
    const canonicalIds = (
      (artifact['analytical_outputs'] as Record<string, unknown>)?.['canonical_study_identities'] as string[] ?? []
    ).map(String)

    // Cross-claim deduplication: track which claims reference each identity.
    // Per-claim provenance is preserved in each claim's own artifact; the
    // batch map only records the sharing relationship.
    for (const cid of canonicalIds) {
      const pmid = cid.replace(/^pmid:/, '')
      const entry = identityRefs.get(cid) ?? { pmid, referenced_by: [] }
      if (!entry.referenced_by.includes(claimId)) entry.referenced_by.push(claimId)
      identityRefs.set(cid, entry)
    }

    batchTrace.push({
      output: `claim:${claimId}`,
      inputs: [`public/data/claims.json#${claimId}`],
      via: 'buildClaimDna (Round 1A; validated artifact)',
    })

    results.push({
      claim_id: claimId,
      artifact_sha256: artifactSha256,
      input_hashes: inputHashes,
      join_metrics: joinMetrics,
      provenance_status: String(artifact['provenance_status'] ?? ''),
      resolution_status: String(artifact['resolution_status'] ?? ''),
      evidence_assessment: String(artifact['evidence_assessment'] ?? ''),
      evidence_relationship: String(artifact['evidence_relationship'] ?? ''),
      canonical_identities: canonicalIds,
      reprocessed,
    })
  }

  // Build the shared-identities map (deduplicated, provenance-preserving).
  const shared_identities: Record<string, SharedIdentity> = {}
  let duplicateCount = 0
  for (const [cid, entry] of [...identityRefs.entries()].sort()) {
    const sortedRefs = [...entry.referenced_by].sort()
    shared_identities[cid] = {
      canonical_id: cid,
      pmid: entry.pmid,
      referenced_by: sortedRefs,
    }
    if (sortedRefs.length > 1) duplicateCount++
  }
  batchTrace.push({
    output: 'shared_identities',
    inputs: results.flatMap((r) => r.canonical_identities.map((id) => `identity:${id}`)),
    via: 'cross-claim canonical identity deduplication',
  })

  // Aggregate metrics.
  const totalJoins = results.reduce((s, r) => s + r.join_metrics.successful_joins, 0)
  const totalUnresolved = results.reduce((s, r) => s + r.join_metrics.unresolved_identifiers, 0)
  const reprocessedCount = results.filter((r) => r.reprocessed).length
  const tracedCount = results.filter((r) => {
    const candidate = path.join(dir, `${r.claim_id}.json`)
    try {
      const dna = JSON.parse(fs.readFileSync(candidate, 'utf8')) as Record<string, unknown>
      const trace = dna['traceability'] as Array<{ output: string }> | undefined
      return Array.isArray(trace) && ['canonical_study_identities', 'join_metrics', 'provenance_status', 'resolution_status', 'evidence_relationship']
        .every((output) => trace.some((entry) => entry.output === output))
    } catch {
      return false
    }
  }).length

  const manifest = sortKeysDeep({
    schema_version: BATCH_SCHEMA_VERSION,
    generator_version: BATCH_GENERATOR_VERSION,
    batch_id: batchId,
    claims: results.map(({ reprocessed: _reprocessed, ...claim }) => claim),
    shared_identities,
    aggregate_metrics: {
      total_claims_processed: results.length,
      total_publication_identities: Object.keys(shared_identities).length,
      successful_metadata_joins: totalJoins,
      unresolved_identifiers: totalUnresolved,
      duplicate_identities: duplicateCount,
      traceability_coverage: results.length > 0 ? tracedCount / results.length : 0,
    },
    traceability: batchTrace,
  }) as unknown as BatchManifest

  const run_metrics = {
    total_claims_reprocessed: reprocessedCount,
    total_claims_skipped: results.length - reprocessedCount,
    processing_ms: Date.now() - t0,
  }
  const manifestBytes = JSON.stringify(manifest, null, 2) + '\n'
  const manifestSha256 = crypto.createHash('sha256').update(manifestBytes, 'utf8').digest('hex')

  // Persist state (for incremental), manifest (deterministic), audit (timestamps).
  fs.writeFileSync(statePath(root, batchId), JSON.stringify(sortKeysDeep(newState), null, 2) + '\n', 'utf8')
  fs.writeFileSync(manifestPath(root, batchId), manifestBytes, 'utf8')
  const audit = sortKeysDeep({
    batch_id: batchId,
    manifest_sha256: manifestSha256,
    generated_at: new Date().toISOString(),
    generator_version: BATCH_GENERATOR_VERSION,
    aggregate_metrics: manifest.aggregate_metrics,
    run_metrics,
  })
  fs.writeFileSync(auditPath(root, batchId), JSON.stringify(audit, null, 2) + '\n', 'utf8')

  return { manifest, manifestBytes, manifestSha256, results, run_metrics }
}

// CLI: node scripts/claim-dna/run-1b.ts <batch-id> <claim-id> [<claim-id>...]
const invokedAsScript = process.argv[1]?.endsWith('run-1b.ts')
if (invokedAsScript) {
  const [batchId, ...claimIds] = process.argv.slice(2)
  if (!batchId || claimIds.length === 0) {
    console.error('usage: run-1b.ts <batch-id> <claim-id> [<claim-id>...]')
    process.exit(1)
  }
  const { manifest, manifestSha256, run_metrics } = runClaimDnaBatch({ batchId, claimIds })
  const m = manifest.aggregate_metrics
  console.log(`claim-dna 1b: batch ${batchId} -> ops/claim-dna-1b/${batchId}.manifest.json`)
  console.log(`  sha256: ${manifestSha256.slice(0, 16)}...`)
  console.log(`  claims: ${m.total_claims_processed} (reprocessed: ${run_metrics.total_claims_reprocessed}, skipped: ${run_metrics.total_claims_skipped})`)
  console.log(`  identities: ${m.total_publication_identities} | joins: ${m.successful_metadata_joins} | unresolved: ${m.unresolved_identifiers} | duplicates: ${m.duplicate_identities}`)
  console.log(`  ms: ${run_metrics.processing_ms} | traceability: ${(m.traceability_coverage * 100).toFixed(0)}%`)
}
