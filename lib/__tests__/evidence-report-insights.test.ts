import { describe, expect, it } from 'vitest'
import { summarizeCategoryEvidenceMix } from '@/lib/evidence-report-insights'
import type { PublicEvidenceDataset } from '@/lib/public-evidence-dataset'

const dataset = {
  ingredients: [
    { slug: 'alpha', category: 'Adaptogens' },
    { slug: 'beta', category: 'Adaptogens' },
    { slug: 'gamma', category: 'Minerals' },
  ],
  studies: [
    { evidenceClass: 'mechanistic', relationships: [{ ingredientSlug: 'alpha' }] },
    { evidenceClass: 'animal', relationships: [{ ingredientSlug: 'beta' }] },
    { evidenceClass: 'randomized_controlled_trial', relationships: [{ ingredientSlug: 'alpha' }] },
    { evidenceClass: 'randomized_controlled_trial', relationships: [{ ingredientSlug: 'gamma' }] },
    { evidenceClass: 'systematic_review', relationships: [{ ingredientSlug: 'gamma' }] },
  ],
} as unknown as PublicEvidenceDataset

describe('summarizeCategoryEvidenceMix', () => {
  it('separates mechanism/preclinical relationships from human evidence', () => {
    const rows = summarizeCategoryEvidenceMix(dataset)
    const adaptogens = rows.find(row => row.category === 'Adaptogens')
    const minerals = rows.find(row => row.category === 'Minerals')

    expect(adaptogens).toMatchObject({
      evidenceRelationships: 3,
      preclinicalRelationships: 2,
      humanRelationships: 1,
    })
    expect(adaptogens?.preclinicalShare).toBeCloseTo(2 / 3)
    expect(minerals).toMatchObject({
      evidenceRelationships: 2,
      preclinicalRelationships: 0,
      humanRelationships: 2,
    })
  })

  it('orders categories by preclinical share rather than raw category size', () => {
    const rows = summarizeCategoryEvidenceMix(dataset)
    expect(rows[0].category).toBe('Adaptogens')
  })
})
