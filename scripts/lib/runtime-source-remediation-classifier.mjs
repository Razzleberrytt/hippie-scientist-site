import { recordIsPublished } from './production-content-invariants.mjs'

export const RUNTIME_SOURCE_REMEDIATION_STATES = [
  'recoverable_verified_identity',
  'historical_identity_recovery',
  'candidate_reconciliation_required',
  'identity_metadata_insufficient',
  'quarantine_unverifiable',
]

const DOI_RE = /^10\.\d{4,9}\/\S+$/iu
const PMID_RE = /^\d{5,9}$/u
const HUMAN_RE = /\b(?:human|randomi[sz]ed|rct|clinical trial|controlled trial|meta-analysis|systematic review|cohort|observational|participants?|patients?|adults?|subjects?)\b/iu
const SAFETY_RE = /\b(?:safe|safety|adverse|side effect|interaction|contraindicat|avoid|pregnan|breastfeed|liver|bleed|sedat|toxicity|toxic|tolerab)\b/iu

function text(value) {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) return value.map(text).join(' ')
  if (typeof value === 'object') return Object.values(value).map(text).join(' ')
  return ''
}

function normalize(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeLower(value) {
  return normalize(value).toLowerCase()
}

function normalizeUrl(value) {
  const raw = normalize(value)
  if (!raw) return ''
  try {
    const url = new URL(raw)
    url.hash = ''
    url.search = ''
    return url.toString().replace(/\/+$/u, '').toLowerCase()
  } catch {
    return ''
  }
}

function sourceId(source) {
  return normalize(source?.id || source?.sourceId || source?.source_id)
}

function doiFromUrl(value) {
  const raw = normalize(value)
  if (!raw) return ''
  try {
    const url = new URL(raw)
    if (!/^(?:dx\.)?doi\.org$/iu.test(url.hostname)) return ''
    return decodeURIComponent(url.pathname.replace(/^\/+/, '')).trim().toLowerCase()
  } catch {
    return ''
  }
}

function pmidFromUrl(value) {
  const raw = normalize(value)
  if (!raw) return ''
  try {
    const url = new URL(raw)
    if (!/pubmed\.ncbi\.nlm\.nih\.gov$/iu.test(url.hostname)) return ''
    return url.pathname.match(/^\/(\d+)\/?$/u)?.[1] || ''
  } catch {
    return ''
  }
}

function canonicalPrimaryUrl(source) {
  const candidates = [source?.canonicalUrl, source?.canonical_url, source?.url]
  for (const value of candidates) {
    const normalized = normalizeUrl(value)
    if (!normalized) continue
    try {
      const url = new URL(normalized)
      if (/pubmed\.ncbi\.nlm\.nih\.gov$/iu.test(url.hostname) || /^(?:dx\.)?doi\.org$/iu.test(url.hostname)) {
        return normalized
      }
    } catch {
      // normalizeUrl already validated; keep fail-closed behavior.
    }
  }
  return ''
}

function sourceIdentity(source) {
  const doi = normalizeLower(source?.doi) || doiFromUrl(source?.url) || doiFromUrl(source?.canonicalUrl)
  const pmid = normalize(source?.pmid || source?.pubmedId || source?.pubmed_id) || pmidFromUrl(source?.url) || pmidFromUrl(source?.canonicalUrl)
  return {
    doi,
    pmid,
    canonicalUrl: canonicalPrimaryUrl(source),
    hasValidDoi: DOI_RE.test(doi),
    hasValidPmid: PMID_RE.test(pmid),
  }
}

function claimRefs(claim) {
  const refs = new Set()
  for (const raw of [claim?.sourceRefIds, claim?.sourceIds, claim?.source_ids, claim?.sources]) {
    const values = Array.isArray(raw) ? raw : raw == null ? [] : [raw]
    for (const value of values) {
      const ref = typeof value === 'string' ? normalize(value) : sourceId(value)
      if (ref) refs.add(ref)
    }
  }
  return [...refs]
}

function claimSignals(record, orphanSourceId) {
  const claims = (Array.isArray(record?.claimMap) ? record.claimMap : [])
    .filter(claim => claimRefs(claim).includes(orphanSourceId))
  const claimText = claims.map(claim => text([claim?.claim, claim?.notes, claim?.predicate, claim?.evidenceLevel, claim?.evidence_level, claim?.qualifiers])).join(' ')
  return {
    safetyRelevant: SAFETY_RE.test(claimText),
    humanEvidenceRelevant: HUMAN_RE.test(claimText) || claims.some(claim => /human/iu.test(normalize(claim?.evidenceLevel || claim?.evidence_level))),
  }
}

function identityKey(identity) {
  if (identity.hasValidDoi) return `doi:${identity.doi}`
  if (identity.hasValidPmid) return `pmid:${identity.pmid}`
  if (identity.canonicalUrl) return `url:${identity.canonicalUrl}`
  return ''
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort()
}

function conflictingLocalIdentity(localSources) {
  const identities = localSources.map(sourceIdentity)
  const dois = unique(identities.filter(identity => identity.hasValidDoi).map(identity => identity.doi))
  const pmids = unique(identities.filter(identity => identity.hasValidPmid).map(identity => identity.pmid))
  const urls = unique(identities.map(identity => identity.canonicalUrl))
  return dois.length > 1 || pmids.length > 1 || urls.length > 1
}

function malformedIdentity(localSources) {
  return localSources.some(source => {
    const rawDoi = normalizeLower(source?.doi)
    const rawPmid = normalize(source?.pmid || source?.pubmedId || source?.pubmed_id)
    return (rawDoi && !DOI_RE.test(rawDoi)) || (rawPmid && !PMID_RE.test(rawPmid))
  })
}

function candidateIdentity(candidate) {
  return sourceIdentity({
    doi: candidate?.doi,
    pmid: candidate?.pmid,
    canonicalUrl: candidate?.canonicalUrl,
  })
}

function candidateMatches(localIdentities, candidate) {
  const candidateAnchor = candidateIdentity(candidate)
  return localIdentities.some(local =>
    (local.hasValidDoi && candidateAnchor.hasValidDoi && local.doi === candidateAnchor.doi) ||
    (local.hasValidPmid && candidateAnchor.hasValidPmid && local.pmid === candidateAnchor.pmid) ||
    (local.canonicalUrl && candidateAnchor.canonicalUrl && local.canonicalUrl === candidateAnchor.canonicalUrl),
  )
}

function candidateContradicts(localIdentities, candidate) {
  const candidateAnchor = candidateIdentity(candidate)
  return localIdentities.some(local => {
    const sharesAnchor =
      (local.hasValidDoi && candidateAnchor.hasValidDoi && local.doi === candidateAnchor.doi) ||
      (local.hasValidPmid && candidateAnchor.hasValidPmid && local.pmid === candidateAnchor.pmid) ||
      (local.canonicalUrl && candidateAnchor.canonicalUrl && local.canonicalUrl === candidateAnchor.canonicalUrl)
    if (!sharesAnchor) return false
    if (local.hasValidDoi && candidateAnchor.hasValidDoi && local.doi !== candidateAnchor.doi) return true
    if (local.hasValidPmid && candidateAnchor.hasValidPmid && local.pmid !== candidateAnchor.pmid) return true
    return false
  })
}

function historicalSource(source) {
  const state = normalizeLower(source?.reviewStatus || source?.status || source?.publicationStatus || source?.registryStatus)
  return source?.active === false || /\b(?:inactive|historical|deprecated|retired|archived)\b/iu.test(state)
}

function requiresCandidateReconciliation(candidate, reconciliationByCandidate) {
  if (!candidate) return false
  if (reconciliationByCandidate.has(candidate.candidateSourceId)) return true
  if (normalize(candidate?.duplicateOfSourceId)) return true
  return /promoted to source registry/iu.test(normalize(candidate?.approvalNotes))
}

function classifyOne({ localSources, candidates, reconciliationByCandidate }) {
  if (!localSources.length) {
    return {
      remediationClass: 'identity_metadata_insufficient',
      reason: 'Runtime reference has no matching profile-local source metadata.',
    }
  }

  if (conflictingLocalIdentity(localSources)) {
    return {
      remediationClass: 'quarantine_unverifiable',
      reason: 'The same runtime source ID resolves to conflicting local DOI, PMID, or canonical identity metadata.',
    }
  }

  if (malformedIdentity(localSources)) {
    return {
      remediationClass: 'quarantine_unverifiable',
      reason: 'Profile-local source metadata contains malformed DOI or PMID identity fields.',
    }
  }

  const localIdentities = localSources.map(sourceIdentity)
  const matchedCandidates = candidates.filter(candidate => candidateMatches(localIdentities, candidate))
  const contradictoryCandidate = matchedCandidates.find(candidate => candidateContradicts(localIdentities, candidate))
  if (contradictoryCandidate) {
    return {
      remediationClass: 'quarantine_unverifiable',
      reason: `Candidate ${contradictoryCandidate.candidateSourceId} shares an identity anchor but conflicts on another identifier.`,
    }
  }

  const reconciliationCandidate = matchedCandidates.find(candidate => requiresCandidateReconciliation(candidate, reconciliationByCandidate))
  if (reconciliationCandidate) {
    return {
      remediationClass: 'candidate_reconciliation_required',
      reason: `Candidate ${reconciliationCandidate.candidateSourceId} carries governed or stale promotion/duplicate history that must be reconciled before registry recovery.`,
      candidateSourceId: reconciliationCandidate.candidateSourceId,
    }
  }

  if (localSources.some(historicalSource)) {
    return {
      remediationClass: 'historical_identity_recovery',
      reason: 'Local provenance explicitly marks this identity inactive, historical, deprecated, retired, or archived.',
    }
  }

  const recoverableIdentity = localIdentities.find(identity => identity.hasValidDoi || identity.hasValidPmid || identity.canonicalUrl)
  if (recoverableIdentity) {
    return {
      remediationClass: 'recoverable_verified_identity',
      reason: 'Profile-local provenance contains a valid DOI, PMID, or primary PubMed/DOI canonical identity suitable for governed attestation.',
      identityAnchor: identityKey(recoverableIdentity),
    }
  }

  return {
    remediationClass: 'identity_metadata_insufficient',
    reason: 'Profile-local metadata does not contain a safe DOI, PMID, or primary canonical identity anchor.',
  }
}

export function buildRuntimeSourceRemediationQueue({ orphanRows, entries, sourceCandidates = [], promotionReconciliations = [] }) {
  const rows = Array.isArray(orphanRows) ? orphanRows : []
  const records = Array.isArray(entries) ? entries : []
  const candidates = Array.isArray(sourceCandidates) ? sourceCandidates : []
  const reconciliations = Array.isArray(promotionReconciliations) ? promotionReconciliations : []

  const rowKeys = rows.map(row => `${row.kind}:${row.slug}:${row.sourceId}`)
  if (new Set(rowKeys).size !== rowKeys.length) {
    throw new Error('Duplicate runtime registry orphan rows are not allowed in the remediation queue input.')
  }

  const recordByKey = new Map(records.map(entry => [`${entry.kind}:${entry.record?.slug}`, entry.record]))
  const fanoutBySourceId = new Map()
  for (const row of rows) fanoutBySourceId.set(row.sourceId, (fanoutBySourceId.get(row.sourceId) || 0) + 1)
  const reconciliationByCandidate = new Map(reconciliations.map(row => [row.candidateSourceId, row]))

  const queue = rows.map(row => {
    const record = recordByKey.get(`${row.kind}:${row.slug}`) || {}
    const localSources = (Array.isArray(record?.sources) ? record.sources : []).filter(source => sourceId(source) === row.sourceId)
    const signals = claimSignals(record, row.sourceId)
    const classification = classifyOne({ localSources, candidates, reconciliationByCandidate })
    const published = recordIsPublished(record)
    const fanout = fanoutBySourceId.get(row.sourceId) || 1
    const priorityScore = (published ? 100 : 0) + (signals.safetyRelevant ? 50 : 0) + (signals.humanEvidenceRelevant ? 40 : 0) + Math.min(fanout, 20) * 5

    return {
      ...row,
      ...classification,
      published,
      safetyRelevant: signals.safetyRelevant,
      humanEvidenceRelevant: signals.humanEvidenceRelevant,
      sourceIdFanout: fanout,
      priorityScore,
      localSourceMetadataCount: localSources.length,
    }
  }).sort((a, b) =>
    b.priorityScore - a.priorityScore ||
    String(a.sourceId).localeCompare(String(b.sourceId)) ||
    String(a.kind).localeCompare(String(b.kind)) ||
    String(a.slug).localeCompare(String(b.slug)),
  )

  const countsByClass = Object.fromEntries(RUNTIME_SOURCE_REMEDIATION_STATES.map(state => [state, 0]))
  for (const item of queue) countsByClass[item.remediationClass] = (countsByClass[item.remediationClass] || 0) + 1

  const uniqueProfiles = new Set(queue.map(item => `${item.kind}:${item.slug}`))
  const uniqueSourceIds = new Set(queue.map(item => item.sourceId))
  const sourceIdFanout = [...fanoutBySourceId.entries()]
    .map(([sourceIdValue, fanout]) => ({ sourceId: sourceIdValue, fanout }))
    .sort((a, b) => b.fanout - a.fanout || a.sourceId.localeCompare(b.sourceId))

  return {
    schemaVersion: 1,
    orphanRows: queue.length,
    uniqueAffectedProfiles: uniqueProfiles.size,
    uniqueOrphanSourceIds: uniqueSourceIds.size,
    publishedRows: queue.filter(item => item.published).length,
    safetyRelevantRows: queue.filter(item => item.safetyRelevant).length,
    humanEvidenceRelevantRows: queue.filter(item => item.humanEvidenceRelevant).length,
    countsByClass,
    sourceIdFanout,
    queue,
    policy: {
      authority: 'public/data/source-registry.json remains the sole authority for current registry membership.',
      mutation: 'Classification is informational only and never creates registry records, changes claims, changes evidence grades, or changes indexability.',
      recovery: 'Recoverable classification means sufficient local identity metadata exists for governed attestation; it is not automatic verification or promotion.',
    },
  }
}
