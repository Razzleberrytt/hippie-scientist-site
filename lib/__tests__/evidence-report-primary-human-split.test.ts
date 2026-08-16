import { describe, expect, it } from 'vitest'

import { summarizeCategoryEvidenceMix } from '../evidence-report-insights'
import type { PublicEvidenceDataset, PublicStudyEntity } from '../public-evidence-dataset'

const study = (id: string, evidenceClass: PublicStudyEntity['evidenceClass']): PublicStudyEntity => ({
  id,
  title: id,
  evidenceClass,
  confidence: 'unknown',
  conditions: [],
  relationships: [{
    ingredientSlug: 'example',
    ingredientName: 'Example',
    ingredientType: 'herb',
    ingredientPath: '/herbs/example/',
    evidenceGrade: 'B',
    relationship: 'supports',
  }],
  relationshipSummary: 'supports',
})

describe('evidence report category design mix', () => {
  it('separates primary human studies from synthesis and preclinical evidence', () => {
    const dataset = {
      ingredients: [{
        slug: 'example',
        name: 'Example',
        type: 'herb',
        path: '/herbs/example/',
        evidenceGrade: 'B',
        category: 'Test category',
        safetyCaution: false,
      }],
      studies: [
        study('rct', 'randomized_controlled_trial'),
        study('review', 'systematic_review'),
        study('animal', 'animal'),
        study('narrative', 'narrative_review'),
      ],
    } as PublicEvidenceDataset

    const [result] = summarizeCategoryEvidenceMix(dataset)

    expect(result).toMatchObject({
      category: 'Test category',
      evidenceRelationships: 4,
      humanRelationships: 2,
      primaryHumanRelationships: 1,
      synthesisRelationships: 1,
      preclinicalRelationships: 1,
      otherRelationships: 1,
      humanShare: 0.5,
      primaryHumanShare: 0.25,
      synthesisShare: 0.25,
      preclinicalShare: 0.25,
    })
  })
})
