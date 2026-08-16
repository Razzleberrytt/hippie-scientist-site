import {
  NARRATIVE_STUDY_CLASSES,
  PRIMARY_HUMAN_STUDY_CLASSES,
  SYNTHESIS_STUDY_CLASSES,
} from './research-coverage'
import type { ResearchQualityAnalysis } from './research-quality-analysis'
import type { StudyClass } from './study-class'

export type EvidenceFamily = 'primary-human' | 'synthesis' | 'narrative' | 'other' | 'unclassified'

export type ClaimEvidenceDiversity = {
  url: string
  claimId: string
  predicate: string
  confidence: number
  studyCount: number
  distinctDesignCount: number
  distinctEvidenceFamilyCount: number
  evidenceFamilies: EvidenceFamily[]
  sameFamilyMultiStudySupport: boolean
  replicatedPrimaryHumanSupport: boolean
  homogeneousMultiStudySupport: boolean
  highConfidenceHomogeneousMultiStudySupport: boolean
}

function familyForDesign(design: StudyClass): EvidenceFamily {
  if (PRIMARY_HUMAN_STUDY_CLASSES.has(design)) return 'primary-human'
  if (SYNTHESIS_STUDY_CLASSES.has(design)) return 'synthesis'
  if (NARRATIVE_STUDY_CLASSES.has(design)) return 'narrative'
  if (design === 'unclassified') return 'unclassified'
  return 'other'
}

/**
 * Measure evidence diversity at the approved-claim level. Same-family support is
 * descriptive, not automatically weak: multiple primary-human trials are useful
 * replication and must not be penalized merely because they share a family.
 * `homogeneousMultiStudySupport` is therefore reserved for narrow same-family
 * support that still lacks direct primary-human diversity (narrative, synthesis,
 * other/indirect, or unclassified evidence only).
 */
export function analyzeClaimEvidenceDiversity(analysis: ResearchQualityAnalysis): ClaimEvidenceDiversity[] {
  return analysis.claimAnalyses
    .map((claim) => {
      const distinctDesignCount = new Set(claim.designs).size
      const evidenceFamilies = [...new Set(claim.designs.map(familyForDesign))].sort() as EvidenceFamily[]
      const distinctEvidenceFamilyCount = evidenceFamilies.length
      const sameFamilyMultiStudySupport = claim.studyCount >= 2 && distinctEvidenceFamilyCount === 1
      const onlyFamily = sameFamilyMultiStudySupport ? evidenceFamilies[0] : null
      const replicatedPrimaryHumanSupport = sameFamilyMultiStudySupport && onlyFamily === 'primary-human'
      const homogeneousMultiStudySupport = sameFamilyMultiStudySupport && onlyFamily !== 'primary-human'

      return {
        url: claim.url,
        claimId: claim.claimId,
        predicate: claim.predicate,
        confidence: claim.confidence,
        studyCount: claim.studyCount,
        distinctDesignCount,
        distinctEvidenceFamilyCount,
        evidenceFamilies,
        sameFamilyMultiStudySupport,
        replicatedPrimaryHumanSupport,
        homogeneousMultiStudySupport,
        highConfidenceHomogeneousMultiStudySupport: homogeneousMultiStudySupport && claim.confidence >= 0.75,
      }
    })
    .sort((a, b) =>
      Number(b.highConfidenceHomogeneousMultiStudySupport) - Number(a.highConfidenceHomogeneousMultiStudySupport)
      || Number(b.homogeneousMultiStudySupport) - Number(a.homogeneousMultiStudySupport)
      || Number(b.replicatedPrimaryHumanSupport) - Number(a.replicatedPrimaryHumanSupport)
      || b.studyCount - a.studyCount
      || b.confidence - a.confidence
      || a.url.localeCompare(b.url)
      || a.claimId.localeCompare(b.claimId),
    )
}
