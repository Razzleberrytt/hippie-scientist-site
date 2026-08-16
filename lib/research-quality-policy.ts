import { analyzeClaimEvidenceAge } from './research-evidence-age'
import type { ResearchQualityAnalysis } from './research-quality-analysis'
import { analyzeClaimEvidenceOverlap, analyzeCrossProfileStudyLoad, analyzeEvidenceBundleReuse } from './research-study-load'

export type ResearchGapReason = {
  kind: string
  weight: number
  detail?: string
}

export type ResearchGapItem = {
  url: string
  score: number
  reasons: ResearchGapReason[]
  reasonCounts: Record<string, number>
}

export type StructuralCoverageFailure = {
  kind: 'unsupported-approved-claim' | 'dangling-claim-source-edge'
  url: string
  claimId: string
  sourceRefId?: string
}

export const RESEARCH_GAP_WEIGHTS = {
  unsupportedApprovedClaim: 100,
  danglingClaimSourceEdge: 100,
  narrativeOnlyOutcomeSupport: 25,
  narrativeOnlyOtherStructuredSupport: 15,
  indirectOutcomeSupport: 20,
  unclassifiedStructuredSupport: 20,
  highConfidenceWeakClaimBonus: 15,
  noPrimaryHumanStudy: 20,
  narrativeReviewDominatedProfile: 20,
  synthesisOnlyApprovedOutcome: 8,
  poorStudyMetadataCoverage: 12,
  narrowRepeatedEvidenceBundle: 15,
  nearDuplicateEvidenceSupport: 10,
  systemicLoadBearingStudyDependency: 8,
  legacyOnlyOutcomeClaim: 8,
  highConfidenceLegacyOnlyBonus: 4,
  unknownEvidenceYearMetadata: 4,
  singleStudyApprovedClaim: 5,
  highConfidenceSingleStudyBonus: 10,
  veryHighConfidenceSingleStudyBonus: 10,
  unsupportedUnapprovedStructuredClaim: 4,
  weakUnapprovedStructuredClaim: 3,
} as const

export function structuralCoverageFailures(analysis: ResearchQualityAnalysis): StructuralCoverageFailure[] {
  const failures: StructuralCoverageFailure[] = []
  for (const claim of analysis.claimAnalyses) {
    if (claim.structuredSupportTier === 'unsupported') {
      failures.push({ kind: 'unsupported-approved-claim', url: claim.url, claimId: claim.claimId })
    }
    for (const sourceRefId of claim.danglingSourceRefs) {
      failures.push({ kind: 'dangling-claim-source-edge', url: claim.url, claimId: claim.claimId, sourceRefId })
    }
  }
  return failures
}

export function buildResearchGapQueue(analysis: ResearchQualityAnalysis): ResearchGapItem[] {
  const queue = new Map<string, { url: string; score: number; reasons: ResearchGapReason[] }>()

  const add = (url: string, kind: string, weight: number, detail?: string) => {
    if (!url) return
    const item = queue.get(url) ?? { url, score: 0, reasons: [] }
    item.score += weight
    item.reasons.push({ kind, weight, ...(detail ? { detail } : {}) })
    queue.set(url, item)
  }

  for (const claim of analysis.claimAnalyses) {
    if (claim.structuredSupportTier === 'unsupported') {
      add(claim.url, 'unsupported-approved-claim', RESEARCH_GAP_WEIGHTS.unsupportedApprovedClaim, claim.claimId)
    }
    for (const sourceRefId of claim.danglingSourceRefs) {
      add(
        claim.url,
        'dangling-claim-source-edge',
        RESEARCH_GAP_WEIGHTS.danglingClaimSourceEdge,
        `${claim.claimId} -> ${sourceRefId}`,
      )
    }
    if (claim.singleStudy) {
      const highConfidenceBonus = claim.confidence >= 0.75 ? RESEARCH_GAP_WEIGHTS.highConfidenceSingleStudyBonus : 0
      const veryHighConfidenceBonus = claim.confidence >= 0.9 ? RESEARCH_GAP_WEIGHTS.veryHighConfidenceSingleStudyBonus : 0
      add(
        claim.url,
        'single-study-approved-claim',
        RESEARCH_GAP_WEIGHTS.singleStudyApprovedClaim + highConfidenceBonus + veryHighConfidenceBonus,
        `${claim.claimId} · confidence ${claim.confidence}${veryHighConfidenceBonus ? ' · very high confidence' : highConfidenceBonus ? ' · high confidence' : ''}`,
      )
    }
    if (claim.outcomeClaim && claim.primaryHuman === 0 && claim.synthesis > 0) {
      add(
        claim.url,
        'synthesis-only-approved-outcome',
        RESEARCH_GAP_WEIGHTS.synthesisOnlyApprovedOutcome,
        `${claim.claimId} · synthesis evidence present but no direct primary-human study`,
      )
    }

    if (claim.structuredSupportTier === 'unclassified') {
      const confidenceBonus = claim.highConfidenceWeakStructured ? RESEARCH_GAP_WEIGHTS.highConfidenceWeakClaimBonus : 0
      add(
        claim.url,
        'claim-support-unclassified',
        RESEARCH_GAP_WEIGHTS.unclassifiedStructuredSupport + confidenceBonus,
        `${claim.claimId} · ${claim.predicate}${confidenceBonus ? ' · high confidence' : ''}`,
      )
    } else if (claim.structuredSupportTier === 'narrative-only') {
      const baseWeight = claim.outcomeClaim
        ? RESEARCH_GAP_WEIGHTS.narrativeOnlyOutcomeSupport
        : RESEARCH_GAP_WEIGHTS.narrativeOnlyOtherStructuredSupport
      const confidenceBonus = claim.highConfidenceWeakStructured ? RESEARCH_GAP_WEIGHTS.highConfidenceWeakClaimBonus : 0
      add(
        claim.url,
        'claim-support-narrative-only',
        baseWeight + confidenceBonus,
        `${claim.claimId} · ${claim.predicate}${confidenceBonus ? ' · high confidence' : ''}`,
      )
    } else if (claim.supportTier === 'indirect-only') {
      const confidenceBonus = claim.highConfidenceWeakOutcome ? RESEARCH_GAP_WEIGHTS.highConfidenceWeakClaimBonus : 0
      add(
        claim.url,
        'claim-support-indirect-only',
        RESEARCH_GAP_WEIGHTS.indirectOutcomeSupport + confidenceBonus,
        `${claim.claimId}${confidenceBonus ? ' · high confidence' : ''}`,
      )
    }
  }

  for (const claim of analysis.structuredClaimAnalyses.filter((item) => !item.approved)) {
    if (claim.structuredSupportTier === 'unsupported') {
      add(
        claim.url,
        'unsupported-unapproved-structured-claim',
        RESEARCH_GAP_WEIGHTS.unsupportedUnapprovedStructuredClaim,
        `${claim.claimId} · ${claim.reviewStatus || 'unreviewed'}`,
      )
      continue
    }
    if (claim.structuredSupportTier === 'unclassified' || claim.structuredSupportTier === 'narrative-only') {
      add(
        claim.url,
        `unapproved-claim-support-${claim.structuredSupportTier}`,
        RESEARCH_GAP_WEIGHTS.weakUnapprovedStructuredClaim,
        `${claim.claimId} · ${claim.predicate} · ${claim.reviewStatus || 'unreviewed'}`,
      )
    } else if (claim.supportTier === 'indirect-only') {
      add(
        claim.url,
        'unapproved-claim-support-indirect-only',
        RESEARCH_GAP_WEIGHTS.weakUnapprovedStructuredClaim,
        `${claim.claimId} · ${claim.reviewStatus || 'unreviewed'}`,
      )
    }
  }

  for (const profile of analysis.profileAnalyses) {
    if (profile.overDependentOnSingleStudy) {
      const share = profile.dominantStudySupportedClaimShare
      const concentrationBonus = Math.round(Math.min(15, profile.studyConcentrationIndex * 20))
      add(
        profile.url,
        'high-study-dependency',
        Math.round(25 + share * 30 + concentrationBonus),
        `${Math.round(share * 100)}% of supported approved claims depend on one canonical study; effective study count ${profile.effectiveStudyCount}`,
      )
    }
    if (profile.narrativeDominatedVsPrimaryHuman) {
      const ratio = profile.narrativeToPrimaryHumanRatio === null
        ? 'no primary-human studies'
        : `${profile.narrativeToPrimaryHumanRatio}:1 narrative-to-primary-human ratio`
      add(
        profile.url,
        'narrative-review-dominated-profile',
        RESEARCH_GAP_WEIGHTS.narrativeReviewDominatedProfile,
        ratio,
      )
    }
    if (profile.noPrimaryHuman) {
      add(
        profile.url,
        'approved-claims-without-primary-human-study',
        RESEARCH_GAP_WEIGHTS.noPrimaryHumanStudy,
      )
    }

    const unclassifiedStudies = Number(profile.designMix.unclassified ?? 0)
    const classifiedStudies = Math.max(0, profile.canonicalStudyCount - unclassifiedStudies)
    const metadataCoverage = profile.canonicalStudyCount ? classifiedStudies / profile.canonicalStudyCount : 1
    if (profile.canonicalStudyCount >= 3 && metadataCoverage < 0.7) {
      add(
        profile.url,
        'poor-study-metadata-coverage',
        RESEARCH_GAP_WEIGHTS.poorStudyMetadataCoverage,
        `${Math.round(metadataCoverage * 100)}% of canonical studies have classified study designs`,
      )
    }
  }

  for (const bundle of analyzeEvidenceBundleReuse(analysis)) {
    if (!bundle.narrowRepeatedEvidenceBundle) continue
    const reuseBonus = Math.min(10, Math.max(0, bundle.approvedClaimCount - 3) * 2)
    add(
      bundle.url,
      'narrow-repeated-evidence-bundle',
      RESEARCH_GAP_WEIGHTS.narrowRepeatedEvidenceBundle + reuseBonus,
      `${bundle.approvedClaimCount} approved claims reuse the same ${bundle.studyCount}-study evidence bundle`,
    )
  }

  const overlapByProfile = new Map<string, ReturnType<typeof analyzeClaimEvidenceOverlap>>()
  for (const overlap of analyzeClaimEvidenceOverlap(analysis)) {
    const items = overlapByProfile.get(overlap.url) ?? []
    items.push(overlap)
    overlapByProfile.set(overlap.url, items)
  }
  for (const [url, overlaps] of overlapByProfile) {
    const crossPredicateCount = overlaps.filter((item) => item.differentPredicates).length
    const overlapBonus = Math.min(10, Math.max(0, overlaps.length - 1) * 2)
    const maxContainment = Math.max(...overlaps.map((item) => item.containment))
    add(
      url,
      'near-duplicate-claim-evidence-support',
      RESEARCH_GAP_WEIGHTS.nearDuplicateEvidenceSupport + overlapBonus,
      `${overlaps.length} claim pair(s) share near-duplicate evidence; ${crossPredicateCount} cross-predicate; max containment ${Math.round(maxContainment * 100)}%`,
    )
  }

  const systemicByProfile = new Map<string, { studies: number; claims: number }>()
  for (const study of analyzeCrossProfileStudyLoad(analysis)) {
    if (!study.systemicLoadBearing) continue
    for (const url of study.profiles) {
      const item = systemicByProfile.get(url) ?? { studies: 0, claims: 0 }
      item.studies += 1
      item.claims += study.claims.filter((claim) => claim.url === url).length
      systemicByProfile.set(url, item)
    }
  }
  for (const [url, systemic] of systemicByProfile) {
    const studyBonus = Math.min(12, Math.max(0, systemic.studies - 1) * 2)
    add(
      url,
      'systemic-load-bearing-study-dependency',
      RESEARCH_GAP_WEIGHTS.systemicLoadBearingStudyDependency + studyBonus,
      `${systemic.studies} site-wide load-bearing stud${systemic.studies === 1 ? 'y' : 'ies'} support ${systemic.claims} approved claim${systemic.claims === 1 ? '' : 's'} on this profile`,
    )
  }

  for (const freshness of analyzeClaimEvidenceAge(analysis)) {
    if (freshness.studyCount > 0 && freshness.knownYearCount === 0) {
      add(
        freshness.url,
        'unknown-evidence-year-metadata',
        RESEARCH_GAP_WEIGHTS.unknownEvidenceYearMetadata,
        `${freshness.claimId} · publication year unknown for all ${freshness.studyCount} supporting studies`,
      )
      continue
    }
    if (!freshness.legacyOnlyOutcomeClaim) continue
    const confidenceBonus = freshness.highConfidenceLegacyOnlyClaim
      ? RESEARCH_GAP_WEIGHTS.highConfidenceLegacyOnlyBonus
      : 0
    add(
      freshness.url,
      'legacy-only-outcome-evidence',
      RESEARCH_GAP_WEIGHTS.legacyOnlyOutcomeClaim + confidenceBonus,
      `${freshness.claimId} · newest known supporting study ${freshness.newestYear ?? 'unknown'}${confidenceBonus ? ' · high confidence' : ''}`,
    )
  }

  return [...queue.values()]
    .map((item) => ({
      ...item,
      score: Math.round(item.score),
      reasonCounts: item.reasons.reduce<Record<string, number>>((counts, reason) => {
        counts[reason.kind] = (counts[reason.kind] ?? 0) + 1
        return counts
      }, {}),
    }))
    .sort((a, b) => b.score - a.score || b.reasons.length - a.reasons.length || a.url.localeCompare(b.url))
}
