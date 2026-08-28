export const ORPHANED_CANONICAL_SOURCE_REFERENCE = 'ORPHANED_CANONICAL_SOURCE_REFERENCE'

function normalizeRefs(raw) {
  return (Array.isArray(raw) ? raw : raw == null ? [] : [raw])
    .map(value => typeof value === 'string' ? value.trim() : String(value?.id || value?.sourceId || '').trim())
    .filter(Boolean)
}

function sourceRefIds(claim) {
  const refs = new Set()
  for (const raw of [claim?.sourceRefIds, claim?.sourceIds, claim?.source_ids, claim?.sources]) {
    for (const ref of normalizeRefs(raw)) refs.add(ref)
  }
  return [...refs]
}

function runtimeCanonicalRefs(record) {
  const refs = new Set()
  const evidenceRefs = normalizeRefs(record?.evidence?.sourceIds)
  for (const value of evidenceRefs) {
    if (/^src_/u.test(value)) refs.add(value)
  }
  for (const claim of Array.isArray(record?.claimMap) ? record.claimMap : []) {
    for (const ref of sourceRefIds(claim)) {
      if (/^src_/u.test(ref)) refs.add(ref)
    }
  }
  return [...refs].sort()
}

export function evaluateRuntimeSourceRegistryReferences(record, kind, sourceRegistry) {
  const registryIds = new Set(
    (Array.isArray(sourceRegistry) ? sourceRegistry : [])
      .map(source => String(source?.sourceId || '').trim())
      .filter(Boolean),
  )

  return runtimeCanonicalRefs(record)
    .filter(sourceId => !registryIds.has(sourceId))
    .map(sourceId => ({
      code: ORPHANED_CANONICAL_SOURCE_REFERENCE,
      blocking: false,
      kind,
      slug: String(record?.slug || ''),
      sourceId,
      url: record?.slug ? `/${kind === 'herb' ? 'herbs' : 'compounds'}/${record.slug}/` : '',
      detail: `Runtime source reference ${sourceId} is absent from public/data/source-registry.json`,
    }))
}
