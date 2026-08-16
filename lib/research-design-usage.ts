import {
  NARRATIVE_STUDY_CLASSES,
  PRIMARY_HUMAN_STUDY_CLASSES,
  SYNTHESIS_STUDY_CLASSES,
} from './research-coverage'
import type { ResearchQualityAnalysis } from './research-quality-analysis'

export type EdgeWeightedDesignUsage = {
  url: string
  claimStudyEdges: number
  classifiedEdges: number
  unclassifiedEdges: number
  primaryHumanEdges: number
  synthesisEdges: number
  narrativeReviewEdges: number
  otherClassifiedEdges: number
  primaryHumanEdgeShare: number
  synthesisEdgeShare: number
  narrativeReviewEdgeShare: number
  narrativeToPrimaryHumanEdgeRatio: number | null
  edgeWeightedNarrativeDominated: boolean
}

function round(value: number, digits = 3): number {
  const scale = 10 ** digits
  return Math.round(value * scale) / scale
}

/**
 * Count study-design usage by approved claim-study edge rather than only by
 * unique study inventory. This answers a different question: which evidence
 * classes actually carry the site's approved claims most often?
 */
export function analyzeEdgeWeightedDesignUsage(analysis: ResearchQualityAnalysis): EdgeWeightedDesignUsage[] {
  const byUrl = new Map<string, {
    claimStudyEdges: number
    classifiedEdges: number
    unclassifiedEdges: number
    primaryHumanEdges: number
    synthesisEdges: number
    narrativeReviewEdges: number
    otherClassifiedEdges: number
  }>()

  for (const claim of analysis.claimAnalyses) {
    const item = byUrl.get(claim.url) ?? {
      claimStudyEdges: 0,
      classifiedEdges: 0,
      unclassifiedEdges: 0,
      primaryHumanEdges: 0,
      synthesisEdges: 0,
      narrativeReviewEdges: 0,
      otherClassifiedEdges: 0,
    }

    for (const design of claim.designs) {
      item.claimStudyEdges += 1
      if (design === 'unclassified') {
        item.unclassifiedEdges += 1
        continue
      }

      item.classifiedEdges += 1
      if (PRIMARY_HUMAN_STUDY_CLASSES.has(design)) item.primaryHumanEdges += 1
      else if (SYNTHESIS_STUDY_CLASSES.has(design)) item.synthesisEdges += 1
      else if (NARRATIVE_STUDY_CLASSES.has(design)) item.narrativeReviewEdges += 1
      else item.otherClassifiedEdges += 1
    }

    byUrl.set(claim.url, item)
  }

  return [...byUrl.entries()]
    .map(([url, item]) => {
      const denominator = item.classifiedEdges || 1
      const primaryHumanEdgeShare = item.primaryHumanEdges / denominator
      const synthesisEdgeShare = item.synthesisEdges / denominator
      const narrativeReviewEdgeShare = item.narrativeReviewEdges / denominator
      const narrativeToPrimaryHumanEdgeRatio = item.primaryHumanEdges > 0
        ? item.narrativeReviewEdges / item.primaryHumanEdges
        : item.narrativeReviewEdges > 0
          ? null
          : 0
      const edgeWeightedNarrativeDominated =
        item.classifiedEdges >= 4
        && item.narrativeReviewEdges >= 3
        && narrativeReviewEdgeShare >= 0.6
        && (item.primaryHumanEdges === 0 || item.narrativeReviewEdges >= item.primaryHumanEdges * 2)

      return {
        url,
        ...item,
        primaryHumanEdgeShare: round(primaryHumanEdgeShare),
        synthesisEdgeShare: round(synthesisEdgeShare),
        narrativeReviewEdgeShare: round(narrativeReviewEdgeShare),
        narrativeToPrimaryHumanEdgeRatio:
          narrativeToPrimaryHumanEdgeRatio === null ? null : round(narrativeToPrimaryHumanEdgeRatio),
        edgeWeightedNarrativeDominated,
      }
    })
    .sort((a, b) =>
      Number(b.edgeWeightedNarrativeDominated) - Number(a.edgeWeightedNarrativeDominated)
      || b.narrativeReviewEdgeShare - a.narrativeReviewEdgeShare
      || b.claimStudyEdges - a.claimStudyEdges
      || a.url.localeCompare(b.url),
    )
}
