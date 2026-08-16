import type { EvidenceGradeConsistencyReport } from './evidence-grade-consistency'
import type { ResearchQualityAnalysis } from './research-quality-analysis'
import {
  buildResearchGapQueue,
  RESEARCH_GAP_DIMENSION_CAPS,
  type ResearchGapDimension,
  type ResearchGapItem,
  type ResearchGapReason,
} from './research-quality-policy'
import type { ResearchQualityTopology } from './research-quality-topology'

export const EVIDENCE_GRADE_BLOCKER_REASON = 'evidence-grade-topology-contradiction'
export const EVIDENCE_GRADE_BLOCKER_WEIGHT = 100
export const STUDY_DEPENDENCY_REASON = 'high-study-dependency'

function recalculate(item: Pick<ResearchGapItem, 'url' | 'reasons'>): ResearchGapItem {
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
    url: item.url,
    reasons: item.reasons,
    score: Math.round(score),
    rawScore: Math.round(rawScore),
    dimensionScores,
    dimensionRawScores,
    cappedDimensions,
    reasonCounts,
  }
}

/**
 * Replace every publication-level or transition-only study-dependency reason
 * inherited from the base policy with exactly one current underlying-study
 * concentration reason per canonically overdependent profile.
 */
function canonicalizeStudyDependencyReasons(
  byUrl: Map<string, Pick<ResearchGapItem, 'url' | 'reasons'>>,
  topology: ResearchQualityTopology,
) {
  for (const item of byUrl.values()) {
    item.reasons = item.reasons.filter((reason) => reason.kind !== STUDY_DEPENDENCY_REASON)
  }

  for (const profile of topology.underlyingStudyIndependence.profiles) {
    if (!profile.overDependentOnSingleUnderlyingStudy) continue
    const item = byUrl.get(profile.url) ?? { url: profile.url, reasons: [] }
    const concentrationBonus = Math.round(Math.min(15, profile.underlyingStudyConcentrationIndex * 20))
    const weight = Math.round(25 + profile.dominantUnderlyingStudySupportedClaimShare * 30 + concentrationBonus)
    const reason: ResearchGapReason = {
      kind: STUDY_DEPENDENCY_REASON,
      dimension: 'concentration',
      weight,
      detail: `${Math.round(profile.dominantUnderlyingStudySupportedClaimShare * 100)}% of supported approved claims depend on one underlying study after explicit publication-lineage collapse; ${profile.publicationStudyCount} publications resolve to ${profile.underlyingStudyCount} underlying studies; effective underlying-study count ${profile.effectiveUnderlyingStudyCount}`,
    }
    item.reasons.push(reason)
    byUrl.set(profile.url, item)
  }
}

/**
 * Production remediation queue for the canonical research-quality snapshot.
 *
 * The base policy intentionally remains independent of profile-file grade state.
 * This wrapper joins the already-computed evidence-grade consistency result to
 * that queue so every hard Grade A topology contradiction has an explicit,
 * structural editorial remediation target. It also canonicalizes study
 * dependency remediation onto the underlying-study graph, replacing raw
 * publication-level and transition-only dependency reasons. No analyzers are
 * rerun here.
 */
export function buildCanonicalResearchGapQueue(
  analysis: ResearchQualityAnalysis,
  topology: ResearchQualityTopology,
  evidenceGradeConsistency: EvidenceGradeConsistencyReport,
): ResearchGapItem[] {
  const byUrl = new Map<string, Pick<ResearchGapItem, 'url' | 'reasons'>>(
    buildResearchGapQueue(analysis, topology).map((item) => [
      item.url,
      { url: item.url, reasons: [...item.reasons] },
    ]),
  )

  canonicalizeStudyDependencyReasons(byUrl, topology)

  for (const finding of evidenceGradeConsistency.topologyContradictions) {
    const item = byUrl.get(finding.url) ?? { url: finding.url, reasons: [] }
    if (!item.reasons.some((reason) => reason.kind === EVIDENCE_GRADE_BLOCKER_REASON)) {
      const reason: ResearchGapReason = {
        kind: EVIDENCE_GRADE_BLOCKER_REASON,
        dimension: 'structural',
        weight: EVIDENCE_GRADE_BLOCKER_WEIGHT,
        detail: `Published Grade A conflicts with canonical underlying-study independence: ${finding.issues.join(', ')}`,
      }
      item.reasons.push(reason)
      byUrl.set(finding.url, item)
    }
  }

  return [...byUrl.values()]
    .map(recalculate)
    .filter((item) => item.reasons.length > 0)
    .sort((a, b) => b.score - a.score || b.rawScore - a.rawScore || b.reasons.length - a.reasons.length || a.url.localeCompare(b.url))
}
