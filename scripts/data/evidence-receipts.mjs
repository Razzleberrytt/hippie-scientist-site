function text(value) {
  return String(value ?? '').trim()
}

function splitPacked(value) {
  return text(value)
    .split(/\s*\|\s*/)
    .map((part) => part.trim())
    .filter(Boolean)
}

function addPmids(target, value) {
  for (const token of text(value).split(/[;,|\s]+/)) {
    if (/^\d{6,9}$/.test(token)) target.add(token)
  }
}

function addDois(target, value) {
  for (const token of splitPacked(value)) {
    const normalized = token
      .replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '')
      .replace(/^doi:\s*/i, '')
      .trim()
    if (/^10\.\d{4,9}\/.+/i.test(normalized)) target.add(normalized.toLowerCase())
  }
}

export function isSelfResolvingSourceId(value) {
  const id = text(value)
  return /^pmid:\d{6,9}$/i.test(id)
    || /^doi:10\.\d{4,9}\/.+/i.test(id)
    || /^https?:\/\//i.test(id)
}

export function sourceIdentifiersFromClaim(claim) {
  const pmids = new Set()
  addPmids(pmids, claim?.pmid)

  for (const url of splitPacked(claim?.source_url)) {
    const matches = url.matchAll(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d{6,9})/gi)
    for (const match of matches) pmids.add(match[1])
  }

  if (pmids.size > 0) {
    return [...pmids].sort().map((pmid) => `pmid:${pmid}`)
  }

  const dois = new Set()
  addDois(dois, claim?.doi)
  for (const url of splitPacked(claim?.source_url)) {
    const match = url.match(/(?:dx\.)?doi\.org\/(10\.\d{4,9}\/.+)$/i)
    if (match) addDois(dois, match[1])
  }

  if (dois.size > 0) {
    return [...dois].sort().map((doi) => `doi:${doi}`)
  }

  return [...new Set(splitPacked(claim?.source_url))].sort()
}

export function buildClaimEvidenceIndex(claims, allowedSlugs = null) {
  const allowed = allowedSlugs ? new Set(allowedSlugs) : null
  const bySlug = new Map()

  for (const claim of Array.isArray(claims) ? claims : []) {
    const slug = text(claim?.profile_slug)
    if (!slug || (allowed && !allowed.has(slug))) continue

    const sourceIds = sourceIdentifiersFromClaim(claim)
    if (!sourceIds.length) continue

    if (!bySlug.has(slug)) {
      bySlug.set(slug, { sourceIds: new Set(), claimIds: new Set() })
    }

    const entry = bySlug.get(slug)
    for (const sourceId of sourceIds) entry.sourceIds.add(sourceId)
    const claimId = text(claim?.id)
    if (claimId) entry.claimIds.add(claimId)
  }

  return new Map(
    [...bySlug.entries()].map(([slug, entry]) => [
      slug,
      {
        sourceIds: [...entry.sourceIds].sort(),
        claimIds: [...entry.claimIds].sort(),
      },
    ]),
  )
}

function sourceEntryIds(source) {
  if (!source) return []
  if (typeof source === 'string') return [text(source)].filter(Boolean)

  const ids = new Set()
  const opaqueId = text(source.id || source.sourceId)
  if (opaqueId) ids.add(opaqueId)

  const pmid = text(source.pmid || source.pubmedId)
  if (/^\d{6,9}$/.test(pmid)) ids.add(`pmid:${pmid}`)

  const doi = text(source.doi)
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '')
    .replace(/^doi:\s*/i, '')
    .toLowerCase()
  if (/^10\.\d{4,9}\/.+/.test(doi)) ids.add(`doi:${doi}`)

  const url = text(source.url || source.href || source.canonicalUrl)
  if (/^https?:\/\//i.test(url)) ids.add(url)

  return [...ids]
}

function sourceEntryIsResolvable(source, registrySourceIds, inactiveRegistrySourceIds) {
  const ids = sourceEntryIds(source)
  if (!ids.length) return false

  const opaqueId = typeof source === 'object' && source
    ? text(source.id || source.sourceId)
    : ''
  if (opaqueId && inactiveRegistrySourceIds.has(opaqueId)) return false

  return ids.some((id) => isSelfResolvingSourceId(id) || registrySourceIds.has(id))
}

function materializedSourceIds(record, registrySourceIds, inactiveRegistrySourceIds) {
  const ids = new Set()
  for (const key of ['sources', 'references', 'citations', 'studies']) {
    const entries = Array.isArray(record?.[key]) ? record[key] : []
    for (const source of entries) {
      if (!sourceEntryIsResolvable(source, registrySourceIds, inactiveRegistrySourceIds)) continue
      for (const id of sourceEntryIds(source)) ids.add(id)
    }
  }
  return ids
}

function referenceIsResolvable(reference, localSourceIds, registrySourceIds) {
  const id = text(reference)
  if (!id) return false
  return isSelfResolvingSourceId(id) || localSourceIds.has(id) || registrySourceIds.has(id)
}

export function hasResolvableEvidence(record, {
  registrySourceIds = new Set(),
  inactiveRegistrySourceIds = new Set(),
} = {}) {
  if (!record || typeof record !== 'object') return false

  const localSourceIds = materializedSourceIds(record, registrySourceIds, inactiveRegistrySourceIds)
  if (localSourceIds.size > 0) return true

  for (const key of ['sourceIds', 'source_ids', 'pmids', 'pubmedIds']) {
    const value = record[key]
    const refs = Array.isArray(value) ? value : typeof value === 'string' ? [value] : []
    if (refs.some((ref) => referenceIsResolvable(ref, localSourceIds, registrySourceIds))) return true
  }

  const evidence = record.evidence
  if (evidence && typeof evidence === 'object') {
    const refs = Array.isArray(evidence.sourceIds) ? evidence.sourceIds : []
    if (refs.some((ref) => referenceIsResolvable(ref, localSourceIds, registrySourceIds))) return true

    for (const bucket of ['human', 'mechanistic', 'safety', 'traditional']) {
      const entries = Array.isArray(evidence[bucket]) ? evidence[bucket] : []
      if (entries.some((entry) => sourceEntryIsResolvable(entry, registrySourceIds, inactiveRegistrySourceIds))) return true
    }
  }

  if (Array.isArray(record.claimMap)) {
    for (const claim of record.claimMap) {
      const refs = [
        ...(Array.isArray(claim?.sourceRefIds) ? claim.sourceRefIds : []),
        ...(Array.isArray(claim?.sourceIds) ? claim.sourceIds : []),
      ]
      if (refs.some((ref) => referenceIsResolvable(ref, localSourceIds, registrySourceIds))) return true
    }
  }

  return false
}

export function hasApprovedClaimSourceReceipt(record, {
  registrySourceIds = new Set(),
  inactiveRegistrySourceIds = new Set(),
} = {}) {
  if (!record || typeof record !== 'object') return false

  const approvedSourceIds = new Set()
  for (const source of Array.isArray(record.sources) ? record.sources : []) {
    if (!source || typeof source !== 'object') continue
    if (text(source.reviewStatus || source.review_status).toLowerCase() !== 'approved') continue
    if (!sourceEntryIsResolvable(source, registrySourceIds, inactiveRegistrySourceIds)) continue
    for (const id of sourceEntryIds(source)) approvedSourceIds.add(id)
  }

  if (!approvedSourceIds.size) return false

  for (const claim of Array.isArray(record.claimMap) ? record.claimMap : []) {
    if (text(claim?.reviewStatus || claim?.review_status).toLowerCase() !== 'approved') continue
    const refs = [
      ...(Array.isArray(claim?.sourceRefIds) ? claim.sourceRefIds : []),
      ...(Array.isArray(claim?.sourceIds) ? claim.sourceIds : []),
    ]
    if (refs.some((ref) => approvedSourceIds.has(text(ref)))) return true
  }

  return false
}
