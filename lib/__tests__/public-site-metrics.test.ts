import { describe, expect, it } from 'vitest'
import { buildPublicSiteMetrics } from '@/lib/public-site-metrics'
import type { PublicEvidenceDataset } from '@/lib/public-evidence-dataset'

function dataset(): PublicEvidenceDataset {
  return {
    schemaVersion: 1,
    datasetVersion: 'test',
    title: 'test',
    generatedFrom: 'current indexable runtime records',
    methodologyPath: '/info/editorial-policy/',
    citationExplorerPath: '/learn/citation-explorer/',
    citationText: 'test',
    ingredients: [
      { slug: 'garlic', name: 'Garlic', type: 'herb', path: '/herbs/garlic/', evidenceGrade: 'B', category: 'test', safetyCaution: false },
      { slug: 'allium-sativum', name: 'Allium sativum', type: 'herb', path: '/herbs/allium-sativum/', evidenceGrade: 'B', category: 'test', safetyCaution: false },
      { slug: 'l-theanine', name: 'L-Theanine', type: 'compound', path: '/compounds/l-theanine/', evidenceGrade: 'B', category: 'test', safetyCaution: false },
      { slug: 'theanine', name: 'Theanine', type: 'compound', path: '/compounds/theanine/', evidenceGrade: 'B', category: 'test', safetyCaution: false },
      { slug: 'magnesium', name: 'Magnesium', type: 'compound', path: '/compounds/magnesium/', evidenceGrade: 'B', category: 'test', safetyCaution: false },
    ],
    studies: [],
    metrics: {
      ingredientCount: 5,
      studyCount: 899,
      humanStudyCount: 281,
      humanTrialCount: 110,
    } as PublicEvidenceDataset['metrics'],
  }
}

describe('public site metrics', () => {
  it('uses the evidence dataset for study metrics and suppresses redirect-only profile aliases', () => {
    const metrics = buildPublicSiteMetrics(dataset())

    expect(metrics).toEqual({
      publishedHerbs: 1,
      publishedCompounds: 2,
      publishedProfiles: 3,
      structuredStudies: 899,
      humanEvidenceSources: 281,
      humanTrials: 110,
    })
  })
})
