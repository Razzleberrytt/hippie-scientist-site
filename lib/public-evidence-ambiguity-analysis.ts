import type { EvidenceStudyClass } from '@/lib/evidence-study'
import type { PublicStudyEntity } from '@/lib/public-evidence-dataset'

export type PublicEvidenceStudyClassFamily =
  | 'synthesis'
  | 'primary-human-trial'
  | 'other-human'
  | 'narrative'
  | 'preclinical'
  | 'other'

export type PublicEvidenceAmbiguityFlag =
  | 'publication-year'
  | 'participant-count'
  | 'study-class'

export type PublicStudyAmbiguityMagnitude = {
  publicationYearSpan: number | null
  participantCountAbsoluteSpread: number | null
  participantCountRatio: number | null
  studyClassFamilies: PublicEvidenceStudyClassFamily[]
  crossFamilyStudyClassConflict: boolean
  candidateDerivedAmbiguity: {
    publicationYear: boolean
    participantCount: boolean
    studyClass: boolean
  }
  storedFlagMismatches: PublicEvidenceAmbiguityFlag[]
}

export type PublicEvidenceAmbiguityAnalysis = {
  studies: Array<{
    studyId: string
    magnitude: PublicStudyAmbiguityMagnitude
  }>
  summary: {
    studiesAnalyzed: number
    studiesWithAnyAmbiguity: number
    ambiguityFlagMismatchStudyCount: number
    ambiguityFlagMismatchCount: number
    crossFamilyStudyClassConflictCount: number
    largestPublicationYearSpan: number
    largestParticipantCountAbsoluteSpread: number
    largestParticipantCountRatio: number
  }
}

function studyClassFamily(studyClass: EvidenceStudyClass): PublicEvidenceStudyClassFamily {
  if (studyClass === 'meta_analysis' || studyClass === 'systematic_review') return 'synthesis'
  if (studyClass === 'randomized_controlled_trial' || studyClass === 'controlled_trial') return 'primary-human-trial'
  if (studyClass === 'observational' || studyClass === 'case_report') return 'other-human'
  if (studyClass === 'narrative_review') return 'narrative'
  if (studyClass === 'animal' || studyClass === 'in_vitro' || studyClass === 'mechanistic') return 'preclinical'
  return 'other'
}

function span(values: number[]): number | null {
  if (values.length < 2) return null
  return values[values.length - 1] - values[0]
}

export function analyzePublicStudyAmbiguity(study: PublicStudyEntity): PublicStudyAmbiguityMagnitude {
  const yearCandidates = [...(study.publicationYearCandidates ?? [])].sort((a, b) => a - b)
  const participantCandidates = [...(study.participantCountCandidates ?? [])].sort((a, b) => a - b)
  const studyClassCandidates = [...new Set(study.studyClassCandidates ?? [])]
  const studyClassFamilies = [...new Set(
    studyClassCandidates.map(studyClassFamily),
  )].sort() as PublicEvidenceStudyClassFamily[]
  const participantCountAbsoluteSpread = span(participantCandidates)
  const minParticipantCount = participantCandidates[0]
  const maxParticipantCount = participantCandidates[participantCandidates.length - 1]
  const participantCountRatio = participantCandidates.length >= 2 && minParticipantCount > 0
    ? maxParticipantCount / minParticipantCount
    : null
  const candidateDerivedAmbiguity = {
    publicationYear: yearCandidates.length > 1,
    participantCount: participantCandidates.length > 1,
    studyClass: studyClassCandidates.length > 1,
  }
  const storedFlagMismatches: PublicEvidenceAmbiguityFlag[] = []
  if (Boolean(study.publicationYearAmbiguous) !== candidateDerivedAmbiguity.publicationYear) {
    storedFlagMismatches.push('publication-year')
  }
  if (Boolean(study.participantCountAmbiguous) !== candidateDerivedAmbiguity.participantCount) {
    storedFlagMismatches.push('participant-count')
  }
  if (Boolean(study.studyClassAmbiguous) !== candidateDerivedAmbiguity.studyClass) {
    storedFlagMismatches.push('study-class')
  }

  return {
    publicationYearSpan: span(yearCandidates),
    participantCountAbsoluteSpread,
    participantCountRatio,
    studyClassFamilies,
    crossFamilyStudyClassConflict: studyClassFamilies.length > 1,
    candidateDerivedAmbiguity,
    storedFlagMismatches,
  }
}

export function analyzePublicEvidenceAmbiguity(studies: PublicStudyEntity[]): PublicEvidenceAmbiguityAnalysis {
  const analyzed = studies.map((study) => ({
    studyId: study.id,
    magnitude: analyzePublicStudyAmbiguity(study),
  }))

  const studiesWithAnyAmbiguity = analyzed.filter(({ magnitude }) =>
    magnitude.candidateDerivedAmbiguity.publicationYear
    || magnitude.candidateDerivedAmbiguity.participantCount
    || magnitude.candidateDerivedAmbiguity.studyClass,
  ).length
  const mismatchStudies = analyzed.filter(({ magnitude }) => magnitude.storedFlagMismatches.length > 0)

  return {
    studies: analyzed,
    summary: {
      studiesAnalyzed: studies.length,
      studiesWithAnyAmbiguity,
      ambiguityFlagMismatchStudyCount: mismatchStudies.length,
      ambiguityFlagMismatchCount: mismatchStudies.reduce((sum, item) => sum + item.magnitude.storedFlagMismatches.length, 0),
      crossFamilyStudyClassConflictCount: analyzed.filter((item) => item.magnitude.crossFamilyStudyClassConflict).length,
      largestPublicationYearSpan: Math.max(0, ...analyzed.map((item) => item.magnitude.publicationYearSpan ?? 0)),
      largestParticipantCountAbsoluteSpread: Math.max(0, ...analyzed.map((item) => item.magnitude.participantCountAbsoluteSpread ?? 0)),
      largestParticipantCountRatio: Math.max(0, ...analyzed.map((item) => item.magnitude.participantCountRatio ?? 0)),
    },
  }
}
