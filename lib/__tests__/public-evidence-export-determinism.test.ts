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

  it('stabilizes relationship ordering when herb and compound identities share a slug', () => {
    const sharedContext = {
      ingredientSlug: 'shared',
      ingredientName: 'Shared',
      evidenceGrade: 'B',
      relationship: 'supports' as const,
      outcome: 'Same endpoint',
    }
    const herbRelationship = {
      ...sharedContext,
      ingredientType: 'herb' as const,
      ingredientPath: '/herbs/shared/',
    }
    const compoundRelationship = {
      ...sharedContext,
      ingredientType: 'compound' as const,
      ingredientPath: '/compounds/shared/',
    }

    const first = normalizePublicEvidenceDatasetForExport(dataset([
      study({ relationships: [herbRelationship, compoundRelationship] }),
    ]))
    const second = normalizePublicEvidenceDatasetForExport(dataset([
      study({ relationships: [compoundRelationship, herbRelationship] }),
    ]))

    expect(JSON.stringify(first)).toBe(JSON.stringify(second))
    expect(first.studies[0].relationships.map((item) => item.ingredientPath)).toEqual([
      '/compounds/shared/',
      '/herbs/shared/',
    ])
  })

  it('recomputes exported ambiguity flags from authoritative candidate sets', () => {
    const normalized = normalizePublicEvidenceDatasetForExport(dataset([
      study({
        id: 'doi:10.1000/conflict',
        publicationYearCandidates: [2020, 2021],
        publicationYearAmbiguous: false,
        participantCountCandidates: [100],
        participantCountAmbiguous: true,
        studyClassCandidates: ['controlled_trial', 'randomized_controlled_trial'],
        studyClassAmbiguous: false,
      }),
      study({
        id: 'doi:10.1000/no-candidates',
        publicationYearAmbiguous: true,
        participantCountAmbiguous: true,
        studyClassAmbiguous: true,
      }),
    ]))

    const conflict = normalized.studies.find((item) => item.id === 'doi:10.1000/conflict')
    expect(conflict).toMatchObject({
      publicationYearAmbiguous: true,
      participantCountAmbiguous: false,
      studyClassAmbiguous: true,
    })

    const noCandidates = normalized.studies.find((item) => item.id === 'doi:10.1000/no-candidates')
    expect(noCandidates).toMatchObject({
      publicationYearAmbiguous: false,
      participantCountAmbiguous: false,
      studyClassAmbiguous: false,
    })
  })
})
