import type { ResearchQualityAnalysis } from './research-quality-analysis'
import { buildAggregatedTopologyGapSignals } from './research-quality-policy-topology-signals'
import { buildResearchQualityTopology, type ResearchQualityTopology } from './research-quality-topology'

export type ResearchGapDimension =
  | 'structural'
  | 'claim-support'
  | 'semantic'
  | 'concentration'
  | 'evidence-mix'
  | 'mapping'
  | 'identity'
  | 'metadata'
  | 'freshness'
  | 'editorial-backlog'

export type ResearchGapReason = { kind: string; dimension: ResearchGapDimension; weight: number; detail?: string }
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

type MutableGap = { url: string; reasons: ResearchGapReason[] }
type AddReason = (url: string, kind: string, weight: number, detail?: string) => void

export const RESEARCH_GAP_DIMENSION_CAPS: Record<ResearchGapDimension, number> = {
  structural: 200,
  'claim-support': 160,
  semantic: 100,
  concentration: 80,
  'evidence-mix': 60,
  mapping: 50,
  identity: 40,
  metadata: 40,
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
  semanticMismatch: 18,
  highConfidenceSemanticMismatchBonus: 10,
  semanticSingleSource: 12,
  semanticSupportConcentration: 8,
  highConfidenceSemanticConcentrationBonus: 6,
  semanticMetadataCoverageGap: 6,
  highConfidenceSemanticCoverageGapBonus: 4,
  causalWithoutControlledOrSynthesis: 18,
  causalWithoutDirectControlled: 10,
  synthesisOnlyCausalSupport: 7,
  highConfidenceCausalLanguageBonus: 8,
  noPrimaryHumanStudy: 20,
  narrativeReviewDominatedProfile: 20,
  edgeWeightedNarrativeDominance: 12,
  synthesisOnlyApprovedOutcome: 8,
  unmappedPrimaryHumanEvidence: 12,
  unapprovedOnlyPrimaryHumanEvidence: 8,
  mappingGapNoApprovedPrimaryBonus: 8,
  poorStudyMetadataCoverage: 12,
  claimCitationMetadataGap: 8,
  highConfidenceCitationMetadataBonus: 4,
  narrowRepeatedEvidenceBundle: 15,
  narrowCrossProfileEvidenceBundle: 12,
  homogeneousMultiStudySupport: 7,
  highConfidenceHomogeneousMultiStudyBonus: 5,
  nearDuplicateEvidenceSupport: 10,
  systemicLoadBearingStudyDependency: 8,
  provenanceConcentration: 10,
  firstAuthorConcentrationBonus: 6,
  journalConcentrationBonus: 4,
  provenanceNarrowMultiStudySupport: 8,
  highConfidenceProvenanceNarrowBonus: 4,
  pseudoMultiSourceSupport: 9,
  uncertainStudyIdentityCoverage: 10,
  highConfidenceIdentityUncertaintyBonus: 8,
  weakIdentityCoverageBonus: 6,
  severeStudyClassConflict: 100,
  studyClassAmbiguity: 5,
  synthesisRefreshGap: 10,
  highConfidenceSynthesisRefreshBonus: 5,
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
  'severe-canonical-study-class-conflict': 'structural',
  'synthesis-only-approved-outcome': 'claim-support',
  'semantic-claim-source-mismatch': 'semantic',
  'semantic-single-source-support': 'semantic',
  'semantic-support-concentration': 'semantic',
  'semantic-metadata-coverage-gap': 'semantic',
  'causal-language-without-controlled-or-synthesis': 'semantic',
  'causal-language-without-direct-controlled-study': 'semantic',
  'synthesis-only-causal-language': 'semantic',
  'single-study-approved-claim': 'concentration',
  'high-study-dependency': 'concentration',
  'narrow-repeated-evidence-bundle': 'concentration',
  'narrow-cross-profile-evidence-bundle': 'concentration',
  'homogeneous-multi-study-support': 'concentration',
  'near-duplicate-claim-evidence-support': 'concentration',
  'systemic-load-bearing-study-dependency': 'concentration',
  'provenance-concentrated-evidence': 'concentration',
  'claim-provenance-narrow-multi-study-support': 'concentration',
  'pseudo-multi-source-support': 'concentration',
  'narrative-review-dominated-profile': 'evidence-mix',
  'edge-weighted-narrative-dominance': 'evidence-mix',
  'approved-claims-without-primary-human-study': 'evidence-mix',
  'unmapped-primary-human-evidence': 'mapping',
  'primary-human-evidence-only-on-unapproved-claims': 'mapping',
  'uncertain-study-identity-independence': 'identity',
  'poor-study-metadata-coverage': 'metadata',
  'claim-citation-metadata-gap': 'metadata',
  'canonical-study-class-ambiguity': 'metadata',
  'unknown-evidence-year-metadata': 'metadata',
  'synthesis-outpaced-by-newer-primary-evidence': 'freshness',
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
      add(claim.url, 'single-study-approved-claim', RESEARCH_GAP_WEIGHTS.singleStudyApprovedClaim + high + veryHigh, `${claim.claimId} · confidence ${claim.confidence}`)
    }
    if (claim.outcomeClaim && claim.primaryHuman === 0 && claim.synthesis > 0) {
      add(claim.url, 'synthesis-only-approved-outcome', RESEARCH_GAP_WEIGHTS.synthesisOnlyApprovedOutcome, `${claim.claimId} · synthesis present but no primary-human study`)
    }

    const confidenceBonus = claim.highConfidenceWeakStructured ? RESEARCH_GAP_WEIGHTS.highConfidenceWeakClaimBonus : 0
    if (claim.structuredSupportTier === 'unclassified') {
      add(claim.url, 'claim-support-unclassified', RESEARCH_GAP_WEIGHTS.unclassifiedStructuredSupport + confidenceBonus, `${claim.claimId} · ${claim.predicate}`)
    } else if (claim.structuredSupportTier === 'narrative-only') {
      const base = claim.outcomeClaim ? RESEARCH_GAP_WEIGHTS.narrativeOnlyOutcomeSupport : RESEARCH_GAP_WEIGHTS.narrativeOnlyOtherStructuredSupport
      add(claim.url, 'claim-support-narrative-only', base + confidenceBonus, `${claim.claimId} · ${claim.predicate}`)
    } else if (claim.supportTier === 'indirect-only') {
      const bonus = claim.highConfidenceWeakOutcome ? RESEARCH_GAP_WEIGHTS.highConfidenceWeakClaimBonus : 0
      add(claim.url, 'claim-support-indirect-only', RESEARCH_GAP_WEIGHTS.indirectOutcomeSupport + bonus, claim.claimId)
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
      add(claim.url, 'unapproved-claim-support-single-study', RESEARCH_GAP_WEIGHTS.unapprovedSingleStudyStructuredClaim, detail)
    } else if (claim.supportTier === 'indirect-only') {
      add(claim.url, 'unapproved-claim-support-indirect-only', RESEARCH_GAP_WEIGHTS.weakUnapprovedStructuredClaim, detail)
    }
  }
}

function addProfileReasons(analysis: ResearchQualityAnalysis, add: AddReason) {
  for (const profile of analysis.profileAnalyses) {
    if (profile.overDependentOnSingleStudy) {
      const concentrationBonus = Math.round(Math.min(15, profile.studyConcentrationIndex * 20))
      add(profile.url, 'high-study-dependency', Math.round(25 + profile.dominantStudySupportedClaimShare * 30 + concentrationBonus), `${Math.round(profile.dominantStudySupportedClaimShare * 100)}% of supported approved claims depend on one canonical study; effective study count ${profile.effectiveStudyCount}`)
    }
    if (profile.narrativeDominatedVsPrimaryHuman) {
      const detail = profile.narrativeToPrimaryHumanRatio === null ? 'no primary-human studies' : `${profile.narrativeToPrimaryHumanRatio}:1 narrative-to-primary-human ratio`
      add(profile.url, 'narrative-review-dominated-profile', RESEARCH_GAP_WEIGHTS.narrativeReviewDominatedProfile, detail)
    }
    if (profile.noPrimaryHuman) add(profile.url, 'approved-claims-without-primary-human-study', RESEARCH_GAP_WEIGHTS.noPrimaryHumanStudy)

    const mappingBonus = profile.noPrimaryHuman ? RESEARCH_GAP_WEIGHTS.mappingGapNoApprovedPrimaryBonus : 0
    if (profile.unmappedPrimaryHuman > 0) add(profile.url, 'unmapped-primary-human-evidence', RESEARCH_GAP_WEIGHTS.unmappedPrimaryHumanEvidence + mappingBonus, `${profile.unmappedPrimaryHuman} primary-human studies are not linked to structured claims`)
    if (profile.unapprovedOnlyPrimaryHuman > 0) add(profile.url, 'primary-human-evidence-only-on-unapproved-claims', RESEARCH_GAP_WEIGHTS.unapprovedOnlyPrimaryHumanEvidence + mappingBonus, `${profile.unapprovedOnlyPrimaryHuman} primary-human studies are linked only to unapproved claims`)

    const unclassifiedStudies = Number(profile.designMix.unclassified ?? 0)
    const coverage = profile.canonicalStudyCount ? Math.max(0, profile.canonicalStudyCount - unclassifiedStudies) / profile.canonicalStudyCount : 1
    if (profile.canonicalStudyCount >= 3 && coverage < 0.7) {
      add(profile.url, 'poor-study-metadata-coverage', RESEARCH_GAP_WEIGHTS.poorStudyMetadataCoverage, `${Math.round(coverage * 100)}% of canonical studies have classified designs`)
    }
  }
}

function addTopologyReasons(topology: ResearchQualityTopology, add: AddReason) {
  for (const bundle of topology.narrowRepeatedEvidenceBundles) {
    const bonus = Math.min(10, Math.max(0, bundle.approvedClaimCount - 3) * 2)
    add(bundle.url, 'narrow-repeated-evidence-bundle', RESEARCH_GAP_WEIGHTS.narrowRepeatedEvidenceBundle + bonus, `${bundle.approvedClaimCount} approved claims reuse the same ${bundle.studyCount}-study bundle`)
  }
  for (const claim of topology.homogeneousMultiStudyClaims) {
    const bonus = claim.highConfidenceHomogeneousMultiStudySupport ? RESEARCH_GAP_WEIGHTS.highConfidenceHomogeneousMultiStudyBonus : 0
    add(claim.url, 'homogeneous-multi-study-support', RESEARCH_GAP_WEIGHTS.homogeneousMultiStudySupport + bonus, `${claim.claimId} · ${claim.studyCount} studies but one evidence family (${claim.evidenceFamilies.join(', ')})`)
  }
  for (const claim of topology.edgeCardinality.pseudoMultiSourceClaims) {
    if (!claim.approved) continue
    const bonus = Math.min(6, claim.aliasCollapsedSourceCount * 2)
    add(
      claim.url,
      'pseudo-multi-source-support',
      RESEARCH_GAP_WEIGHTS.pseudoMultiSourceSupport + bonus,
      `${claim.claimId} · ${claim.validUniqueSourceRefCount} distinct source rows collapse to ${claim.canonicalStudyCount} canonical study`,
    )
  }

  const overlapByProfile = new Map<string, typeof topology.claimEvidenceOverlap>()
  for (const overlap of topology.claimEvidenceOverlap) {
    overlapByProfile.set(overlap.url, [...(overlapByProfile.get(overlap.url) ?? []), overlap])
  }
  for (const [url, overlaps] of overlapByProfile) {
    const bonus = Math.min(10, Math.max(0, overlaps.length - 1) * 2)
    add(url, 'near-duplicate-claim-evidence-support', RESEARCH_GAP_WEIGHTS.nearDuplicateEvidenceSupport + bonus, `${overlaps.length} claim pairs share near-duplicate evidence; ${overlaps.filter((item) => item.differentPredicates).length} cross-predicate`)
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
  for (const [url, item] of systemicByProfile) {
    const bonus = Math.min(12, Math.max(0, item.studies - 1) * 2)
    add(url, 'systemic-load-bearing-study-dependency', RESEARCH_GAP_WEIGHTS.systemicLoadBearingStudyDependency + bonus, `${item.studies} site-wide load-bearing studies support ${item.claims} claims on this profile`)
  }

  for (const design of topology.edgeWeightedNarrativeDominatedProfiles) {
    add(design.url, 'edge-weighted-narrative-dominance', RESEARCH_GAP_WEIGHTS.edgeWeightedNarrativeDominance, `${Math.round(design.narrativeReviewEdgeShare * 100)}% of classified approved claim-study edges are narrative reviews`)
  }
  for (const provenance of topology.provenanceConcentratedProfiles) {
    const weight = RESEARCH_GAP_WEIGHTS.provenanceConcentration
      + (provenance.firstAuthorConcentrated ? RESEARCH_GAP_WEIGHTS.firstAuthorConcentrationBonus : 0)
      + (provenance.journalConcentrated ? RESEARCH_GAP_WEIGHTS.journalConcentrationBonus : 0)
    add(provenance.url, 'provenance-concentrated-evidence', weight, `first-author share ${Math.round(provenance.dominantFirstAuthorEdgeShare * 100)}%; journal share ${Math.round(provenance.dominantJournalEdgeShare * 100)}%`)
  }

  for (const identity of topology.studyIdentityCoverage.profiles) {
    if (identity.uncertainMultiStudyClaimCount === 0 && !identity.weakIdentityCoverage) continue
    const weight = RESEARCH_GAP_WEIGHTS.uncertainStudyIdentityCoverage
      + (identity.highConfidenceUncertainClaimCount > 0 ? RESEARCH_GAP_WEIGHTS.highConfidenceIdentityUncertaintyBonus : 0)
      + (identity.weakIdentityCoverage ? RESEARCH_GAP_WEIGHTS.weakIdentityCoverageBonus : 0)
    add(identity.url, 'uncertain-study-identity-independence', weight, `${identity.uncertainMultiStudyClaimCount} multi-study claims include fallback identities; ${Math.round(identity.stableIdentityCoverage * 100)}% stable identity coverage`)
  }

  for (const freshness of topology.claimEvidenceAge) {
    if (freshness.synthesisOutpacedByNewerPrimaryEvidence) {
      const bonus = freshness.highConfidenceSynthesisRefreshGap ? RESEARCH_GAP_WEIGHTS.highConfidenceSynthesisRefreshBonus : 0
      add(
        freshness.url,
        'synthesis-outpaced-by-newer-primary-evidence',
        RESEARCH_GAP_WEIGHTS.synthesisRefreshGap + bonus,
        `${freshness.claimId} · newest synthesis ${freshness.newestSynthesisYear ?? 'unknown'} trails primary-human evidence ${freshness.newestPrimaryHumanYear ?? 'unknown'} by ${freshness.synthesisLagYears ?? '?'} years${bonus ? ' · high confidence' : ''}`,
      )
    }
    if (freshness.studyCount > 0 && freshness.knownYearCount === 0) {
      add(freshness.url, 'unknown-evidence-year-metadata', RESEARCH_GAP_WEIGHTS.unknownEvidenceYearMetadata, `${freshness.claimId} · publication year unknown for all ${freshness.studyCount} studies`)
    } else if (freshness.legacyOnlyOutcomeClaim) {
      const bonus = freshness.highConfidenceLegacyOnlyClaim ? RESEARCH_GAP_WEIGHTS.highConfidenceLegacyOnlyBonus : 0
      add(freshness.url, 'legacy-only-outcome-evidence', RESEARCH_GAP_WEIGHTS.legacyOnlyOutcomeClaim + bonus, `${freshness.claimId} · newest known supporting study ${freshness.newestYear ?? 'unknown'}`)
    }
  }

  const aggregatedWeights = {
    narrowCrossProfileEvidenceBundle: RESEARCH_GAP_WEIGHTS.narrowCrossProfileEvidenceBundle,
    semanticMismatch: RESEARCH_GAP_WEIGHTS.semanticMismatch,
    highConfidenceSemanticMismatchBonus: RESEARCH_GAP_WEIGHTS.highConfidenceSemanticMismatchBonus,
    semanticSingleSource: RESEARCH_GAP_WEIGHTS.semanticSingleSource,
    semanticSupportConcentration: RESEARCH_GAP_WEIGHTS.semanticSupportConcentration,
    highConfidenceSemanticConcentrationBonus: RESEARCH_GAP_WEIGHTS.highConfidenceSemanticConcentrationBonus,
    semanticMetadataCoverageGap: RESEARCH_GAP_WEIGHTS.semanticMetadataCoverageGap,
    highConfidenceSemanticCoverageGapBonus: RESEARCH_GAP_WEIGHTS.highConfidenceSemanticCoverageGapBonus,
    causalWithoutControlledOrSynthesis: RESEARCH_GAP_WEIGHTS.causalWithoutControlledOrSynthesis,
    causalWithoutDirectControlled: RESEARCH_GAP_WEIGHTS.causalWithoutDirectControlled,
    synthesisOnlyCausalSupport: RESEARCH_GAP_WEIGHTS.synthesisOnlyCausalSupport,
    highConfidenceCausalLanguageBonus: RESEARCH_GAP_WEIGHTS.highConfidenceCausalLanguageBonus,
    claimCitationMetadataGap: RESEARCH_GAP_WEIGHTS.claimCitationMetadataGap,
    highConfidenceCitationMetadataBonus: RESEARCH_GAP_WEIGHTS.highConfidenceCitationMetadataBonus,
    provenanceNarrowMultiStudySupport: RESEARCH_GAP_WEIGHTS.provenanceNarrowMultiStudySupport,
    highConfidenceProvenanceNarrowBonus: RESEARCH_GAP_WEIGHTS.highConfidenceProvenanceNarrowBonus,
    severeStudyClassConflict: RESEARCH_GAP_WEIGHTS.severeStudyClassConflict,
    studyClassAmbiguity: RESEARCH_GAP_WEIGHTS.studyClassAmbiguity,
  }
  for (const signal of buildAggregatedTopologyGapSignals(topology, aggregatedWeights)) {
    add(signal.url, signal.kind, signal.weight, signal.detail)
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
  return { ...item, score: Math.round(score), rawScore: Math.round(rawScore), dimensionScores, dimensionRawScores, cappedDimensions, reasonCounts }
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
