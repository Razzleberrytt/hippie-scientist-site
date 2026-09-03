const SAFETY_TOPICS = new Set([
  'interaction','contraindication','adverse_effect','pregnancy_note','lactation_note',
  'pediatric_note','geriatric_note','condition_caution','surgery_caution','medication_class_caution',
])
const NEGATIVE_CLAIMS = new Set(['efficacy_null_or_mixed','evidence_conflict','research_gap'])
const HUMAN_EVIDENCE = new Set(['human-clinical','human-observational','regulatory-monograph'])
const SEMANTIC_AXES = ['entity','preparation','population','endpoint','conclusion']
const HARD_PROMOTION_BLOCK_REASONS = new Set([
  'submission_inactive','semantic_mismatch','route_source_quarantine','route_no_op',
  'automated_adjudication_rejected','source_publication_not_current','source_evidence_class_mismatch',
])
const SOURCE_REJECT_STATUSES = new Set(['withdrawn','superseded'])
const REJECTED_REVIEW_STATUSES = new Set(['rejected','deprecated_submission'])

export const ROUTES = Object.freeze([
  'profile_enrichment','safety_correction','source_quarantine','evidence_grade_change',
  'contradiction_record','research_gap','no_op',
])

export function semanticAttestationStatus(attestation) {
  if (!attestation) return 'missing'
  const values = SEMANTIC_AXES.map(axis => attestation?.[axis]?.status ?? attestation?.[axis])
  if (values.some(value => value === 'mismatch')) return 'mismatch'
  if (values.every(value => value === 'matched' || value === 'not_applicable')) return 'verified'
  return 'incomplete'
}

export function semanticAttestationEvidenceReceipt(attestation) {
  const semantic = semanticAttestationStatus(attestation)
  const reasons = []
  if (semantic !== 'verified') reasons.push(`semantic_${semantic}`)
  if (attestation?.reviewer !== 'enrichment-adjudicator') reasons.push('reviewer_not_enrichment_adjudicator')
  if (!Number.isFinite(Date.parse(attestation?.reviewedAt ?? ''))) reasons.push('reviewed_at_missing_or_invalid')
  const confidence = attestation?.confidence
  const highConfidence = confidence === 'high' || (Number.isFinite(Number(confidence)) && Number(confidence) >= 0.85)
  if (!highConfidence) reasons.push('confidence_below_auto_approval_threshold')

  for (const axis of SEMANTIC_AXES) {
    const row = attestation?.[axis]
    if (!row || typeof row !== 'object') {
      reasons.push(`${axis}_receipt_missing`)
      continue
    }
    if (typeof row.reason !== 'string' || row.reason.trim().length < 12) reasons.push(`${axis}_reason_missing`)
    if (row.status === 'matched') {
      const refs = Array.isArray(row.evidenceRefs) ? row.evidenceRefs.filter(Boolean) : []
      if (!refs.length) reasons.push(`${axis}_evidence_refs_missing`)
    }
  }

  return { complete: reasons.length === 0, semantic, reasons }
}

export function automatedAdjudicationDecision(submission = {}, source = null) {
  const reasons = []
  const semantic = semanticAttestationStatus(submission.semanticAttestation)

  if (submission.active !== true || REJECTED_REVIEW_STATUSES.has(submission.reviewStatus)) {
    reasons.push('submission_not_active_for_adjudication')
    return { status: 'auto_rejected', reviewer: 'enrichment-adjudicator', semantic, reasons }
  }

  if (!source) {
    reasons.push('source_missing_from_registry')
    return { status: 'pending_source_admission', reviewer: 'enrichment-adjudicator', semantic, reasons }
  }
  if (source.active !== true) {
    reasons.push('source_inactive')
    return { status: 'pending_source_admission', reviewer: 'enrichment-adjudicator', semantic, reasons }
  }
  if (SOURCE_REJECT_STATUSES.has(source.publicationStatus)) {
    reasons.push(`source_publication_${source.publicationStatus}`)
    return { status: 'auto_rejected', reviewer: 'enrichment-adjudicator', semantic, reasons }
  }
  if (source.evidenceClass && submission.evidenceClass && source.evidenceClass !== submission.evidenceClass) {
    reasons.push(`source_evidence_class_${source.evidenceClass}_submission_${submission.evidenceClass}`)
    return { status: 'auto_rejected', reviewer: 'enrichment-adjudicator', semantic, reasons }
  }
  if (semantic === 'mismatch') {
    reasons.push('semantic_mismatch')
    return { status: 'auto_rejected', reviewer: 'enrichment-adjudicator', semantic, reasons }
  }
  if (semantic !== 'verified') {
    reasons.push(`semantic_${semantic}`)
    return { status: 'pending_semantic_adjudication', reviewer: 'enrichment-adjudicator', semantic, reasons }
  }

  if (submission.reviewStatus === 'approved_for_rollup') {
    reasons.push('existing_governed_rollup_approval')
    return { status: 'existing_approved', reviewer: submission.reviewer ?? 'existing-governed-review', semantic, reasons }
  }

  const receipt = semanticAttestationEvidenceReceipt(submission.semanticAttestation)
  if (!receipt.complete) {
    reasons.push(...receipt.reasons)
    return { status: 'pending_evidence_receipt', reviewer: 'enrichment-adjudicator', semantic, reasons }
  }

  reasons.push('active_current_source')
  reasons.push('source_evidence_class_compatible')
  reasons.push('all_semantic_axes_verified_with_evidence_receipt')
  return { status: 'auto_approved', reviewer: 'enrichment-adjudicator', semantic, reasons }
}

export function routeSubmission(submission, { sourceIdentityStatus = 'verified' } = {}) {
  if (sourceIdentityStatus === 'mismatch' || semanticAttestationStatus(submission.semanticAttestation) === 'mismatch') {
    return 'source_quarantine'
  }
  if (submission.active === false || REJECTED_REVIEW_STATUSES.has(submission.reviewStatus)) {
    return 'no_op'
  }
  if (submission.claimType === 'research_gap' || submission.topicType === 'research_gap') return 'research_gap'
  if (submission.claimType === 'evidence_conflict' || submission.claimType === 'efficacy_null_or_mixed' || submission.topicType === 'conflict_note') {
    return 'contradiction_record'
  }
  if (SAFETY_TOPICS.has(submission.topicType) || submission.claimType === 'safety_risk') return 'safety_correction'
  if (submission.claimType === 'efficacy_signal' && submission.strengthLabel) return 'evidence_grade_change'
  return 'profile_enrichment'
}

export function promotionDecision(submission, source, { requireSemanticAttestation = true } = {}) {
  const reasons = []
  const adjudication = automatedAdjudicationDecision(submission, source)
  const autoApproved = adjudication.status === 'auto_approved'

  if (!source) reasons.push('source_missing_from_registry')
  else if (source.active !== true) reasons.push('source_inactive')
  if (source && SOURCE_REJECT_STATUSES.has(source.publicationStatus)) reasons.push('source_publication_not_current')
  if (source?.evidenceClass && submission.evidenceClass && source.evidenceClass !== submission.evidenceClass) {
    reasons.push('source_evidence_class_mismatch')
  }
  if (submission.reviewStatus !== 'approved_for_rollup' && !autoApproved) reasons.push('automated_adjudication_unresolved')
  if (submission.active !== true) reasons.push('submission_inactive')

  const semantic = semanticAttestationStatus(submission.semanticAttestation)
  if (semantic === 'mismatch') reasons.push('semantic_mismatch')
  if (requireSemanticAttestation && semantic !== 'verified') reasons.push(`semantic_${semantic}`)
  if (adjudication.status === 'auto_rejected') reasons.push('automated_adjudication_rejected')

  const route = routeSubmission(submission, { sourceIdentityStatus: source?.identityAttestation?.status ?? 'verified' })
  if (route === 'source_quarantine' || route === 'no_op') reasons.push(`route_${route}`)

  return { eligible: reasons.length === 0, route, semantic, adjudication, reasons: [...new Set(reasons)] }
}

export function promotionBlockerDisposition(decision = {}) {
  const reasons = [...new Set(decision.reasons ?? [])]
  const hardReasons = reasons.filter(reason => HARD_PROMOTION_BLOCK_REASONS.has(reason))
  const adjudicationReasons = reasons.filter(reason => !HARD_PROMOTION_BLOCK_REASONS.has(reason))
  const hardBlocked = hardReasons.length > 0
  return {
    hardBlocked,
    automatedAdjudicationPending: !hardBlocked && adjudicationReasons.length > 0,
    canContinueResearch: !hardBlocked,
    adjudicationReasons,
    hardReasons,
  }
}

export function scoreOrphan(item = {}) {
  const components = {
    published: item.published === true ? 30 : 0,
    safety: item.safetyRelevant === true ? 30 : 0,
    human: item.humanEvidence === true ? 18 : 0,
    traffic: clamp(item.trafficScore ?? 0, 0, 10),
    fanout: clamp(item.fanoutCount ?? 0, 0, 8),
    ambiguityPenalty: item.identityAmbiguous === true ? -15 : 0,
  }
  return { score: Object.values(components).reduce((a,b) => a + b, 0), components }
}

export function scoreWorkpack(workpack = {}) {
  const components = {
    safetyRisk: clamp(workpack.safetyRisk ?? 0, 0, 5) * 8,
    evidenceGap: clamp(workpack.evidenceGap ?? 0, 0, 5) * 6,
    searchValue: clamp(workpack.searchValue ?? 0, 0, 5) * 4,
    sourceAvailability: clamp(workpack.sourceAvailability ?? 0, 0, 5) * 3,
    expectedYield: clamp(workpack.expectedYield ?? 0, 0, 5) * 5,
    contradictionOpportunity: workpack.seekContradictions === true ? 8 : 0,
    adjudicationPenalty: workpack.automatedAdjudicationPending === true ? -2 : 0,
    stalePenalty: workpack.blocked === true || workpack.hardBlocked === true ? -100 : 0,
  }
  return { score: Object.values(components).reduce((a,b) => a + b, 0), components }
}

export function scheduleShard(workpacks = [], shard, shardCount, shardOf, resolveWorkpack) {
  if (typeof resolveWorkpack !== 'function') {
    throw new Error('canonical_owner_resolution_required: scheduleShard requires a canonical workpack resolver')
  }
  return workpacks
    .map(workpack => resolveWorkpack(workpack))
    .filter(w => shardOf(w.workpackId, shardCount) === shard)
    .map(w => ({ ...w, roi: scoreWorkpack(w) }))
    .sort((a,b) => b.roi.score - a.roi.score || a.workpackId.localeCompare(b.workpackId))
}

export function contradictionPriority(submission = {}) {
  let score = 0
  if (NEGATIVE_CLAIMS.has(submission.claimType)) score += 40
  if (submission.topicType === 'interaction' || submission.topicType === 'contraindication') score += 25
  if (submission.uncertaintyNote) score += 10
  if (HUMAN_EVIDENCE.has(submission.evidenceClass)) score += 15
  return score
}

export function fanoutCandidates(source, submissions = []) {
  if (!source?.sourceId) return []
  const currentTargets = new Set(submissions.filter(s => s.sourceId === source.sourceId).map(targetKey))
  const declared = [...new Set([...(source.entitySlugs ?? []), ...(source.entity_slugs ?? [])].map(String).map(s => s.trim()).filter(Boolean))]
  return declared
    .map(slug => ({ entitySlug: slug, target: `entity:${slug}`, alreadyUsed: currentTargets.has(`herb:${slug}`) || currentTargets.has(`compound:${slug}`) }))
    .filter(item => !item.alreadyUsed)
    .map(({ alreadyUsed, ...item }) => item)
}

export function admissionDecision({ queuedRuns = 0, inProgressRuns = 0, openEnrichmentPrs = 0 } = {}, thresholds = {}) {
  const cfg = { yellowRuns: 35, redRuns: 70, yellowPrs: 8, redPrs: 16, ...thresholds }
  const pressure = queuedRuns + inProgressRuns
  const red = pressure >= cfg.redRuns || openEnrichmentPrs >= cfg.redPrs
  const yellow = !red && (pressure >= cfg.yellowRuns || openEnrichmentPrs >= cfg.yellowPrs)
  return {
    level: red ? 'red' : yellow ? 'yellow' : 'green',
    allowResearchStaging: true,
    allowPromotion: !red,
    maxNewPromotions: red ? 0 : yellow ? 1 : 4,
    pressure: { queuedRuns, inProgressRuns, openEnrichmentPrs, totalRuns: pressure },
  }
}

export function computeSessionYield(submissions = [], { elapsedHours = null } = {}) {
  const total = submissions.length
  const approved = submissions.filter(s => s.reviewStatus === 'approved_for_rollup').length
  const quarantined = submissions.filter(s => routeSubmission(s) === 'source_quarantine').length
  const negative = submissions.filter(s => NEGATIVE_CLAIMS.has(s.claimType)).length
  const safety = submissions.filter(s => routeSubmission(s) === 'safety_correction').length
  const profiles = new Set(submissions.map(targetKey)).size
  const sources = new Set(submissions.map(s => s.sourceId).filter(Boolean)).size
  const promoted = submissions.filter(s => s.promotionStatus === 'promoted').length
  const rate = value => elapsedHours && elapsedHours > 0 ? round(value / elapsedHours) : null
  return {
    findings: total, approved, promoted, quarantined, negativeOrContradictory: negative,
    safetyGapsClosed: safety, profilesTouched: profiles, uniqueSources: sources,
    approvalRate: round(approved / Math.max(total, 1)),
    promotionRate: round(promoted / Math.max(total, 1)),
    quarantineRate: round(quarantined / Math.max(total, 1)),
    findingsPerHour: rate(total), approvedPerHour: rate(approved), sourcesPerHour: rate(sources),
  }
}

export function prioritizeSubmissions(submissions = []) {
  return submissions
    .map(s => ({ ...s, route: routeSubmission(s), contradictionPriority: contradictionPriority(s) }))
    .sort((a,b) => b.contradictionPriority - a.contradictionPriority || a.submissionId.localeCompare(b.submissionId))
}

function targetKey(submission = {}) {
  return submission.entityType === 'surface'
    ? `surface:${submission.surfaceId ?? ''}`
    : `${submission.entityType ?? 'entity'}:${submission.entitySlug ?? ''}`
}
function clamp(value, min, max) { return Math.max(min, Math.min(max, Number(value) || 0)) }
function round(value) { return Math.round(value * 1000) / 1000 }
