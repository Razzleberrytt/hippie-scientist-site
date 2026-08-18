import { describe, expect, it } from 'vitest'
import { summarizeCategoryEvidenceMix } from '@/lib/evidence-report-insights'
import type { PublicEvidenceDataset } from '@/lib/public-evidence-dataset'

// Ingredients are keyed by profile path rather than bare slug: the same slug can
// exist as both a herb and a compound, so a slug-keyed mix silently merged two
// different ingredients. A slug-shaped fixture resolves to Uncategorized and
// every category assertion reads undefined.
const dataset = {
  ingredients: [
    { path: '/herbs/alpha/', slug: 'alpha', category: 'Adaptogens' },
    { path: '/herbs/beta/', slug: 'beta', category: 'Adaptogens' },
    { path: '/compounds/gamma/', slug: 'gamma', category: 'Minerals' },
  ],
  studies: [
    { evidenceClass: 'mechanistic', relationships: [{ ingredientPath: '/herbs/alpha/' }] },
    { evidenceClass: 'animal', relationships: [{ ingredientPath: '/herbs/beta/' }] },
    { evidenceClass: 'randomized_controlled_trial', relationships: [{ ingredientPath: '/herbs/alpha/' }] },
    { evidenceClass: 'randomized_controlled_trial', relationships: [{ ingredientPath: '/compounds/gamma/' }] },
    { evidenceClass: 'systematic_review', relationships: [{ ingredientPath: '/compounds/gamma/' }] },
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
