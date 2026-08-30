function ownerKey(owner) {
  return `${owner.entityType}:${owner.slug}`
}

function assertResolver(resolveWorkpack) {
  if (typeof resolveWorkpack !== 'function') {
    throw new Error('canonical_owner_resolution_required: fragment owner reconciliation requires resolveWorkpack')
  }
}

/**
 * Resolve a persisted enrichment submission without rewriting its provenance.
 *
 * Historical fragments may contain a stale workpack token and a newer explicit
 * entity identity. Resolve both independently, then require both paths to land
 * on the same canonical owner. This is intentionally different from new-work
 * admission, where resolveWorkpack() rejects a workpack/entity mismatch before
 * anything is persisted.
 */
export function reconcilePersistedSubmissionOwner(submission, resolveWorkpack) {
  if (submission?.entityType === 'surface') {
    const surfaceId = String(submission.surfaceId ?? '').trim()
    return {
      kind: 'surface',
      submitted: {
        workpackId: submission.workpackId,
        entityType: 'surface',
        surfaceId,
      },
      canonical: {
        workpackId: submission.workpackId,
        entityType: 'surface',
        surfaceId,
      },
      changed: false,
      via: [],
    }
  }

  assertResolver(resolveWorkpack)

  let byWorkpack
  let byEntity
  try {
    byWorkpack = resolveWorkpack({ workpackId: submission?.workpackId })
  } catch (error) {
    throw new Error(
      `persisted_workpack_owner_unresolved: ${submission?.workpackId ?? '(missing)'}: ${error.message}`,
      { cause: error },
    )
  }
  try {
    byEntity = resolveWorkpack({
      entityType: submission?.entityType,
      entitySlug: submission?.entitySlug,
    })
  } catch (error) {
    throw new Error(
      `persisted_entity_owner_unresolved: ${submission?.entityType ?? '(missing)'}:${submission?.entitySlug ?? '(missing)'}: ${error.message}`,
      { cause: error },
    )
  }

  const workpackCanonical = byWorkpack.ownerResolution?.canonical
  const entityCanonical = byEntity.ownerResolution?.canonical
  if (!workpackCanonical || !entityCanonical || ownerKey(workpackCanonical) !== ownerKey(entityCanonical)) {
    throw new Error(
      `persisted_owner_disagreement: ${submission?.workpackId ?? '(missing)'} and ` +
        `${submission?.entityType ?? '(missing)'}:${submission?.entitySlug ?? '(missing)'} resolve to different canonical owners`,
    )
  }

  const canonical = {
    workpackId: workpackCanonical.workpackId,
    entityType: workpackCanonical.entityType,
    slug: workpackCanonical.slug,
  }
  const submitted = {
    workpackId: submission.workpackId,
    entityType: submission.entityType,
    slug: submission.entitySlug,
  }

  return {
    kind: 'profile',
    submitted,
    canonical,
    changed:
      submitted.workpackId !== canonical.workpackId ||
      submitted.entityType !== canonical.entityType ||
      submitted.slug !== canonical.slug,
    via: [
      ...(byWorkpack.ownerResolution?.via ?? []),
      ...(byEntity.ownerResolution?.via ?? []),
    ],
  }
}

export function canonicalTargetKey(submission, reconciliation) {
  if (submission?.entityType === 'surface') return `surface:${submission.surfaceId ?? ''}`
  const canonical = reconciliation?.canonical
  if (!canonical?.entityType || !canonical?.slug) {
    throw new Error('canonical_target_required: non-surface submission must have reconciled canonical identity')
  }
  return `${canonical.entityType}:${canonical.slug}`
}

export function historicalReconciliationKey(fragmentPath, submissionId) {
  return `${fragmentPath}|${submissionId}`
}
