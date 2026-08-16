import { describe, expect, it } from 'vitest'

import { normalizePublicEvidenceDatasetForExport } from '@/lib/public-evidence-export'
import type { PublicEvidenceDataset, PublicStudyEntity } from '@/lib/public-evidence-dataset'

function study(overrides: Partial<PublicStudyEntity>): PublicStudyEntity {
  return {
    id: 'doi:10.1000/example',
    title: 'Example publication',
    evidenceClass: 'randomized_controlled_trial',
    confidence: 'moderate',
    conditions: ['Sleep', 'Stress'],
    relationships: [],
    relationshipSummary: 'supports',
    ...overrides,
  }
}

function dataset(studies: PublicStudyEntity[]): PublicEvidenceDataset {
  return {
    schemaVersion: 1,
    datasetVersion: 'test',
    title: 'Test dataset',
    generatedFrom: 'current indexable runtime records',
    methodologyPath: '/info/editorial-policy/',
    citationExplorerPath: '/learn/citation-explorer/',
    citationText: 'Test citation',
    ingredients: [
      { slug: 'z', name: 'Same', type: 'herb', path: '/herbs/z/', evidenceGrade: 'B', category: 'Stress', safetyCaution: false },
      { slug: 'a', name: 'Same', type: 'compound', path: '/compounds/a/', evidenceGrade: 'B', category: 'Stress', safetyCaution: false },
    ],
    studies,
    metrics: {} as PublicEvidenceDataset['metrics'],
  }
}

describe('public evidence export determinism', () => {
  it('normalizes semantically identical study and relationship ordering', () => {
    const relationships = [
      {
        ingredientSlug: 'z',
        ingredientName: 'Z',
        ingredientType: 'herb' as const,
        ingredientPath: '/herbs/z/',
        evidenceGrade: 'B',
        relationship: 'no_clear_effect' as const,
        outcome: 'Sleep latency',
        conditions: ['Stress', 'Sleep'],
      },
      {
        ingredientSlug: 'a',
        ingredientName: 'A',
        ingredientType: 'compound' as const,
        ingredientPath: '/compounds/a/',
        evidenceGrade: 'B',
        relationship: 'supports' as const,
        outcome: 'Sleep quality',
        conditions: ['Sleep', 'Stress'],
      },
    ]

    const first = dataset([
      study({
        id: 'doi:10.1000/b',
        title: 'Same title',
        year: 2024,
        publicationYearCandidates: [2024, 2023],
        participantCountCandidates: [120, 100],
        studyClassCandidates: ['systematic_review', 'randomized_controlled_trial'],
        conditions: ['Stress', 'Sleep'],
        relationships,
      }),
      study({ id: 'doi:10.1000/a', title: 'Same title', year: 2024 }),
    ])

    const second = dataset([
      study({ id: 'doi:10.1000/a', title: 'Same title', year: 2024 }),
      study({
        id: 'doi:10.1000/b',
        title: 'Same title',
        year: 2024,
        publicationYearCandidates: [2023, 2024],
        participantCountCandidates: [100, 120],
        studyClassCandidates: ['randomized_controlled_trial', 'systematic_review'],
        conditions: ['Sleep', 'Stress'],
        relationships: [...relationships].reverse().map((relationship) => ({
          ...relationship,
          conditions: [...(relationship.conditions ?? [])].reverse(),
        })),
      }),
    ])

    const normalizedFirst = normalizePublicEvidenceDatasetForExport(first)
    const normalizedSecond = normalizePublicEvidenceDatasetForExport(second)

    expect(JSON.stringify(normalizedFirst)).toBe(JSON.stringify(normalizedSecond))
    expect(normalizedFirst.ingredients.map((item) => item.path)).toEqual(['/compounds/a/', '/herbs/z/'])
    expect(normalizedFirst.studies.map((item) => item.id)).toEqual(['doi:10.1000/a', 'doi:10.1000/b'])
    expect(normalizedFirst.studies[1].participantCountCandidates).toEqual([100, 120])
    expect(normalizedFirst.studies[1].conditions).toEqual(['Sleep', 'Stress'])
    expect(normalizedFirst.studies[1].relationships.map((item) => item.ingredientSlug)).toEqual(['a', 'z'])
  })
})
