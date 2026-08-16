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
  narrativeReviewDominatedProfile: 20,
  edgeWeightedNarrativeDominance: 12,
  synthesisOnlyApprovedOutcome: 8,
  unmappedPrimaryHumanEvidence: 12,
  unapprovedOnlyPrimaryHumanEvidence: 8,
  mappingGapNoApprovedPrimaryBonus: 8,
  poorStudyMetadataCoverage: 12,
  narrowRepeatedEvidenceBundle: 15,
  homogeneousMultiStudySupport: 7,
  highConfidenceHomogeneousMultiStudyBonus: 5,
  nearDuplicateEvidenceSupport: 10,
  systemicLoadBearingStudyDependency: 8,
  provenanceConcentration: 10,
  firstAuthorConcentrationBonus: 6,
  journalConcentrationBonus: 4,
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
  unapprovedSingleStudyStructuredClaim: 2,
} as const

const DIMENSION_BY_KIND: Record<string, ResearchGapDimension> = {
  'unsupported-approved-claim': 'structural',
  'dangling-claim-source-edge': 'structural',
  'synthesis-only-approved-outcome': 'claim-support',
  'single-study-approved-claim': 'concentration',
  'high-study-dependency': 'concentration',
  'narrow-repeated-evidence-bundle': 'concentration',
  'homogeneous-multi-study-support': 'concentration',
  'near-duplicate-claim-evidence-support': 'concentration',
  'systemic-load-bearing-study-dependency': 'concentration',
  'provenance-concentrated-evidence': 'concentration',
  'narrative-review-dominated-profile': 'evidence-mix',
  'edge-weighted-narrative-dominance': 'evidence-mix',
  'approved-claims-without-primary-human-study': 'evidence-mix',
  'unmapped-primary-human-evidence': 'mapping',
  'primary-human-evidence-only-on-unapproved-claims': 'mapping',
  'uncertain-study-identity-independence': 'identity',
  'poor-study-metadata-coverage': 'metadata',
  'unknown-evidence-year-metadata': 'metadata',
  'legacy-only-outcome-evidence': 'freshness',
}

function dimensionForReason(kind: string): ResearchGapDimension {
  if (DIMENSION_BY_KIND[kind]) return DIMENSION_BY_KIND[kind]
  if (kind.startsWith('claim-support-')) return 'claim-support'
  return 'editorial-backlog'
}

export function structuralCoverageFailures(analysis: ResearchQualityAnalysis): StructuralCoverageFailure[] {
  return analysis.claimAnalyses.flatMap((claim) => [
    ...(claim.structuredSupportTier === 'unsupported'
      ? [{ kind: 'unsupported-approved-claim' as const, url: claim.url, claimId: claim.claimId }]
      : []),
    ...claim.danglingSourceRefs.map((sourceRefId) => ({
      kind: 'dangling-claim-source-edge' as const,
      url: claim.url,
      claimId: claim.claimId,
      sourceRefId,
    })),
  ])
}

type MutableGap = { url: string; reasons: ResearchGapReason[] }
type AddReason = (url: string, kind: string, weight: number, detail?: string) => void

function addApprovedClaimReasons(analysis: ResearchQualityAnalysis, add: AddReason) {
  for (const claim of analysis.claimAnalyses) {
    if (claim.structuredSupportTier === 'unsupported') {
      add(claim.url, 'unsupported-approved-claim', RESEARCH_GAP_WEIGHTS.unsupportedApprovedClaim, claim.claimId)
    }
    for (const sourceRefId of claim.danglingSourceRefs) {
      add(claim.url, 'dangling-claim-source-edge', RESEARCH_GAP_WEIGHTS.danglingClaimSourceEdge, `${claim.claimId} -> ${sourceRefId}`)
    }

    if (claim.singleStudy) {
      const high = claim.confidence >= 0.75 ? RESEARCH_GAP_WEIGHTS.highConfidenceSingleStudyBonus : 0
      const veryHigh = claim.confidence >= 0.9 ? RESEARCH_GAP_WEIGHTS.veryHighConfidenceSingleStudyBonus : 0
      add(
        claim.url,
        'single-study-approved-claim',
        RESEARCH_GAP_WEIGHTS.singleStudyApprovedClaim + high + veryHigh,
        `${claim.claimId} · confidence ${claim.confidence}${veryHigh ? ' · very high confidence' : high ? ' · high confidence' : ''}`,
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

    const confidenceBonus = claim.highConfidenceWeakStructured ? RESEARCH_GAP_WEIGHTS.highConfidenceWeakClaimBonus : 0
    if (claim.structuredSupportTier === 'unclassified') {
      add(
        claim.url,
        'claim-support-unclassified',
        RESEARCH_GAP_WEIGHTS.unclassifiedStructuredSupport + confidenceBonus,
        `${claim.claimId} · ${claim.predicate}${confidenceBonus ? ' · high confidence' : ''}`,
      )
    } else if (claim.structuredSupportTier === 'narrative-only') {
      const base = claim.outcomeClaim
        ? RESEARCH_GAP_WEIGHTS.narrativeOnlyOutcomeSupport
        : RESEARCH_GAP_WEIGHTS.narrativeOnlyOtherStructuredSupport
      add(
        claim.url,
        'claim-support-narrative-only',
        base + confidenceBonus,
        `${claim.claimId} · ${claim.predicate}${confidenceBonus ? ' · high confidence' : ''}`,
      )
    } else if (claim.supportTier === 'indirect-only') {
      const outcomeBonus = claim.highConfidenceWeakOutcome ? RESEARCH_GAP_WEIGHTS.highConfidenceWeakClaimBonus : 0
      add(
        claim.url,
        'claim-support-indirect-only',
        RESEARCH_GAP_WEIGHTS.indirectOutcomeSupport + outcomeBonus,
        `${claim.claimId}${outcomeBonus ? ' · high confidence' : ''}`,
      )
    }
  }
}

function addEditorialBacklogReasons(analysis: ResearchQualityAnalysis, add: AddReason) {
  for (const claim of analysis.structuredClaimAnalyses) {
    if (claim.approved) continue
    const detail = `${claim.claimId} · ${claim.predicate} · ${claim.reviewStatus || 'unreviewed'}`
    if (claim.structuredSupportTier === 'unsupported') {
      add(claim.url, 'unsupported-unapproved-structured-claim', RESEARCH_GAP_WEIGHTS.unsupportedUnapprovedStructuredClaim, detail)
    } else if (claim.structuredSupportTier === 'unclassified' || claim.structuredSupportTier === 'narrative-only') {
      add(claim.url, `unapproved-claim-support-${claim.structuredSupportTier}`, RESEARCH_GAP_WEIGHTS.weakUnapprovedStructuredClaim, detail)
    } else if (claim.structuredSupportTier === 'single-study') {
      add(
        claim.url,
        'unapproved-claim-support-single-study',
        RESEARCH_GAP_WEIGHTS.unapprovedSingleStudyStructuredClaim,
        detail,
      )
    } else if (claim.supportTier === 'indirect-only') {
      add(claim.url, 'unapproved-claim-support-indirect-only', RESEARCH_GAP_WEIGHTS.weakUnapprovedStructuredClaim, detail)
    }
  }
}

function addProfileReasons(analysis: ResearchQualityAnalysis, add: AddReason) {
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
      add(profile.url, 'narrative-review-dominated-profile', RESEARCH_GAP_WEIGHTS.narrativeReviewDominatedProfile, ratio)
    }
    if (profile.noPrimaryHuman) {
      add(profile.url, 'approved-claims-without-primary-human-study', RESEARCH_GAP_WEIGHTS.noPrimaryHumanStudy)
    }

    const mappingBonus = profile.noPrimaryHuman ? RESEARCH_GAP_WEIGHTS.mappingGapNoApprovedPrimaryBonus : 0
    if (profile.unmappedPrimaryHuman > 0) {
      add(
        profile.url,
        'unmapped-primary-human-evidence',
        RESEARCH_GAP_WEIGHTS.unmappedPrimaryHumanEvidence + mappingBonus,
        `${profile.unmappedPrimaryHuman} primary-human stud${profile.unmappedPrimaryHuman === 1 ? 'y is' : 'ies are'} not linked to any structured claim`,
      )
    }
    if (profile.unapprovedOnlyPrimaryHuman > 0) {
      add(
        profile.url,
        'primary-human-evidence-only-on-unapproved-claims',
        RESEARCH_GAP_WEIGHTS.unapprovedOnlyPrimaryHumanEvidence + mappingBonus,
        `${profile.unapprovedOnlyPrimaryHuman} primary-human stud${profile.unapprovedOnlyPrimaryHuman === 1 ? 'y is' : 'ies are'} linked to structured claims but not approved claims`,
      )
    }

    const unclassifiedStudies = Number(profile.designMix.unclassified ?? 0)
    const metadataCoverage = profile.canonicalStudyCount
      ? Math.max(0, profile.canonicalStudyCount - unclassifiedStudies) / profile.canonicalStudyCount
      : 1
    if (profile.canonicalStudyCount >= 3 && metadataCoverage < 0.7) {
      add(
        profile.url,
        'poor-study-metadata-coverage',
        RESEARCH_GAP_WEIGHTS.poorStudyMetadataCoverage,
        `${Math.round(metadataCoverage * 100)}% of canonical studies have classified study designs`,
      )
    }
  }
}

function addTopologyReasons(topology: ResearchQualityTopology, add: AddReason) {
  for (const bundle of topology.narrowRepeatedEvidenceBundles) {
    const reuseBonus = Math.min(10, Math.max(0, bundle.approvedClaimCount - 3) * 2)
    add(
      bundle.url,
      'narrow-repeated-evidence-bundle',
      RESEARCH_GAP_WEIGHTS.narrowRepeatedEvidenceBundle + reuseBonus,
      `${bundle.approvedClaimCount} approved claims reuse the same ${bundle.studyCount}-study evidence bundle`,
    )
  }

  for (const claim of topology.homogeneousMultiStudyClaims) {
    const highConfidenceBonus = claim.highConfidenceHomogeneousMultiStudySupport
      ? RESEARCH_GAP_WEIGHTS.highConfidenceHomogeneousMultiStudyBonus
      : 0
    add(
      claim.url,
      'homogeneous-multi-study-support',
      RESEARCH_GAP_WEIGHTS.homogeneousMultiStudySupport + highConfidenceBonus,
      `${claim.claimId} · ${claim.studyCount} studies but one evidence family (${claim.evidenceFamilies.join(', ')})${highConfidenceBonus ? ' · high confidence' : ''}`,
    )
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
    add(
      url,
      'near-duplicate-claim-evidence-support',
      RESEARCH_GAP_WEIGHTS.nearDuplicateEvidenceSupport + overlapBonus,
      `${overlaps.length} claim pair(s) share near-duplicate evidence; ${crossPredicateCount} cross-predicate; max containment ${Math.round(maxContainment * 100)}%`,
    )
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
    add(
      url,
      'systemic-load-bearing-study-dependency',
      RESEARCH_GAP_WEIGHTS.systemicLoadBearingStudyDependency + studyBonus,
      `${systemic.studies} site-wide load-bearing stud${systemic.studies === 1 ? 'y' : 'ies'} support ${systemic.claims} approved claim${systemic.claims === 1 ? '' : 's'} on this profile`,
    )
  }

  for (const design of topology.edgeWeightedNarrativeDominatedProfiles) {
    add(
      design.url,
      'edge-weighted-narrative-dominance',
      RESEARCH_GAP_WEIGHTS.edgeWeightedNarrativeDominance,
      `${Math.round(design.narrativeReviewEdgeShare * 100)}% of classified approved claim-study edges are narrative reviews (${design.narrativeReviewEdges}/${design.classifiedEdges})`,
    )
  }

  for (const provenance of topology.provenanceConcentratedProfiles) {
    const authorBonus = provenance.firstAuthorConcentrated ? RESEARCH_GAP_WEIGHTS.firstAuthorConcentrationBonus : 0
    const journalBonus = provenance.journalConcentrated ? RESEARCH_GAP_WEIGHTS.journalConcentrationBonus : 0
    add(
      provenance.url,
      'provenance-concentrated-evidence',
      RESEARCH_GAP_WEIGHTS.provenanceConcentration + authorBonus + journalBonus,
      `first-author share ${Math.round(provenance.dominantFirstAuthorEdgeShare * 100)}% across ${provenance.dominantFirstAuthorStudyCount} study/studies; journal share ${Math.round(provenance.dominantJournalEdgeShare * 100)}% across ${provenance.dominantJournalStudyCount}`,
    )
  }

  for (const identity of topology.studyIdentityCoverage.profiles) {
    if (identity.uncertainMultiStudyClaimCount === 0 && !identity.weakIdentityCoverage) continue
    const highConfidenceBonus = identity.highConfidenceUncertainClaimCount > 0
      ? RESEARCH_GAP_WEIGHTS.highConfidenceIdentityUncertaintyBonus
      : 0
    const weakCoverageBonus = identity.weakIdentityCoverage ? RESEARCH_GAP_WEIGHTS.weakIdentityCoverageBonus : 0
    add(
      identity.url,
      'uncertain-study-identity-independence',
      RESEARCH_GAP_WEIGHTS.uncertainStudyIdentityCoverage + highConfidenceBonus + weakCoverageBonus,
      `${identity.uncertainMultiStudyClaimCount} multi-study approved claim(s) include fallback identities; ${Math.round(identity.stableIdentityCoverage * 100)}% stable DOI/PMID coverage`,
    )
  }

  for (const freshness of topology.claimEvidenceAge) {
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
    const bonus = freshness.highConfidenceLegacyOnlyClaim ? RESEARCH_GAP_WEIGHTS.highConfidenceLegacyOnlyBonus : 0
    add(
      freshness.url,
      'legacy-only-outcome-evidence',
      RESEARCH_GAP_WEIGHTS.legacyOnlyOutcomeClaim + bonus,
      `${freshness.claimId} · newest known supporting study ${freshness.newestYear ?? 'unknown'}${bonus ? ' · high confidence' : ''}`,
    )
  }
}

function finalizeGap(item: MutableGap): ResearchGapItem {
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
  const cappedDimensions = Object.entries(dimensionRawScores)
    .filter(([dimension, raw]) => Number(raw) > RESEARCH_GAP_DIMENSION_CAPS[dimension as ResearchGapDimension])
    .map(([dimension]) => dimension as ResearchGapDimension)
  const reasonCounts = item.reasons.reduce<Record<string, number>>((counts, reason) => {
    counts[reason.kind] = (counts[reason.kind] ?? 0) + 1
    return counts
  }, {})

  return {
    ...item,
    score: Math.round(score),
    rawScore: Math.round(rawScore),
    dimensionScores,
    dimensionRawScores,
    cappedDimensions,
    reasonCounts,
  }
}

export function buildResearchGapQueue(
  analysis: ResearchQualityAnalysis,
  topology: ResearchQualityTopology = buildResearchQualityTopology(analysis),
): ResearchGapItem[] {
  const queue = new Map<string, MutableGap>()
  const add: AddReason = (url, kind, weight, detail) => {
    if (!url || weight <= 0) return
    const item = queue.get(url) ?? { url, reasons: [] }
    item.reasons.push({ kind, dimension: dimensionForReason(kind), weight, ...(detail ? { detail } : {}) })
    queue.set(url, item)
  }

  addApprovedClaimReasons(analysis, add)
  addEditorialBacklogReasons(analysis, add)
  addProfileReasons(analysis, add)
  addTopologyReasons(topology, add)

  return [...queue.values()]
    .map(finalizeGap)
    .sort((a, b) => b.score - a.score || b.rawScore - a.rawScore || b.reasons.length - a.reasons.length || a.url.localeCompare(b.url))
}
