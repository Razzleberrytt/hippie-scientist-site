import { applyBatch, buildIndex, resolveTarget } from './apply.mjs'
import { contentHash, sourceId, normalizeSeed } from './ids.mjs'

const ACTIVE_REVIEW_STATUSES = new Set(['approved', 'pending', 'needs_review'])
const SAFE_EVIDENCE_OPS = new Set([
  'add_claim',
  'add_safety_warning',
  'add_drug_interaction',
  'add_source',
])

export function slugify(value) {
  return normalizeSeed(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function patchTargetEntity(patch, dataset) {
  const resolved = resolveTarget(patch?.target, buildIndex(dataset))
  if (!resolved.entity) {
    const detail = resolved.ambiguous
      ? `ambiguous ${resolved.by}: ${resolved.ambiguous.join(', ')}`
      : resolved.error || 'unresolved target'
    throw new Error(`${patch?.patch_id || 'patch'}: ${detail}`)
  }
  return resolved.entity
}

export function patchBatchHash(patches) {
  return contentHash(
    [...patches]
      .sort((a, b) => String(a.patch_id).localeCompare(String(b.patch_id)))
      .map((patch) => ({
        patch_id: patch.patch_id,
        original_hash: patch.original_hash,
        target: patch.target,
        operations: patch.operations,
        sources: patch.sources,
      })),
  )
}

export function sourceIdsForPatches(patches) {
  return [...new Set(
    patches.flatMap((patch) =>
      (patch.sources || [])
        .filter((source) => source && typeof source === 'object')
        .map((source) => sourceId(source)),
    ),
  )].sort()
}

function normalizedClaimText(value) {
  return normalizeSeed(value)
}

function hasTraceableSource(source) {
  const url = String(source?.url || '').trim()
  return Boolean(source?.doi || source?.pmid || /^https?:\/\//i.test(url))
}

function claimPreview(patch, operation) {
  const predicate = operation.op === 'add_safety_warning'
    ? 'has_safety_warning'
    : operation.op === 'add_drug_interaction'
      ? 'interacts_with'
      : 'supports_outcome'
  return {
    patch_id: patch.patch_id,
    predicate,
    claim: String(operation.value || operation.field || '').trim(),
    confidence: operation.confidence ?? patch.confidence ?? 0.5,
    evidence_level: operation.evidence_level || (patch.sources?.length ? 'human_obs' : 'none'),
    source_count: patch.sources?.length || 0,
  }
}

export function buildEvidenceReview({ slug, patches, dataset }) {
  if (!slug) throw new Error('slug is required')
  if (!Array.isArray(patches) || patches.length === 0) {
    throw new Error(`no patches found for ${slug}`)
  }

  const normalizedSlug = slugify(slug)
  const entities = patches.map((patch) => patchTargetEntity(patch, dataset))
  const targetIds = [...new Set(entities.map((entity) => entity.id))]
  if (targetIds.length !== 1 || entities[0].slug !== normalizedSlug) {
    throw new Error(`selected patches do not resolve exclusively to ${normalizedSlug}`)
  }

  for (const patch of patches) {
    const unsafe = (patch.operations || []).filter((operation) => !SAFE_EVIDENCE_OPS.has(operation.op))
    if (unsafe.length) {
      throw new Error(`${patch.patch_id}: unsupported evidence-finalize operation(s): ${unsafe.map((operation) => operation.op).join(', ')}`)
    }
    const sources = patch.sources || []
    if (!sources.length) {
      throw new Error(`${patch.patch_id}: evidence-finalize requires at least one traceable source`)
    }
    const untraceable = sources.filter((source) => !hasTraceableSource(source))
    if (untraceable.length) {
      throw new Error(`${patch.patch_id}: every source must have a DOI, PMID, or HTTP(S) URL`)
    }
  }

  const { dataset: plannedDataset, results } = applyBatch(dataset, patches)
  const rejected = results.filter((result) => result.status === 'rejected')
  if (rejected.length) {
    throw new Error(`dry run rejected ${rejected.length} patch(es): ${rejected.map((result) => `${result.patch_id}: ${result.reason}`).join('; ')}`)
  }

  const target = entities[0]
  const previews = patches.flatMap((patch) =>
    patch.operations
      .filter((operation) => ['add_claim', 'add_safety_warning', 'add_drug_interaction'].includes(operation.op))
      .map((operation) => claimPreview(patch, operation)),
  )
  const plannedClaims = plannedDataset.claims.filter((claim) =>
    claim.subject_id === target.id
      && previews.some((preview) =>
        preview.predicate === claim.predicate
          && normalizedClaimText(preview.claim) === normalizedClaimText(claim.object_literal),
      ),
  )
  const approvedClaimIds = [...new Set(plannedClaims.map((claim) => claim.id))].sort()
  const approvedSourceIds = sourceIdsForPatches(patches)

  const existingClaims = dataset.claims
    .filter((claim) => claim.subject_id === target.id && ACTIVE_REVIEW_STATUSES.has(claim.review_status))
    .map((claim) => ({
      id: claim.id,
      review_status: claim.review_status,
      predicate: claim.predicate,
      claim: claim.object_literal || claim.notes || '',
      source_ids: claim.source_ids || [],
      exact_duplicate_of_proposal: previews.some(
        (preview) => preview.predicate === claim.predicate
          && normalizedClaimText(preview.claim) === normalizedClaimText(claim.object_literal),
      ),
    }))
    .sort((a, b) => a.id.localeCompare(b.id))

  const sourceFingerprints = new Map()
  const duplicateSources = []
  for (const patch of patches) {
    for (const source of patch.sources || []) {
      const id = sourceId(source)
      if (sourceFingerprints.has(id)) {
        duplicateSources.push({
          source_id: id,
          first_patch_id: sourceFingerprints.get(id),
          duplicate_patch_id: patch.patch_id,
        })
      } else {
        sourceFingerprints.set(id, patch.patch_id)
      }
    }
  }

  const patchSummaries = patches
    .map((patch) => ({
      patch_id: patch.patch_id,
      original_filename: patch.original_filename,
      requires_review: patch.requires_review,
      confidence: patch.confidence,
      operations: patch.operations.map((operation) => ({
        op: operation.op,
        claim: String(operation.value || operation.field || '').trim(),
        confidence: operation.confidence,
        evidence_level: operation.evidence_level,
      })),
      sources: (patch.sources || []).map((source) => ({
        source_id: sourceId(source),
        doi: source.doi,
        pmid: source.pmid,
        url: source.url,
        title: source.title,
        year: source.year,
      })),
    }))
    .sort((a, b) => a.patch_id.localeCompare(b.patch_id))

  const manifest = {
    schema_version: 1,
    slug: normalizedSlug,
    entity_id: target.id,
    entity_type: target.entity_type,
    batch_hash: patchBatchHash(patches),
    decision: 'pending',
    reviewer: '',
    reviewed_at: null,
    approved_patch_ids: patchSummaries.map((patch) => patch.patch_id),
    approved_claim_ids: approvedClaimIds,
    approved_source_ids: approvedSourceIds,
    deprecated_claim_ids: [],
    deprecated_source_ids: [],
    notes: '',
  }

  return {
    manifest,
    report: {
      slug: normalizedSlug,
      entity_id: target.id,
      entity_type: target.entity_type,
      batch_hash: manifest.batch_hash,
      summary: {
        patches: patches.length,
        proposed_claims: previews.length,
        unique_sources: approvedSourceIds.length,
        dry_run_applied: results.filter((result) => result.status === 'applied').length,
        dry_run_noop: results.filter((result) => result.status === 'noop').length,
        existing_active_claims: existingClaims.length,
        duplicate_sources: duplicateSources.length,
      },
      patches: patchSummaries,
      dry_run: results,
      proposed_claims: previews,
      existing_active_claims: existingClaims,
      duplicate_sources: duplicateSources,
    },
    plannedDataset,
    results,
  }
}

export function validateReviewManifest(manifest, { slug, batchHash, availablePatchIds }) {
  const errors = []
  if (!manifest || typeof manifest !== 'object') errors.push('manifest is missing or invalid')
  if (manifest?.schema_version !== 1) errors.push('schema_version must be 1')
  if (manifest?.slug !== slugify(slug)) errors.push(`manifest slug must be ${slugify(slug)}`)
  if (manifest?.batch_hash !== batchHash) errors.push('manifest batch_hash is stale; regenerate and review again')
  if (manifest?.decision !== 'approved') errors.push('manifest decision must be approved')
  if (!String(manifest?.reviewer || '').trim()) errors.push('manifest reviewer is required')
  if (!manifest?.reviewed_at || Number.isNaN(Date.parse(manifest.reviewed_at))) errors.push('manifest reviewed_at must be a valid timestamp')

  const approvedPatchIds = Array.isArray(manifest?.approved_patch_ids) ? manifest.approved_patch_ids : []
  if (!approvedPatchIds.length) errors.push('approved_patch_ids must not be empty')
  for (const patchId of approvedPatchIds) {
    if (!availablePatchIds.has(patchId)) errors.push(`approved patch is not in the current batch: ${patchId}`)
  }

  for (const key of ['approved_claim_ids', 'approved_source_ids', 'deprecated_claim_ids', 'deprecated_source_ids']) {
    if (!Array.isArray(manifest?.[key])) errors.push(`${key} must be an array`)
  }
  const approvedClaims = new Set(Array.isArray(manifest?.approved_claim_ids) ? manifest.approved_claim_ids : [])
  const approvedSources = new Set(Array.isArray(manifest?.approved_source_ids) ? manifest.approved_source_ids : [])
  for (const id of Array.isArray(manifest?.deprecated_claim_ids) ? manifest.deprecated_claim_ids : []) {
    if (approvedClaims.has(id)) errors.push(`claim cannot be both approved and deprecated: ${id}`)
  }
  for (const id of Array.isArray(manifest?.deprecated_source_ids) ? manifest.deprecated_source_ids : []) {
    if (approvedSources.has(id)) errors.push(`source cannot be both approved and deprecated: ${id}`)
  }

  return { ok: errors.length === 0, errors }
}

function appendReviewProvenance(record, { reviewer, reviewedAt, slug, decision }) {
  const source = `editorial-review:${slug}`
  const provenance = Array.isArray(record.provenance) ? [...record.provenance] : []
  if (!provenance.some((entry) => entry?.source === source && entry?.at === reviewedAt)) {
    provenance.push({ source, at: reviewedAt, reviewer, decision })
  }
  record.provenance = provenance
  record.updated_at = reviewedAt
}

export function applyReviewManifest(dataset, manifest) {
  const next = structuredClone(dataset)
  const reviewer = String(manifest.reviewer).trim()
  const reviewedAt = manifest.reviewed_at
  const targetId = manifest.entity_id
  const approvedClaimIds = new Set(manifest.approved_claim_ids || [])
  const deprecatedClaimIds = new Set(manifest.deprecated_claim_ids || [])
  const approvedSourceIds = new Set(manifest.approved_source_ids || [])
  const deprecatedSourceIds = new Set(manifest.deprecated_source_ids || [])

  const claimById = new Map(next.claims.map((claim) => [claim.id, claim]))
  const sourceById = new Map(next.sources.map((source) => [source.id, source]))

  for (const id of approvedClaimIds) {
    const claim = claimById.get(id)
    if (!claim) throw new Error(`approved claim not found: ${id}`)
    if (claim.subject_id !== targetId) throw new Error(`approved claim belongs to another profile: ${id}`)
    claim.review_status = 'approved'
    appendReviewProvenance(claim, { reviewer, reviewedAt, slug: manifest.slug, decision: 'approved' })
  }

  for (const id of deprecatedClaimIds) {
    const claim = claimById.get(id)
    if (!claim) throw new Error(`deprecated claim not found: ${id}`)
    if (claim.subject_id !== targetId) throw new Error(`cannot deprecate claim from another profile: ${id}`)
    claim.review_status = 'deprecated'
    appendReviewProvenance(claim, { reviewer, reviewedAt, slug: manifest.slug, decision: 'deprecated' })
  }

  for (const id of approvedSourceIds) {
    const source = sourceById.get(id)
    if (!source) throw new Error(`approved source not found: ${id}`)
    source.review_status = 'approved'
    appendReviewProvenance(source, { reviewer, reviewedAt, slug: manifest.slug, decision: 'approved' })
  }

  const deprecatedClaimsAfterDecision = new Set(
    next.claims.filter((claim) => claim.review_status === 'deprecated').map((claim) => claim.id),
  )
  for (const id of deprecatedSourceIds) {
    const source = sourceById.get(id)
    if (!source) throw new Error(`deprecated source not found: ${id}`)
    const activeReferences = next.claims.filter(
      (claim) => (claim.source_ids || []).includes(id) && !deprecatedClaimsAfterDecision.has(claim.id),
    )
    if (activeReferences.length) {
      throw new Error(`cannot deprecate source ${id}; still referenced by active claim(s): ${activeReferences.map((claim) => claim.id).join(', ')}`)
    }
    source.review_status = 'deprecated'
    appendReviewProvenance(source, { reviewer, reviewedAt, slug: manifest.slug, decision: 'deprecated' })
  }

  return next
}

export function verifyFinalizedProfile({ record, manifest }) {
  const errors = []
  if (!record || typeof record !== 'object') return { ok: false, errors: ['detail record missing'] }

  const claims = Array.isArray(record.claimMap) ? record.claimMap : []
  const sources = Array.isArray(record.sources) ? record.sources : []
  const sourceIds = new Set(sources.map((source) => source.id).filter(Boolean))
  const expectedClaimIds = new Set(manifest.approved_claim_ids || [])
  const expectedSourceIds = new Set(manifest.approved_source_ids || [])

  for (const id of expectedClaimIds) {
    const claim = claims.find((candidate) => candidate.id === id)
    if (!claim) errors.push(`approved claim missing from runtime record: ${id}`)
    else if (claim.reviewStatus !== 'approved') errors.push(`runtime claim is not approved: ${id}`)
  }
  for (const id of expectedSourceIds) {
    const source = sources.find((candidate) => candidate.id === id)
    if (!source) errors.push(`approved source missing from runtime record: ${id}`)
    else if (source.reviewStatus !== 'approved') errors.push(`runtime source is not approved: ${id}`)
  }
  for (const claim of claims) {
    for (const sourceRefId of claim.sourceRefIds || []) {
      if (!sourceIds.has(sourceRefId)) errors.push(`claim ${claim.id} references missing source ${sourceRefId}`)
    }
  }
  for (const id of manifest.deprecated_claim_ids || []) {
    if (claims.some((claim) => claim.id === id)) errors.push(`deprecated claim still exported: ${id}`)
  }
  for (const id of manifest.deprecated_source_ids || []) {
    if (sources.some((source) => source.id === id)) errors.push(`deprecated source still exported: ${id}`)
  }
  if (record.evidence?.reviewStatus !== 'sourced') errors.push('runtime evidence reviewStatus must be sourced')

  return { ok: errors.length === 0, errors }
}
