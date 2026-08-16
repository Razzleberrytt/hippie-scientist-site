import { describe, expect, it } from 'vitest'

import { canonicalStudyIdentityMap } from '@/lib/research-coverage'
import { analyzeEvidenceLineage, explicitNonRegistryLineageIds } from '@/lib/research-evidence-lineage'
import type { ResearchQualityAnalysis } from '@/lib/research-quality-analysis'

function analysisFor(lineageA?: Record<string, unknown>, lineageB?: Record<string, unknown>): ResearchQualityAnalysis {
  const record = {
    slug: 'demo',
    sources: [
      { id: 's1', pmid: '10000001', ...lineageA },
      { id: 's2', pmid: '10000002', ...lineageB },
    ],
    claimMap: [
      { id: 'c1', predicate: 'supports_outcome', confidence: 0.9, reviewStatus: 'approved', sourceRefIds: ['s1', 's2'] },
    ],
  }
  const identities = canonicalStudyIdentityMap(record)
  const studyIds = ['s1', 's2'].map((id) => identities.get(id)).filter((id): id is string => Boolean(id))
  return {
    cache: {},
    profiles: [{ kind: 'herbs', url: '/herbs/demo/', file: '/tmp/demo.json', record }],
    profileAnalyses: [],
    structuredClaimAnalyses: [],
    claimAnalyses: [{
      url: '/herbs/demo/',
      claimId: 'c1',
      reviewStatus: 'approved',
      approved: true,
      predicate: 'supports_outcome',
      confidence: 0.9,
      sourceRefCount: 2,
      validSourceRefCount: 2,
      danglingSourceRefs: [],
      studyIds,
      studyCount: studyIds.length,
      classifiedStudyCount: 0,
      primaryHuman: 0,
      synthesis: 0,
      narrative: 0,
      designs: [],
      outcomeClaim: true,
      supportTier: 'unclassified',
      structuredSupportTier: 'unclassified',
      weakStructuredClaim: true,
      highConfidenceWeakStructured: true,
      highConfidenceWeakOutcome: true,
      singleStudy: false,
      aliasCollapsed: false,
    }],
  }
}

describe('explicit non-registry evidence lineage', () => {
  it('normalizes supported cohort, dataset, and parent-study identifiers', () => {
    expect(explicitNonRegistryLineageIds({
      cohortId: ' cohort-x ',
      datasetId: 'data-1',
      parentStudyId: 'parent-a',
    })).toEqual(['cohort:COHORT-X', 'dataset:DATA-1', 'parent:PARENT-A'])
  })

  it('detects two publications that explicitly share one cohort', () => {
    const result = analyzeEvidenceLineage(analysisFor({ cohortId: 'cohort-x' }, { cohortId: 'COHORT-X' }))
    expect(result.sharedNonRegistryLineageClaims).toHaveLength(1)
    expect(result.sharedNonRegistryLineageClaims[0]).toMatchObject({
      claimId: 'c1',
      sharedNonRegistryLineage: true,
      highConfidenceSharedNonRegistryLineage: true,
    })
    expect(result.sharedNonRegistryLineageClaims[0].repeatedExplicitLineages).toEqual(['cohort:COHORT-X'])
  })

  it('does not collapse publications with different explicit lineage ids', () => {
    const result = analyzeEvidenceLineage(analysisFor({ datasetId: 'data-a' }, { datasetId: 'data-b' }))
    expect(result.sharedNonRegistryLineageClaims).toHaveLength(0)
  })

  it('treats missing lineage as unknown rather than evidence of dependence', () => {
    const result = analyzeEvidenceLineage(analysisFor(undefined, undefined))
    expect(result.sharedNonRegistryLineageClaims).toHaveLength(0)
    expect(result.claims[0].explicitLineageCoverage).toBe(0)
  })
})
