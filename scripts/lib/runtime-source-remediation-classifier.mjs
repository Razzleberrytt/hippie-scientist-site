const STATES = Object.freeze({
  RECOVERABLE: 'recoverable_verified_identity',
  HISTORICAL: 'historical_identity_recovery',
  RECONCILIATION: 'candidate_reconciliation_required',
  INSUFFICIENT: 'identity_metadata_insufficient',
  QUARANTINE: 'quarantine_unverifiable',
})

export const RUNTIME_SOURCE_REMEDIATION_STATES = Object.freeze(Object.values(STATES))

function text(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function canonicalDoi(value) {
  const raw = text(value).toLowerCase().replace(/^https?:\/\/(?:dx\.)?doi\.org\//u, '')
  return /^10\.\d{4,9}\/.+/u.test(raw) ? raw : ''
}

function canonicalPmid(value) {
  const raw = text(value)
  return /^\d{5,9}$/u.test(raw) ? raw : ''
}

function pmidFromUrl(value) {
  const match = text(value).match(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d{5,9})(?:\/|$)/iu)
  return match ? match[1] : ''
}

function doiFromUrl(value) {
  const match = text(value).match(/doi\.org\/(10\.\d{4,9}\/[^?#]+)/iu)
  return match ? canonicalDoi(match[1]) : ''
}

export function sourceIdentityAnchors(source = {}) {
  const url = text(source.canonicalUrl || source.url)
  return {
    doi: canonicalDoi(source.doi) || doiFromUrl(url),
    pmid: canonicalPmid(source.pmid || source.pubmedId) || pmidFromUrl(url),
    canonicalUrl: url,
    title: text(source.title),
  }
}

function sourceIdOf(source = {}) {
  return text(source.sourceId || source.id)
}

function candidateAnchors(candidate = {}) {
  return {
    doi: canonicalDoi(candidate.doi),
    pmid: canonicalPmid(candidate.pmid),
    canonicalUrl: text(candidate.canonicalUrl),
    title: text(candidate.title),
  }
}

function exactAnchorMatch(local, candidate) {
  return Boolean(
    (local.doi && candidate.doi && local.doi === candidate.doi) ||
    (local.pmid && candidate.pmid && local.pmid === candidate.pmid),
  )
}

function contradictoryAnchors(local, candidate) {
  if (local.doi && candidate.doi && local.doi !== candidate.doi && local.pmid && candidate.pmid && local.pmid === candidate.pmid) return true
  if (local.pmid && candidate.pmid && local.pmid !== candidate.pmid && local.doi && candidate.doi && local.doi === candidate.doi) return true
  return false
}

function candidateNeedsReconciliation(candidate, reconciliation) {
  if (reconciliation) return true
  if (text(candidate.duplicateOfSourceId)) return true
  if (candidate.reviewStatus === 'duplicate_of_existing') return true
  return /promoted to source registry/iu.test(text(candidate.approvalNotes))
}

function historicalSignal(localSource, candidates) {
  const localStatus = text(localSource?.publicationStatus).toLowerCase()
  if (localSource?.active === false || localStatus === 'superseded' || localStatus === 'withdrawn') return true
  return candidates.some(candidate => {
    const status = text(candidate.publicationStatus).toLowerCase()
    return candidate.active === false || status === 'superseded' || status === 'withdrawn'
  })
}

function claimSourceRefs(claim = {}) {
  const refs = new Set()
  for (const raw of [claim.sourceRefIds, claim.sourceIds, claim.source_ids, claim.sources]) {
    for (const value of Array.isArray(raw) ? raw : raw == null ? [] : [raw]) {
      const ref = typeof value === 'string' ? value.trim() : sourceIdOf(value)
      if (ref) refs.add(ref)
    }
  }
  return [...refs]
}

function claimSignals(profile, sourceId) {
  const claims = (Array.isArray(profile?.claimMap) ? profile.claimMap : []).filter(claim => claimSourceRefs(claim).includes(sourceId))
  const safetyPattern = /safety|safe|adverse|contraindicat|interaction|pregnan|tox|risk|harm|avoid/iu
  const humanPattern = /human|random|trial|clinical|meta|systematic|cohort|observational/iu
  return {
    safety: claims.some(claim => safetyPattern.test(`${text(claim.claim)} ${text(claim.predicate)} ${text(claim.notes)}`)),
    human: claims.some(claim => humanPattern.test(`${text(claim.evidenceLevel)} ${text(claim.claim)} ${text(claim.notes)}`)),
  }
}

function profileIsPublished(profile) {
  return profile?.indexability_status === 'PUBLISH' || profile?.governance?.indexingAllowed === true || profile?.robots === 'index,follow'
}

function localSourceFor(profile, sourceId) {
  return (Array.isArray(profile?.sources) ? profile.sources : []).find(source => sourceIdOf(source) === sourceId) || null
}

function matchingCandidates(localAnchors, sourceId, candidates) {
  return candidates.filter(candidate => {
    const anchors = candidateAnchors(candidate)
    return exactAnchorMatch(localAnchors, anchors) || text(candidate.duplicateOfSourceId) === sourceId
  })
}

function reconciliationByCandidateId(reconciliations) {
  return new Map((Array.isArray(reconciliations) ? reconciliations : []).map(row => [text(row.candidateSourceId), row]))
}

function remediationState({ localSource, anchors, candidates, reconciliationsByCandidate }) {
  if (!localSource) {
    return { state: STATES.INSUFFICIENT, reason: 'Referenced canonical runtime source has no matching profile-local source metadata row.' }
  }

  const contradictory = candidates.find(candidate => contradictoryAnchors(anchors, candidateAnchors(candidate)))
  if (contradictory) {
    return {
      state: STATES.QUARANTINE,
      reason: `Profile-local DOI/PMID anchors conflict with candidate ${candidateId(contradictory)}.`,
    }
  }

  const reconciliationCandidate = candidates.find(candidate => candidateNeedsReconciliation(candidate, reconciliationsByCandidate.get(candidateId(candidate))))
  if (reconciliationCandidate) {
    const reconciliation = reconciliationsByCandidate.get(candidateId(reconciliationCandidate))
    const suffix = reconciliation ? ` (${text(reconciliation.correctedPromotionState) || 'governed reconciliation'})` : ''
    return {
      state: STATES.RECONCILIATION,
      reason: `Candidate ${candidateId(reconciliationCandidate)} carries registry-history/duplicate state requiring reconciliation${suffix}.`,
    }
  }

  if (historicalSignal(localSource, candidates)) {
    return { state: STATES.HISTORICAL, reason: 'Source metadata indicates inactive, superseded, or withdrawn historical provenance.' }
  }

  if (anchors.doi || anchors.pmid) {
    return {
      state: STATES.RECOVERABLE,
      reason: 'Profile-local source has a DOI/PMID anchor sufficient for governed external source attestation; classification does not itself restore registry membership.',
    }
  }

  return {
    state: STATES.INSUFFICIENT,
    reason: 'Profile-local source lacks a DOI/PMID anchor; registry recovery requires additional identity metadata or external attestation.',
  }
}

function candidateId(candidate = {}) {
  return text(candidate.candidateSourceId)
}

export function classifyRuntimeSourceOrphan(orphan, context = {}) {
  const profile = context.profile || {}
  const sourceId = text(orphan?.sourceId)
  const localSource = localSourceFor(profile, sourceId)
  const anchors = sourceIdentityAnchors(localSource || {})
  const candidates = matchingCandidates(anchors, sourceId, Array.isArray(context.candidates) ? context.candidates : [])
  const reconciliationsByCandidate = reconciliationByCandidateId(context.reconciliations)
  const decision = remediationState({ localSource, anchors, candidates, reconciliationsByCandidate })
  const signals = claimSignals(profile, sourceId)

  return {
    kind: text(orphan?.kind),
    slug: text(orphan?.slug),
    sourceId,
    url: text(orphan?.url),
    remediationState: decision.state,
    reason: decision.reason,
    published: profileIsPublished(profile),
    safetyClaim: signals.safety,
    humanEvidenceClaim: signals.human,
    anchors: {
      doi: anchors.doi || null,
      pmid: anchors.pmid || null,
      canonicalUrl: anchors.canonicalUrl || null,
    },
    localSourcePresent: Boolean(localSource),
    candidateSourceIds: candidates.map(candidateId).filter(Boolean).sort(),
    reconciliationStates: candidates
      .map(candidate => reconciliationsByCandidate.get(candidateId(candidate)))
      .filter(Boolean)
      .map(row => text(row.correctedPromotionState))
      .filter(Boolean)
      .sort(),
  }
}

const CLASS_PRIORITY = Object.freeze({
  [STATES.QUARANTINE]: 25,
  [STATES.RECONCILIATION]: 20,
  [STATES.HISTORICAL]: 12,
  [STATES.RECOVERABLE]: 10,
  [STATES.INSUFFICIENT]: 5,
})

export function rankRuntimeSourceRemediations(rows) {
  const fanout = new Map()
  for (const row of rows) fanout.set(row.sourceId, (fanout.get(row.sourceId) || 0) + 1)

  return rows.map(row => {
    const sourceFanout = fanout.get(row.sourceId) || 1
    const priorityScore =
      (row.published ? 100 : 0) +
      (row.safetyClaim ? 40 : 0) +
      (row.humanEvidenceClaim ? 30 : 0) +
      Math.min(sourceFanout, 20) * 3 +
      (CLASS_PRIORITY[row.remediationState] || 0)
    return { ...row, sourceFanout, priorityScore }
  }).sort((a, b) =>
    b.priorityScore - a.priorityScore ||
    b.sourceFanout - a.sourceFanout ||
    a.kind.localeCompare(b.kind) ||
    a.slug.localeCompare(b.slug) ||
    a.sourceId.localeCompare(b.sourceId),
  )
}
