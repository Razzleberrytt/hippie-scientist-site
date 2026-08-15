import { describe, expect, it } from 'vitest'

import {
  assessPublicationBias,
  countIndependentTrials,
  detectStudyIndependence,
  hasReplicationOutsideSponsor,
  scoreRiskOfBias,
  scoreStudyRelevance,
  summarizeSponsorship,
  summarizeStudySet,
} from '@/lib/evidence/study-quality'

const lowBias = scoreRiskOfBias({
  randomization: 'low',
  blinding: 'low',
  allocationConcealment: 'low',
  attrition: 'low',
  selectiveReporting: 'low',
  sampleSize: 'low',
  preregistration: 'low',
  fundingConflict: 'low',
})

describe('study relevance', () => {
  it('keeps loosely related studies out of primary synthesis', () => {
    const exact = scoreStudyRelevance({
      ingredientMatch: 1,
      formulationMatch: 1,
      populationMatch: 1,
      outcomeMatch: 1,
      doseMatch: 1,
      durationMatch: 1,
      studyDesign: 'randomized-controlled-trial',
    })
    const loose = scoreStudyRelevance({
      ingredientMatch: 0.5,
      formulationMatch: 0.25,
      populationMatch: 0.5,
      outcomeMatch: 0.5,
      doseMatch: 0.25,
      durationMatch: 0.5,
      studyDesign: 'randomized-controlled-trial',
    })

    expect(exact.eligibleForPrimarySynthesis).toBe(true)
    expect(loose.eligibleForPrimarySynthesis).toBe(false)
    expect(loose.score).toBeLessThan(exact.score)
  })
})

describe('study independence', () => {
  const studies = [
    { studyId: 'paper-a', publicationId: 'p-a', trialRegistrationId: 'NCT001', cohortId: 'cohort-1' },
    { studyId: 'paper-b', publicationId: 'p-b', trialRegistrationId: 'nct 001', cohortId: 'cohort-1' },
    { studyId: 'paper-c', publicationId: 'p-c', trialRegistrationId: 'NCT002' },
  ]

  it('detects multiple papers from one registered trial', () => {
    expect(detectStudyIndependence(studies)).toContainEqual({
      leftStudyId: 'paper-a',
      rightStudyId: 'paper-b',
      independent: false,
      reason: 'same-trial-registration',
    })
    expect(countIndependentTrials(studies)).toBe(2)
  })

  it('detects heavily overlapping review evidence', () => {
    const relations = detectStudyIndependence([
      { studyId: 'review-a', publicationId: 'r-a', reviewPrimaryStudyIds: ['1', '2', '3'] },
      { studyId: 'review-b', publicationId: 'r-b', reviewPrimaryStudyIds: ['2', '3', '4'] },
    ])
    expect(relations[0]).toMatchObject({ independent: false, reason: 'overlapping-review-evidence' })
  })
})

describe('funding and publication bias context', () => {
  it('records sponsorship without automatically downgrading research', () => {
    const context = summarizeSponsorship({
      studyId: 's1',
      publicationId: 'p1',
      fundingSource: 'industry',
      sponsorId: 'brand-a',
      companyEmployeeAuthors: ['A. Researcher'],
      conflictsOfInterest: ['Employee of sponsor'],
    })
    expect(context).toMatchObject({ fundingSource: 'industry', transparent: true })
  })

  it('tracks replication outside the original sponsor', () => {
    expect(hasReplicationOutsideSponsor([
      { studyId: 's1', publicationId: 'p1', sponsorId: 'brand-a', trialRegistrationId: 'NCT1' },
      { studyId: 's2', publicationId: 'p2', fundingSource: 'independent', trialRegistrationId: 'NCT2' },
    ], 'brand-a')).toBe(true)
  })

  it('surfaces completed trials that appear unpublished', () => {
    const result = assessPublicationBias([
      { studyId: 's1', publicationId: 'p1', completedTrial: true, publicationFound: true },
      { studyId: 's2', publicationId: 'p2', completedTrial: true, publicationFound: false },
    ])
    expect(result.unpublishedCompletedTrialCount).toBe(1)
    expect(result.note).toContain('may not represent every completed trial')
  })
})

describe('risk of bias and synthesis', () => {
  it('uses standardized bias domains to reduce confidence in weak studies', () => {
    const highBias = scoreRiskOfBias({
      randomization: 'high',
      blinding: 'unclear',
      allocationConcealment: 'high',
      attrition: 'high',
      selectiveReporting: 'high',
      sampleSize: 'some-concerns',
      preregistration: 'unclear',
      fundingConflict: 'some-concerns',
    })

    expect(highBias.score).toBeLessThan(lowBias.score)
    expect(highBias.overall).toBe('high')
  })

  it('keeps raw publication count separate from independent evidence mass', () => {
    const relevance = scoreStudyRelevance({
      ingredientMatch: 1,
      formulationMatch: 1,
      populationMatch: 1,
      outcomeMatch: 1,
      doseMatch: 1,
      durationMatch: 1,
      studyDesign: 'randomized-controlled-trial',
    })
    const summary = summarizeStudySet([
      { studyId: 'paper-a', relevance, riskOfBias: lowBias, direction: 'positive', independentUnitId: 'trial-1', fundingSource: 'industry' },
      { studyId: 'paper-b', relevance, riskOfBias: lowBias, direction: 'positive', independentUnitId: 'trial-1', fundingSource: 'industry' },
      { studyId: 'paper-c', relevance, riskOfBias: lowBias, direction: 'null', independentUnitId: 'trial-2', fundingSource: 'independent' },
    ])

    expect(summary.studyCount).toBe(3)
    expect(summary.independentTrialCount).toBe(2)
    expect(summary.weightedEvidenceMass).toBeGreaterThan(0)
    expect(summary.industryFundedCount).toBe(2)
    expect(summary.independentlyFundedCount).toBe(1)
  })
})
