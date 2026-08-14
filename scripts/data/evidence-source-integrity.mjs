// Known slug ↔ source identity mismatches discovered during evidence review.
//
// This module is intentionally narrow: it never guesses whether a citation is relevant.
// A pairing is added only after a reviewer verifies that the source identifier belongs to
// a different substance/topic. Downstream generators may then quarantine that pairing
// until the canonical workbook is corrected.

const KNOWN_INVALID_PROFILE_SOURCES = new Map([
  [
    'hmb',
    {
      reason: 'known_source_identity_mismatch',
      note: 'PMID 10410847 is a creatine supplementation review, not the HMB trial represented by this claim.',
      pmids: new Set(['10410847']),
    },
  ],
])

function normalizeSlug(value) {
  return String(value || '').trim().toLowerCase()
}

function normalizePmid(value) {
  const raw = String(value || '').trim()
  if (!raw) return ''
  const match = raw.match(/(?:pmid:)?\s*(\d{5,10})/i)
  return match ? match[1] : ''
}

function pmidFromUrl(value) {
  const raw = String(value || '').trim()
  const match = raw.match(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d{5,10})/i)
  return match ? match[1] : ''
}

export function getKnownSourceMismatch(slug) {
  return KNOWN_INVALID_PROFILE_SOURCES.get(normalizeSlug(slug)) || null
}

export function isKnownInvalidProfileSource(slug, source) {
  const rule = getKnownSourceMismatch(slug)
  if (!rule || !source) return false

  if (typeof source === 'string') {
    const pmid = normalizePmid(source) || pmidFromUrl(source)
    return Boolean(pmid && rule.pmids.has(pmid))
  }

  if (typeof source !== 'object') return false
  const pmid =
    normalizePmid(source.pmid) ||
    normalizePmid(source.pubmedId) ||
    normalizePmid(source.pubmed_id) ||
    pmidFromUrl(source.url) ||
    pmidFromUrl(source.source_url)

  return Boolean(pmid && rule.pmids.has(pmid))
}

export function filterKnownInvalidSourceIds(slug, sourceIds) {
  return (Array.isArray(sourceIds) ? sourceIds : []).filter(
    (sourceId) => !isKnownInvalidProfileSource(slug, sourceId),
  )
}

export function sanitizeKnownInvalidProfileSources(slug, record) {
  const rule = getKnownSourceMismatch(slug)
  if (!rule || !record || typeof record !== 'object') {
    return { matched: false, removedSources: 0, removedClaims: 0, removedSourceIds: [] }
  }

  const removedSourceIds = new Set()
  let removedSources = 0
  let removedClaims = 0

  if (Array.isArray(record.sources)) {
    record.sources = record.sources.filter((source) => {
      if (!isKnownInvalidProfileSource(slug, source)) return true
      removedSources += 1
      if (source && typeof source === 'object' && source.id) removedSourceIds.add(String(source.id))
      return false
    })
  }

  if (Array.isArray(record.claimMap)) {
    record.claimMap = record.claimMap.flatMap((claim) => {
      const refs = Array.isArray(claim?.sourceRefIds) ? claim.sourceRefIds : []
      const filteredRefs = refs.filter(
        (ref) => !removedSourceIds.has(String(ref)) && !isKnownInvalidProfileSource(slug, ref),
      )

      if (refs.length > 0 && filteredRefs.length === 0 && filteredRefs.length !== refs.length) {
        removedClaims += 1
        return []
      }

      if (filteredRefs.length !== refs.length) {
        return [{ ...claim, sourceRefIds: filteredRefs }]
      }
      return [claim]
    })
  }

  if (record.evidence && typeof record.evidence === 'object' && Array.isArray(record.evidence.sourceIds)) {
    record.evidence.sourceIds = record.evidence.sourceIds.filter(
      (ref) => !removedSourceIds.has(String(ref)) && !isKnownInvalidProfileSource(slug, ref),
    )
    record.evidence.sourceCount = record.evidence.sourceIds.length
  }

  return {
    matched: removedSources > 0 || removedClaims > 0,
    removedSources,
    removedClaims,
    removedSourceIds: [...removedSourceIds].sort(),
    reason: rule.reason,
    note: rule.note,
  }
}

export function sanitizeKnownInvalidClaims(claims) {
  if (!Array.isArray(claims)) return { claims: [], removed: [] }

  const removed = []
  const kept = claims.filter((claim) => {
    const slug = normalizeSlug(claim?.profile_slug)
    if (!slug || !isKnownInvalidProfileSource(slug, claim)) return true

    removed.push({
      slug,
      claimId: String(claim?.id || ''),
      pmid: normalizePmid(claim?.pmid),
      reason: getKnownSourceMismatch(slug)?.reason || 'known_source_identity_mismatch',
    })
    return false
  })

  return { claims: kept, removed }
}
