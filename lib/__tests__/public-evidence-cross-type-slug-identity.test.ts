import { describe, expect, it } from 'vitest'

import type { PublicEvidenceDataset } from '@/lib/public-evidence-dataset'
import { summarizeCategoryEvidenceMix } from '@/lib/evidence-report-insights'

describe('public evidence cross-type category identity', () => {
  it('uses ingredient paths when herb and compound relationships share a slug', () => {
    const dataset = {
      schemaVersion: 1,
      datasetVersion: 'test',
      title: 'Test dataset',
      generatedFrom: 'test',
      methodologyPath: '/info/editorial-policy/',
      citationExplorerPath: '/learn/citation-explorer/',
      citationText: 'Test citation',
      ingredients: [
        {
          slug: 'shared',
          name: 'Shared Herb',
          type: 'herb',
          path: '/herbs/shared/',
          evidenceGrade: 'B',
          category: 'Sleep',
          safetyCaution: false,
        },
        {
          slug: 'shared',
          name: 'Shared Compound',
          type: 'compound',
          path: '/compounds/shared/',
          evidenceGrade: 'B',
          category: 'Focus',
          safetyCaution: false,
        },
      ],
      studies: [
        {
          id: 'doi:10.1000/shared',
          title: 'Shared identity test',
          evidenceClass: 'randomized_controlled_trial',
          confidence: 'moderate',
          conditions: [],
          relationships: [
            {
              ingredientSlug: 'shared',
              ingredientName: 'Shared Herb',
              ingredientType: 'herb',
              ingredientPath: '/herbs/shared/',
              evidenceGrade: 'B',
              relationship: 'supports',
            },
            {
              ingredientSlug: 'shared',
              ingredientName: 'Shared Compound',
              ingredientType: 'compound',
              ingredientPath: '/compounds/shared/',
              evidenceGrade: 'B',
              relationship: 'supports',
            },
          ],
          relationshipSummary: 'supports',
        },
      ],
      metrics: {},
    } as PublicEvidenceDataset

    const mix = summarizeCategoryEvidenceMix(dataset)

    expect(mix.map((bucket) => [bucket.category, bucket.evidenceRelationships])).toEqual([
      ['Focus', 1],
      ['Sleep', 1],
    ])
    expect(mix.every((bucket) => bucket.primaryHumanRelationships === 1)).toBe(true)
  })
})
