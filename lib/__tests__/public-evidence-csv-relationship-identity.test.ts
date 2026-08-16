import { describe, expect, it } from 'vitest'

import {
  publicEvidenceDatasetToCsv,
  type PublicEvidenceDataset,
  type PublicStudyEntity,
} from '@/lib/public-evidence-dataset'

function dataset(study: PublicStudyEntity): PublicEvidenceDataset {
  return {
    schemaVersion: 1,
    datasetVersion: 'test',
    title: 'Test dataset',
    generatedFrom: 'current indexable runtime records',
    methodologyPath: '/info/editorial-policy/',
    citationExplorerPath: '/learn/citation-explorer/',
    citationText: 'Test citation',
    ingredients: [],
    studies: [study],
    metrics: {} as PublicEvidenceDataset['metrics'],
  }
}

describe('public evidence csv relationship identity', () => {
  it('exports path and type when herb and compound relationships share a slug', () => {
    const csv = publicEvidenceDatasetToCsv(dataset({
      id: 'doi:10.1000/shared',
      title: 'Shared publication',
      evidenceClass: 'randomized_controlled_trial',
      confidence: 'moderate',
      conditions: [],
      relationshipSummary: 'mixed',
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
          evidenceGrade: 'C',
          relationship: 'contradicts',
        },
      ],
    }))

    const [header, row] = csv.trimEnd().split('\n')
    expect(header).toContain('ingredient_slugs,ingredient_types,ingredient_paths,ingredient_names,ingredient_grades')
    expect(row).toContain('shared|shared')
    expect(row).toContain('herb|compound')
    expect(row).toContain('/herbs/shared/|/compounds/shared/')
  })
})
