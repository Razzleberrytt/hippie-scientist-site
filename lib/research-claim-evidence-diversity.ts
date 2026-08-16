import {
  NARRATIVE_STUDY_CLASSES,
  PRIMARY_HUMAN_STUDY_CLASSES,
  SYNTHESIS_STUDY_CLASSES,
} from './research-coverage'
import type { ResearchQualityAnalysis } from './research-quality-analysis'
import type { StudyClass } from './study-class'

export type EvidenceFamily =
  | 'primary-human'
  | 'synthesis'
  | 'other-human'
  | 'narrative'
  | 'regulatory'
  | 'preclinical'
  | 'unclassified'

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
  replicatedSynthesisSupport: boolean
  replicatedOtherHumanSupport: boolean
  homogeneousMultiStudySupport: boolean
  highConfidenceHomogeneousMultiStudySupport: boolean
}

const NARROW_HOMOGENEOUS_FAMILIES = new Set<EvidenceFamily>([
  'narrative',
  'preclinical',
  'unclassified',
])

function familyForDesign(design: StudyClass): EvidenceFamily {
  if (PRIMARY_HUMAN_STUDY_CLASSES.has(design)) return 'primary-human'
  if (SYNTHESIS_STUDY_CLASSES.has(design)) return 'synthesis'
  if (NARRATIVE_STUDY_CLASSES.has(design)) return 'narrative'
  if (design === 'observational' || design === 'case-report') return 'other-human'
  if (design === 'animal' || design === 'in-vitro') return 'preclinical'
  if (design === 'regulatory-guidance') return 'regulatory'
  return 'unclassified'
}

/**
 * Measure evidence diversity at the approved-claim level without turning
 * legitimate replication into a defect. Same-family evidence is descriptive;
 * only narrative, preclinical, or unclassified same-family bundles are treated
 * as a narrow homogeneity gap.
 *
 * Multiple primary-human studies, multiple syntheses, and multiple
 * observational/case-report human studies remain visible as replication-like
 * topology but are not penalized merely for sharing a broad evidence family.
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
      const replicatedSynthesisSupport = sameFamilyMultiStudySupport && onlyFamily === 'synthesis'
      const replicatedOtherHumanSupport = sameFamilyMultiStudySupport && onlyFamily === 'other-human'
      const homogeneousMultiStudySupport = Boolean(
        sameFamilyMultiStudySupport && onlyFamily && NARROW_HOMOGENEOUS_FAMILIES.has(onlyFamily),
      )

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
        replicatedSynthesisSupport,
        replicatedOtherHumanSupport,
        homogeneousMultiStudySupport,
        highConfidenceHomogeneousMultiStudySupport: homogeneousMultiStudySupport && claim.confidence >= 0.75,
      }
    })
    .sort((a, b) =>
      Number(b.highConfidenceHomogeneousMultiStudySupport) - Number(a.highConfidenceHomogeneousMultiStudySupport)
      || Number(b.homogeneousMultiStudySupport) - Number(a.homogeneousMultiStudySupport)
      || Number(b.replicatedPrimaryHumanSupport) - Number(a.replicatedPrimaryHumanSupport)
      || Number(b.replicatedSynthesisSupport) - Number(a.replicatedSynthesisSupport)
      || Number(b.replicatedOtherHumanSupport) - Number(a.replicatedOtherHumanSupport)
      || b.studyCount - a.studyCount
      || b.confidence - a.confidence
      || a.url.localeCompare(b.url)
      || a.claimId.localeCompare(b.claimId),
    )
}
