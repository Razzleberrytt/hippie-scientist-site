import { describe, expect, it } from 'vitest'

import { buildResearchMetadataIntegrity } from '@/lib/research-metadata-integrity'

describe('research metadata integrity rollup', () => {
  it('groups specialized metadata findings once per profile without redefining detection', () => {
    const inputs = {
      studyYearConflicts: [
        { url: '/herbs/a/', studyId: 'study-a', years: [2018, 2020], minYear: 2018, maxYear: 2020, yearSpread: 2 },
      ],
      provenanceConflicts: [
        {
          url: '/herbs/a/',
          studyId: 'study-a',
          firstAuthorCandidates: ['alpha', 'beta'],
          journalCandidates: [],
          firstAuthorConflict: true,
          journalConflict: false,
        },
      ],
      studyClassConflicts: {
        conflicts: [
          { url: '/herbs/a/', studyId: 'study-a', sourceIds: ['s1', 's2'], classes: ['rct', 'animal'], families: ['primary-human', 'preclinical'], severe: true },
          { url: '/herbs/b/', studyId: 'study-b', sourceIds: ['s1', 's2'], classes: ['rct', 'controlled-trial'], families: ['primary-human'], severe: false },
        ],
        severeConflicts: [
          { url: '/herbs/a/', studyId: 'study-a', sourceIds: ['s1', 's2'], classes: ['rct', 'animal'], families: ['primary-human', 'preclinical'], severe: true },
        ],
        summary: { canonicalStudiesChecked: 2, studiesWithClassConflict: 2, severeClassConflicts: 1 },
      },
      claimCitationMetadata: {
        claims: [],
        lowCoverageClaims: [
          { url: '/herbs/a/', claimId: 'a', predicate: 'supports_outcome', confidence: 0.9, studyCount: 2, completeStudyCount: 0, metadataCoverage: 0, fieldMetadataCoverage: 0.5, missingFieldCounts: {}, lowMetadataCoverage: true, highConfidenceLowMetadataCoverage: true },
          { url: '/herbs/b/', claimId: 'b', predicate: 'supports_outcome', confidence: 0.5, studyCount: 2, completeStudyCount: 0, metadataCoverage: 0, fieldMetadataCoverage: 0.5, missingFieldCounts: {}, lowMetadataCoverage: true, highConfidenceLowMetadataCoverage: false },
        ],
        highConfidenceLowCoverageClaims: [
          { url: '/herbs/a/', claimId: 'a', predicate: 'supports_outcome', confidence: 0.9, studyCount: 2, completeStudyCount: 0, metadataCoverage: 0, fieldMetadataCoverage: 0.5, missingFieldCounts: {}, lowMetadataCoverage: true, highConfidenceLowMetadataCoverage: true },
        ],
        summary: {
          approvedClaimsWithStudies: 2,
          lowMetadataCoverageClaims: 2,
          highConfidenceLowMetadataCoverageClaims: 1,
          averageMetadataCoverage: 0,
          averageFieldMetadataCoverage: 0.5,
        },
      },
    } as Parameters<typeof buildResearchMetadataIntegrity>[0]

    const result = buildResearchMetadataIntegrity(inputs)

    expect(result.profiles[0]).toMatchObject({
      url: '/herbs/a/',
      yearConflicts: 1,
      provenanceConflicts: 1,
      studyClassConflicts: 1,
      severeStudyClassConflicts: 1,
      lowCitationMetadataClaims: 1,
      highConfidenceLowCitationMetadataClaims: 1,
      issueCount: 4,
      severeIssueCount: 2,
    })
    expect(result.profiles[1]).toMatchObject({
      url: '/herbs/b/',
      issueCount: 2,
      severeIssueCount: 0,
    })
    expect(result.summary).toMatchObject({
      profilesWithIssues: 2,
      profilesWithSevereIssues: 1,
      yearConflicts: 1,
      provenanceConflicts: 1,
      studyClassConflicts: 2,
      severeStudyClassConflicts: 1,
      lowCitationMetadataClaims: 2,
      highConfidenceLowCitationMetadataClaims: 1,
    })
  })
})
