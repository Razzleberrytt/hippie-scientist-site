/**
 * Explicit incident containment, not an automatic scientific regrading rule.
 * #6056 / #4444: the legacy herb:tyrosine evidence set is held in full until
 * source-to-claim review. Audited inputs remain in the workbook/cache and the
 * quarantine report. The separate compound:l-tyrosine owner is unaffected.
 */
export function hasCitationIntegrityHold(record) {
  return record?.slug === 'tyrosine' && record?.entityType !== 'compound'
}

export const CITATION_INTEGRITY_HOLD_REASON = 'tyrosine-citation-integrity-review'

export function applyCitationIntegrityHold(record) {
  if (!hasCitationIntegrityHold(record)) return record
  const tier = 'Editorial grade not demonstrated by recorded studies'
  return {
    ...record,
    summary: 'This L-Tyrosine profile is under evidence review after citation mismatches were identified. No settled evidence grade is currently assigned.',
    description: 'L-Tyrosine evidence is under review. Previously displayed source associations do not establish supplement benefits.',
    evidence_grade_source: record.evidence_grade_source ?? record.evidence_grade ?? '',
    evidence_tier_source: record.evidence_tier_source ?? record.evidence_tier ?? '',
    evidence_grade: null,
    evidenceGrade: null,
    evidence_grade_band: null,
    evidence_grade_backed: false,
    evidence_grade_backing_gap: CITATION_INTEGRITY_HOLD_REASON,
    evidence_tier: tier,
    evidenceTier: tier,
    evidenceLevel: tier,
    evidence_label: tier,
    evidenceLabel: tier,
    evidence_human_study_count: 0,
    evidence_recorded_study_count: 0,
    evidence_strongest_design: 'unclassified',
    evidence_design_match: null,
    evidence_rationale: 'The previous source associations are withheld pending review; no accepted studies are counted on this profile.',
    sources: [],
    references: [],
    pmids: [],
    claimMap: [],
    evidence: { reviewStatus: 'needs_review', sourceCount: 0, sourceIds: [], claimCount: 0, claimIds: [] },
    governance: {
      ...record.governance,
      reviewStatus: 'needs_review',
      indexingAllowed: false,
      monetizationAllowed: false,
      recommendationAllowed: false,
      requiresHumanReview: true,
      reason: CITATION_INTEGRITY_HOLD_REASON,
    },
    indexability_status: 'NEEDS_REVIEW',
    robots: 'noindex,follow',
    sitemap_included: false,
  }
}
