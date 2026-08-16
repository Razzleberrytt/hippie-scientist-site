import type { ResearchQualityAnalysis } from './research-quality-analysis'

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
  narrativeOnlyClaimSupport: 25,
  indirectOrUnclassifiedClaimSupport: 20,
  highConfidenceWeakClaimBonus: 15,
  noPrimaryHumanStudy: 20,
  narrativeReviewDominatedProfile: 20,
  synthesisOnlyApprovedOutcome: 8,
  poorStudyMetadataCoverage: 12,
  singleStudyApprovedClaim: 5,
  unsupportedUnapprovedStructuredClaim: 4,
  weakUnapprovedOutcomeClaim: 3,
} as const

export function structuralCoverageFailures(analysis: ResearchQualityAnalysis): StructuralCoverageFailure[] {
  const failures: StructuralCoverageFailure[] = []
  for (const claim of analysis.claimAnalyses) {
    if (claim.supportTier === 'unsupported') {
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
    if (claim.supportTier === 'unsupported') {
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
      add(claim.url, 'single-study-approved-claim', RESEARCH_GAP_WEIGHTS.singleStudyApprovedClaim, claim.claimId)
    }
    if (claim.outcomeClaim && claim.primaryHuman === 0 && claim.synthesis > 0) {
      add(
        claim.url,
        'synthesis-only-approved-outcome',
        RESEARCH_GAP_WEIGHTS.synthesisOnlyApprovedOutcome,
        `${claim.claimId} · synthesis evidence present but no direct primary-human study`,
      )
    }

    const tier = claim.supportTier
    if (tier === 'unsupported' || tier === 'human-supported' || tier === 'non-outcome') continue
    const baseWeight = tier === 'narrative-only'
      ? RESEARCH_GAP_WEIGHTS.narrativeOnlyClaimSupport
      : RESEARCH_GAP_WEIGHTS.indirectOrUnclassifiedClaimSupport
    const confidenceBonus = claim.highConfidenceWeakOutcome ? RESEARCH_GAP_WEIGHTS.highConfidenceWeakClaimBonus : 0
    add(
      claim.url,
      `claim-support-${tier}`,
      baseWeight + confidenceBonus,
      `${claim.claimId}${confidenceBonus ? ' · high confidence' : ''}`,
    )
  }

  for (const claim of analysis.structuredClaimAnalyses.filter((item) => !item.approved)) {
    if (claim.supportTier === 'unsupported') {
      add(
        claim.url,
        'unsupported-unapproved-structured-claim',
        RESEARCH_GAP_WEIGHTS.unsupportedUnapprovedStructuredClaim,
        `${claim.claimId} · ${claim.reviewStatus || 'unreviewed'}`,
      )
      continue
    }
    if (claim.outcomeClaim && ['unclassified', 'narrative-only', 'indirect-only'].includes(claim.supportTier)) {
      add(
        claim.url,
        `unapproved-claim-support-${claim.supportTier}`,
        RESEARCH_GAP_WEIGHTS.weakUnapprovedOutcomeClaim,
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
