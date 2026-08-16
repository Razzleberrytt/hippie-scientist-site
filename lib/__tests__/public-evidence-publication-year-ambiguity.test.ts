import { describe, expect, it } from 'vitest'

import {
  buildPublicEvidenceDatasetFromRecords,
  publicEvidenceDatasetToCsv,
} from '@/lib/public-evidence-dataset'
import type { RuntimeRecord } from '@/src/types/content'

function record(overrides: Partial<RuntimeRecord>): RuntimeRecord {
  return {
    slug: 'example',
    name: 'Example',
    category: 'Stress',
    indexability_status: 'PUBLISH',
    evidence_grade: 'B',
    summary_quality: 'strong',
    profile_status: 'complete',
    ...overrides,
  } as RuntimeRecord
}

describe('public evidence publication-year ambiguity', () => {
  it('does not choose one conflicting canonical publication year silently', () => {
    const dataset = buildPublicEvidenceDatasetFromRecords([
      {
        type: 'herb',
        record: record({
          slug: 'year-2020',
          sources: [{
            title: 'Shared publication',
            doi: '10.1000/year-conflict',
            year: 2020,
            study_type: 'randomized controlled trial',
          }],
        }),
      },
      {
        type: 'compound',
        record: record({
          slug: 'year-2021',
          sources: [{
            title: 'Shared publication',
            doi: '10.1000/year-conflict',
            pmid: '34559859',
            year: 2021,
            study_type: 'randomized controlled trial',
          }],
        }),
      },
    ])

    expect(dataset.studies).toHaveLength(1)
    expect(dataset.studies[0].year).toBeUndefined()
    expect(dataset.studies[0].publicationYearAmbiguous).toBe(true)
    expect(dataset.metrics.publicationYearAmbiguityStudyCount).toBe(1)

    const csv = publicEvidenceDatasetToCsv(dataset)
    expect(csv).toContain('year,year_ambiguous')
    expect(csv).toContain('true,34559859')
  })

  it('uses one valid year over missing year metadata regardless of order', () => {
    const missing = {
      type: 'herb' as const,
      record: record({
        slug: 'missing-year',
        sources: [{
          title: 'Shared publication',
          doi: '10.1000/year-known',
          study_type: 'randomized controlled trial',
        }],
      }),
    }
    const known = {
      type: 'compound' as const,
      record: record({
        slug: 'known-year',
        sources: [{
          title: 'Shared publication',
          doi: '10.1000/year-known',
          pmid: '34559859',
          year: 2022,
          study_type: 'randomized controlled trial',
        }],
      }),
    }

    for (const entities of [[missing, known], [known, missing]]) {
      const dataset = buildPublicEvidenceDatasetFromRecords(entities)
      expect(dataset.studies).toHaveLength(1)
      expect(dataset.studies[0].year).toBe(2022)
      expect(dataset.studies[0].publicationYearAmbiguous).toBe(false)
      expect(dataset.metrics.publicationYearAmbiguityStudyCount).toBe(0)
    }
  })
})
