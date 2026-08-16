import { describe, expect, it } from 'vitest'

import {
  analyzePublicEvidenceAmbiguity,
  analyzePublicStudyAmbiguity,
} from '@/lib/public-evidence-ambiguity-analysis'
import type { PublicStudyEntity } from '@/lib/public-evidence-dataset'

function study(overrides: Partial<PublicStudyEntity>): PublicStudyEntity {
  return {
    id: 'doi:10.1000/example',
    title: 'Example publication',
    evidenceClass: 'other',
    confidence: 'unknown',
    conditions: [],
    relationships: [],
    relationshipSummary: 'background',
    ...overrides,
  }
}

describe('public evidence ambiguity magnitude', () => {
  it('derives objective spans and cross-family class conflict without severity thresholds', () => {
    const result = analyzePublicStudyAmbiguity(study({
      publicationYearCandidates: [2020, 2023],
      publicationYearAmbiguous: true,
      participantCountCandidates: [100, 250],
      participantCountAmbiguous: true,
      studyClassCandidates: ['randomized_controlled_trial', 'systematic_review'],
      studyClassAmbiguous: true,
    }))

    expect(result).toEqual({
      publicationYearSpan: 3,
      participantCountAbsoluteSpread: 150,
      participantCountRatio: 2.5,
      studyClassFamilies: ['primary-human-trial', 'synthesis'],
      crossFamilyStudyClassConflict: true,
    })
  })

  it('keeps same-family design ambiguity distinct from cross-family conflict', () => {
    const result = analyzePublicStudyAmbiguity(study({
      studyClassCandidates: ['randomized_controlled_trial', 'controlled_trial'],
      studyClassAmbiguous: true,
    }))

    expect(result.studyClassFamilies).toEqual(['primary-human-trial'])
    expect(result.crossFamilyStudyClassConflict).toBe(false)
    expect(result.publicationYearSpan).toBeNull()
    expect(result.participantCountAbsoluteSpread).toBeNull()
    expect(result.participantCountRatio).toBeNull()
  })

  it('summarizes the largest observed conflict magnitudes across the public study inventory', () => {
    const analysis = analyzePublicEvidenceAmbiguity([
      study({
        id: 'doi:10.1000/one',
        publicationYearCandidates: [2020, 2021],
        publicationYearAmbiguous: true,
        participantCountCandidates: [100, 120],
        participantCountAmbiguous: true,
        studyClassCandidates: ['randomized_controlled_trial', 'controlled_trial'],
        studyClassAmbiguous: true,
      }),
      study({
        id: 'doi:10.1000/two',
        publicationYearCandidates: [2018, 2023],
        publicationYearAmbiguous: true,
        participantCountCandidates: [50, 200],
        participantCountAmbiguous: true,
        studyClassCandidates: ['animal', 'randomized_controlled_trial'],
        studyClassAmbiguous: true,
      }),
      study({ id: 'doi:10.1000/clean' }),
    ])

    expect(analysis.summary).toEqual({
      studiesAnalyzed: 3,
      studiesWithAnyAmbiguity: 2,
      crossFamilyStudyClassConflictCount: 1,
      largestPublicationYearSpan: 5,
      largestParticipantCountAbsoluteSpread: 150,
      largestParticipantCountRatio: 4,
    })
  })
})
