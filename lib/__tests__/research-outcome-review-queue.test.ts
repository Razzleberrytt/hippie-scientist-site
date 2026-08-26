import { describe, expect, it } from 'vitest'

import { buildOutcomeReviewQueue } from '@/lib/research-outcome-review-queue'
import type { OutcomeMetadataCoverageAnalysis } from '@/lib/research-outcome-metadata-coverage'
import type { OutcomeReportingIntegrityAnalysis } from '@/lib/research-outcome-reporting-integrity'

function integrity(): OutcomeReportingIntegrityAnalysis {
  const claim = {
    url: '/herbs/example/',
    claimId: 'claim-1',
    predicate: 'supports_outcome',
    confidence: 0.9,
    linkedStudyCount: 2,
    affectedStudyIds: ['pmid:1'],
    risks: ['registered-reported-primary-mismatch' as const],
    severity: 'high' as const,
  }
  return {
    studies: [],
    claims: [claim],
    highPriorityStudies: [],
    highPriorityClaims: [claim],
    summary: {
      affectedStudies: 0,
      affectedApprovedOutcomeClaims: 1,
      highPriorityStudies: 0,
      highPriorityClaims: 1,
      explicitOutcomeSwitches: 0,
      explicitRegisteredOutcomeNonReporting: 0,
      primaryOutcomeMismatches: 1,
      primaryOutcomePartialMismatches: 0,
      selectiveOutcomeClaims: 0,
    },
  }
}

function coverage(): OutcomeMetadataCoverageAnalysis {
  const claim = {
    url: '/herbs/example/',
    claimId: 'claim-1',
    predicate: 'supports_outcome',
    confidence: 0.9,
    linkedPrimaryHumanStudyIds: ['pmid:1', 'pmid:2'],
    primaryHumanStudies: 2,
    studiesWithOutcomeMetadata: 1,
    studiesWithRegistryIds: 1,
    studiesWithNamedRegisteredPrimary: 1,
    studiesWithNamedReportedPrimary: 1,
    studiesWithNamedAlignmentData: 1,
    outcomeMetadataCoverage: 0.5,
    namedAlignmentCoverage: 0.5,
    outcomeMetadataGap: false,
    highConfidenceOutcomeMetadataGap: false,
  }
  const backfill = {
    ...claim,
    claimId: 'claim-2',
    confidence: 0.85,
    linkedPrimaryHumanStudyIds: ['pmid:3', 'nct:00000004'],
    studiesWithNamedAlignmentData: 0,
    namedAlignmentCoverage: 0,
    outcomeMetadataGap: true,
    highConfidenceOutcomeMetadataGap: true,
  }
  return {
    profiles: [],
    claims: [claim, backfill],
    profileCoverageGaps: [],
    claimCoverageGaps: [backfill],
    highConfidenceClaimCoverageGaps: [backfill],
    summary: {
      profiles: 0,
      profilesWithPrimaryHumanEvidence: 0,
      profileCoverageGaps: 0,
      approvedOutcomeClaimsWithPrimaryHumanEvidence: 2,
      claimCoverageGaps: 1,
      highConfidenceClaimCoverageGaps: 1,
    },
  }
}

describe('outcome review queue', () => {
  it('prioritizes high-confidence high-severity integrity findings as urgent', () => {
    const result = buildOutcomeReviewQueue({
      outcomeReportingIntegrity: integrity(),
      outcomeMetadataCoverage: coverage(),
    })

    expect(result.items[0]).toMatchObject({
      claimId: 'claim-1',
      priority: 'urgent',
      integritySeverity: 'high',
    })
    expect(result.items[0].affectedStudyIds).toEqual(['pmid:1'])
    expect(result.summary.urgent).toBe(1)
  })

  it('keeps coverage-only gaps as metadata backfill work rather than integrity findings', () => {
    const result = buildOutcomeReviewQueue({
      outcomeReportingIntegrity: integrity(),
      outcomeMetadataCoverage: coverage(),
    })
    const backfill = result.items.find((item) => item.claimId === 'claim-2')

    expect(backfill).toMatchObject({
      priority: 'medium',
      integritySeverity: null,
      outcomeMetadataGap: true,
      highConfidenceOutcomeMetadataGap: true,
    })
    expect(backfill?.risks).toEqual([])
    expect(backfill?.affectedStudyIds).toEqual(['pmid:3', 'nct:00000004'])
    expect(result.summary.metadataBackfill).toBe(1)
  })
})
