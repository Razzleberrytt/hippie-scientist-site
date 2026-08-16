import { describe, expect, it } from 'vitest'

import { summarizeCategoryEvidenceMix } from '@/lib/evidence-report-insights'
import type { PublicEvidenceDataset } from '@/lib/public-evidence-dataset'

describe('category evidence mix path identity', () => {
  it('keeps same-slug herb and compound relationships in their own categories', () => {
    const dataset = {
      ingredients: [
        {
          slug: 'shared',
          name: 'Shared Herb',
          type: 'herb',
          path: '/herbs/shared/',
          evidenceGrade: 'B',
          category: 'Stress',
          safetyCaution: false,
        },
        {
          slug: 'shared',
          name: 'Shared Compound',
          type: 'compound',
          path: '/compounds/shared/',
          evidenceGrade: 'B',
          category: 'Sleep',
          safetyCaution: false,
        },
      ],
      studies: [
        {
          id: 'doi:10.1000/shared',
          title: 'Shared study',
          evidenceClass: 'randomized_controlled_trial',
          confidence: 'moderate',
          conditions: [],
          relationshipSummary: 'supports',
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
        },
      ],
    } as PublicEvidenceDataset

    const summary = summarizeCategoryEvidenceMix(dataset)
    const stress = summary.find(category => category.category === 'Stress')
    const sleep = summary.find(category => category.category === 'Sleep')

    expect(stress).toMatchObject({
      evidenceRelationships: 1,
      primaryHumanRelationships: 1,
      humanRelationships: 1,
    })
    expect(sleep).toMatchObject({
      evidenceRelationships: 1,
      primaryHumanRelationships: 1,
      humanRelationships: 1,
    })
    expect(summary.reduce((sum, category) => sum + category.evidenceRelationships, 0)).toBe(2)
  })
})
