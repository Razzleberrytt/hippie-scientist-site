import type { ResearchQualityAnalysis } from './research-quality-analysis'
import { buildResearchQualityTopology, type ResearchQualityTopology } from './research-quality-topology'

export type ResearchGapDimension =
  | 'structural'
  | 'claim-support'
  | 'concentration'
  | 'evidence-mix'
  | 'mapping'
  | 'identity'
  | 'metadata'
  | 'freshness'
  | 'editorial-backlog'

export type ResearchGapReason = {
  kind: string
  dimension: ResearchGapDimension
  weight: number
  detail?: string
}

export type ResearchGapItem = {
  url: string
  score: number
  rawScore: number
  dimensionScores: Partial<Record<ResearchGapDimension, number>>
  dimensionRawScores: Partial<Record<ResearchGapDimension, number>>
  cappedDimensions: ResearchGapDimension[]
  reasons: ResearchGapReason[]
  reasonCounts: Record<string, number>
}

export type StructuralCoverageFailure = {
  kind: 'unsupported-approved-claim' | 'dangling-claim-source-edge'
  url: string
  claimId: string
  sourceRefId?: string
}

/**
 * Dimension caps prevent correlated diagnostics from repeatedly charging the
 * same underlying weakness. Structural invalidity remains dominant; softer
 * topology/metadata/freshness dimensions can corroborate but not overwhelm it.
 */
export const RESEARCH_GAP_DIMENSION_CAPS: Record<ResearchGapDimension, number> = {
  structural: 200,
  'claim-support': 160,
  concentration: 80,
  'evidence-mix': 60,
  mapping: 50,
  identity: 40,
  metadata: 30,
  freshness: 30,
  'editorial-backlog': 30,
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
  unmappedPrimaryHumanEvidence: 12,
  unapprovedOnlyPrimaryHumanEvidence: 8,
  mappingGapNoApprovedPrimaryBonus: 8,
  narrativeReviewDominatedProfile: 20,
  synthesisOnlyApprovedOutcome: 8,
  poorStudyMetadataCoverage: 12,
  narrowRepeatedEvidenceBundle: 15,
  nearDuplicateEvidenceSupport: 10,
  systemicLoadBearingStudyDependency: 8,
  uncertainStudyIdentityCoverage: 10,
  highConfidenceIdentityUncertaintyBonus: 8,
  weakIdentityCoverageBonus: 6,
  legacyOnlyOutcomeClaim: 8,
  highConfidenceLegacyOnlyBonus: 4,
  unknownEvidenceYearMetadata: 4,
  singleStudyApprovedClaim: 5,
  highConfidenceSingleStudyBonus: 10,
  veryHighConfidenceSingleStudyBonus: 10,
  unsupportedUnapprovedStructuredClaim: 4,
  weakUnapprovedStructuredClaim: 3,
} as const

function dimensionForReason(kind: string): ResearchGapDimension {
  if (kind === 'unsupported-approved-claim' || kind === 'dangling-claim-source-edge') return 'structural'
  if (kind.startsWith('claim-support-') || kind === 'synthesis-only-approved-outcome') return 'claim-support'
  if (
    kind === 'single-study-approved-claim'
    || kind === 'high-study-dependency'
    || kind === 'narrow-repeated-evidence-bundle'
    || kind === 'near-duplicate-claim-evidence-support'
    || kind === 'systemic-load-bearing-study-dependency'
  ) return 'concentration'
  if (kind === 'narrative-review-dominated-profile' || kind === 'approved-claims-without-primary-human-study') return 'evidence-mix'
  if (kind === 'unmapped-primary-human-evidence' || kind === 'primary-human-evidence-only-on-unapproved-claims') return 'mapping'
  if (kind === 'uncertain-study-identity-independence') return 'identity'
  if (kind === 'poor-study-metadata-coverage' || kind === 'unknown-evidence-year-metadata') return 'metadata'
  if (kind === 'legacy-only-outcome-evidence') return 'freshness'
  return 'editorial-backlog'
}

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

export function buildResearchGapQueue(
  analysis: ResearchQualityAnalysis,
  topology: ResearchQualityTopology = buildResearchQualityTopology(analysis),
): ResearchGapItem[] {
  const queue = new Map<string, { url: string; reasons: ResearchGapReason[] }>()
  const add = (url: string, kind: string, weight: number, detail?: string) => {
    if (!url) return
    const item = queue.get(url) ?? { url, reasons: [] }
    item.reasons.push({ kind, dimension: dimensionForReason(kind), weight, ...(detail ? { detail } : {}) })
    queue.set(url, item)
  }

  for (const claim of analysis.claimAnalyses) {
    if (claim.structuredSupportTier === 'unsupported') {
      add(claim.url, 'unsupported-approved-claim', RESEARCH_GAP_WEIGHTS.unsupportedApprovedClaim, claim.claimId)
    }
    for (const sourceRefId of claim.danglingSourceRefs) {
      add(claim.url, 'dangling-claim-source-edge', RESEARCH_GAP_WEIGHTS.danglingClaimSourceEdge, `${claim.claimId} -> ${sourceRefId}`)
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
      add(claim.url, 'synthesis-only-approved-outcome', RESEARCH_GAP_WEIGHTS.synthesisOnlyApprovedOutcome, `${claim.claimId} · synthesis evidence present but no direct primary-human study`)
    }

    if (claim.structuredSupportTier === 'unclassified') {
      const confidenceBonus = claim.highConfidenceWeakStructured ? RESEARCH_GAP_WEIGHTS.highConfidenceWeakClaimBonus : 0
      add(claim.url, 'claim-support-unclassified', RESEARCH_GAP_WEIGHTS.unclassifiedStructuredSupport + confidenceBonus, `${claim.claimId} · ${claim.predicate}${confidenceBonus ? ' · high confidence' : ''}`)
    } else if (claim.structuredSupportTier === 'narrative-only') {
      const baseWeight = claim.outcomeClaim ? RESEARCH_GAP_WEIGHTS.narrativeOnlyOutcomeSupport : RESEARCH_GAP_WEIGHTS.narrativeOnlyOtherStructuredSupport
      const confidenceBonus = claim.highConfidenceWeakStructured ? RESEARCH_GAP_WEIGHTS.highConfidenceWeakClaimBonus : 0
      add(claim.url, 'claim-support-narrative-only', baseWeight + confidenceBonus, `${claim.claimId} · ${claim.predicate}${confidenceBonus ? ' · high confidence' : ''}`)
    } else if (claim.supportTier === 'indirect-only') {
      const confidenceBonus = claim.highConfidenceWeakOutcome ? RESEARCH_GAP_WEIGHTS.highConfidenceWeakClaimBonus : 0
      add(claim.url, 'claim-support-indirect-only', RESEARCH_GAP_WEIGHTS.indirectOutcomeSupport + confidenceBonus, `${claim.claimId}${confidenceBonus ? ' · high confidence' : ''}`)
    }
  }

  for (const claim of analysis.structuredClaimAnalyses.filter((item) => !item.approved)) {
    if (claim.structuredSupportTier === 'unsupported') {
      add(claim.url, 'unsupported-unapproved-structured-claim', RESEARCH_GAP_WEIGHTS.unsupportedUnapprovedStructuredClaim, `${claim.claimId} · ${claim.reviewStatus || 'unreviewed'}`)
      continue
    }
    if (claim.structuredSupportTier === 'unclassified' || claim.structuredSupportTier === 'narrative-only') {
      add(claim.url, `unapproved-claim-support-${claim.structuredSupportTier}`, RESEARCH_GAP_WEIGHTS.weakUnapprovedStructuredClaim, `${claim.claimId} · ${claim.predicate} · ${claim.reviewStatus || 'unreviewed'}`)
    } else if (claim.supportTier === 'indirect-only') {
      add(claim.url, 'unapproved-claim-support-indirect-only', RESEARCH_GAP_WEIGHTS.weakUnapprovedStructuredClaim, `${claim.claimId} · ${claim.reviewStatus || 'unreviewed'}`)
    }
  }

  for (const profile of analysis.profileAnalyses) {
    if (profile.overDependentOnSingleStudy) {
      const share = profile.dominantStudySupportedClaimShare
      const concentrationBonus = Math.round(Math.min(15, profile.studyConcentrationIndex * 20))
      add(profile.url, 'high-study-dependency', Math.round(25 + share * 30 + concentrationBonus), `${Math.round(share * 100)}% of supported approved claims depend on one canonical study; effective study count ${profile.effectiveStudyCount}`)
    }
    if (profile.narrativeDominatedVsPrimaryHuman) {
      const ratio = profile.narrativeToPrimaryHumanRatio === null ? 'no primary-human studies' : `${profile.narrativeToPrimaryHumanRatio}:1 narrative-to-primary-human ratio`
      add(profile.url, 'narrative-review-dominated-profile', RESEARCH_GAP_WEIGHTS.narrativeReviewDominatedProfile, ratio)
    }
    if (profile.noPrimaryHuman) {
      add(profile.url, 'approved-claims-without-primary-human-study', RESEARCH_GAP_WEIGHTS.noPrimaryHumanStudy)
    }
    if (profile.unmappedPrimaryHuman > 0) {
      const bonus = profile.noPrimaryHuman ? RESEARCH_GAP_WEIGHTS.mappingGapNoApprovedPrimaryBonus : 0
      add(profile.url, 'unmapped-primary-human-evidence', RESEARCH_GAP_WEIGHTS.unmappedPrimaryHumanEvidence + bonus, `${profile.unmappedPrimaryHuman} primary-human stud${profile.unmappedPrimaryHuman === 1 ? 'y is' : 'ies are'} not linked to any structured claim${bonus ? '; approved claims also have no linked primary-human study' : ''}`)
    }
    if (profile.unapprovedOnlyPrimaryHuman > 0) {
      const bonus = profile.noPrimaryHuman ? RESEARCH_GAP_WEIGHTS.mappingGapNoApprovedPrimaryBonus : 0
      add(profile.url, 'primary-human-evidence-only-on-unapproved-claims', RESEARCH_GAP_WEIGHTS.unapprovedOnlyPrimaryHumanEvidence + bonus, `${profile.unapprovedOnlyPrimaryHuman} primary-human stud${profile.unapprovedOnlyPrimaryHuman === 1 ? 'y is' : 'ies are'} linked to structured claims but none of those links reach an approved claim`)
    }

    const unclassifiedStudies = Number(profile.designMix.unclassified ?? 0)
    const classifiedStudies = Math.max(0, profile.canonicalStudyCount - unclassifiedStudies)
    const metadataCoverage = profile.canonicalStudyCount ? classifiedStudies / profile.canonicalStudyCount : 1
    if (profile.canonicalStudyCount >= 3 && metadataCoverage < 0.7) {
      add(profile.url, 'poor-study-metadata-coverage', RESEARCH_GAP_WEIGHTS.poorStudyMetadataCoverage, `${Math.round(metadataCoverage * 100)}% of canonical studies have classified study designs`)
    }
  }

  for (const bundle of topology.narrowRepeatedEvidenceBundles) {
    const reuseBonus = Math.min(10, Math.max(0, bundle.approvedClaimCount - 3) * 2)
    add(bundle.url, 'narrow-repeated-evidence-bundle', RESEARCH_GAP_WEIGHTS.narrowRepeatedEvidenceBundle + reuseBonus, `${bundle.approvedClaimCount} approved claims reuse the same ${bundle.studyCount}-study evidence bundle`)
  }

  const overlapByProfile = new Map<string, typeof topology.claimEvidenceOverlap>()
  for (const overlap of topology.claimEvidenceOverlap) {
    const items = overlapByProfile.get(overlap.url) ?? []
    items.push(overlap)
    overlapByProfile.set(overlap.url, items)
  }
  for (const [url, overlaps] of overlapByProfile) {
    const crossPredicateCount = overlaps.filter((item) => item.differentPredicates).length
    const overlapBonus = Math.min(10, Math.max(0, overlaps.length - 1) * 2)
    const maxContainment = Math.max(...overlaps.map((item) => item.containment))
    add(url, 'near-duplicate-claim-evidence-support', RESEARCH_GAP_WEIGHTS.nearDuplicateEvidenceSupport + overlapBonus, `${overlaps.length} claim pair(s) share near-duplicate evidence; ${crossPredicateCount} cross-predicate; max containment ${Math.round(maxContainment * 100)}%`)
  }

  const systemicByProfile = new Map<string, { studies: number; claims: number }>()
  for (const study of topology.systemicLoadBearingStudies) {
    for (const url of study.profiles) {
      const item = systemicByProfile.get(url) ?? { studies: 0, claims: 0 }
      item.studies += 1
      item.claims += study.claims.filter((claim) => claim.url === url).length
      systemicByProfile.set(url, item)
    }
  }
  for (const [url, systemic] of systemicByProfile) {
    const studyBonus = Math.min(12, Math.max(0, systemic.studies - 1) * 2)
    add(url, 'systemic-load-bearing-study-dependency', RESEARCH_GAP_WEIGHTS.systemicLoadBearingStudyDependency + studyBonus, `${systemic.studies} site-wide load-bearing stud${systemic.studies === 1 ? 'y' : 'ies'} support ${systemic.claims} approved claim${systemic.claims === 1 ? '' : 's'} on this profile`)
  }

  for (const identity of topology.studyIdentityCoverage.profiles) {
    if (identity.uncertainMultiStudyClaimCount === 0 && !identity.weakIdentityCoverage) continue
    const highConfidenceBonus = identity.highConfidenceUncertainClaimCount > 0 ? RESEARCH_GAP_WEIGHTS.highConfidenceIdentityUncertaintyBonus : 0
    const weakCoverageBonus = identity.weakIdentityCoverage ? RESEARCH_GAP_WEIGHTS.weakIdentityCoverageBonus : 0
    add(
      identity.url,
      'uncertain-study-identity-independence',
      RESEARCH_GAP_WEIGHTS.uncertainStudyIdentityCoverage + highConfidenceBonus + weakCoverageBonus,
      `${identity.uncertainMultiStudyClaimCount} multi-study approved claim(s) include fallback source identities; ${Math.round(identity.stableIdentityCoverage * 100)}% of approved claim-linked studies have stable DOI/PMID identity${identity.highConfidenceUncertainClaimCount ? `; ${identity.highConfidenceUncertainClaimCount} high-confidence claim(s) affected` : ''}`,
    )
  }

  for (const freshness of topology.claimEvidenceAge) {
    if (freshness.studyCount > 0 && freshness.knownYearCount === 0) {
      add(freshness.url, 'unknown-evidence-year-metadata', RESEARCH_GAP_WEIGHTS.unknownEvidenceYearMetadata, `${freshness.claimId} · publication year unknown for all ${freshness.studyCount} supporting studies`)
      continue
    }
    if (!freshness.legacyOnlyOutcomeClaim) continue
    const confidenceBonus = freshness.highConfidenceLegacyOnlyClaim ? RESEARCH_GAP_WEIGHTS.highConfidenceLegacyOnlyBonus : 0
    add(freshness.url, 'legacy-only-outcome-evidence', RESEARCH_GAP_WEIGHTS.legacyOnlyOutcomeClaim + confidenceBonus, `${freshness.claimId} · newest known supporting study ${freshness.newestYear ?? 'unknown'}${confidenceBonus ? ' · high confidence' : ''}`)
  }

  return [...queue.values()]
    .map((item): ResearchGapItem => {
      const dimensionRawScores = item.reasons.reduce<Partial<Record<ResearchGapDimension, number>>>((scores, reason) => {
        scores[reason.dimension] = (scores[reason.dimension] ?? 0) + reason.weight
        return scores
      }, {})
      const dimensionScores = Object.fromEntries(
        Object.entries(dimensionRawScores).map(([dimension, raw]) => [
          dimension,
          Math.min(Number(raw), RESEARCH_GAP_DIMENSION_CAPS[dimension as ResearchGapDimension]),
        ]),
      ) as Partial<Record<ResearchGapDimension, number>>
      const rawScore = Object.values(dimensionRawScores).reduce((sum, value) => sum + Number(value ?? 0), 0)
      const score = Object.values(dimensionScores).reduce((sum, value) => sum + Number(value ?? 0), 0)
      const cappedDimensions = (Object.keys(dimensionRawScores) as ResearchGapDimension[])
        .filter((dimension) => (dimensionRawScores[dimension] ?? 0) > RESEARCH_GAP_DIMENSION_CAPS[dimension])
      return {
        ...item,
        score: Math.round(score),
        rawScore: Math.round(rawScore),
        dimensionScores,
        dimensionRawScores,
        cappedDimensions,
        reasonCounts: item.reasons.reduce<Record<string, number>>((counts, reason) => {
          counts[reason.kind] = (counts[reason.kind] ?? 0) + 1
          return counts
        }, {}),
      }
    })
    .sort((a, b) => b.score - a.score || b.rawScore - a.rawScore || b.reasons.length - a.reasons.length || a.url.localeCompare(b.url))
}
