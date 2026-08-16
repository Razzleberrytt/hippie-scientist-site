import { describe, expect, it } from 'vitest'

import {
  extractCitationContextsFromRecord,
  extractCitationsFromRecord,
} from '@/lib/citations'
import { buildPublicEvidenceDatasetFromRecords } from '@/lib/public-evidence-dataset'
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

describe('citation context extraction', () => {
  const sources = [
    {
      title: 'One publication, multiple endpoints',
      doi: '10.1000/multi-endpoint',
      year: 2022,
      study_type: 'randomized controlled trial',
      outcome: 'Stress score',
      result: 'Stress improved',
      dose: '300 mg/day',
      relationship: 'supports',
    },
    {
      title: 'One publication, multiple endpoints',
      doi: '10.1000/multi-endpoint',
      year: 2022,
      study_type: 'randomized controlled trial',
      outcome: 'Sleep score',
      result: 'Sleep unchanged',
      dose: '300 mg/day',
      relationship: 'no_clear_effect',
    },
  ]

  it('keeps the existing publication-level extractor contract', () => {
    expect(extractCitationsFromRecord({ sources })).toHaveLength(1)
  })

  it('preserves distinct structured contexts while collapsing exact duplicates', () => {
    const contexts = extractCitationContextsFromRecord({ sources: [...sources, { ...sources[0] }] })
    expect(contexts).toHaveLength(2)
    expect(contexts.map(item => item.outcome).sort()).toEqual(['Sleep score', 'Stress score'])
  })

  it('keeps both endpoint relationships under one public canonical study', () => {
    const dataset = buildPublicEvidenceDatasetFromRecords([
      {
        type: 'herb',
        record: record({ slug: 'alpha', sources }),
      },
    ])

    expect(dataset.studies).toHaveLength(1)
    expect(dataset.studies[0].relationships).toHaveLength(2)
    expect(dataset.studies[0].relationships).toEqual(expect.arrayContaining([
      expect.objectContaining({
        ingredientSlug: 'alpha',
        outcome: 'Stress score',
        result: 'Stress improved',
        relationship: 'supports',
      }),
      expect.objectContaining({
        ingredientSlug: 'alpha',
        outcome: 'Sleep score',
        result: 'Sleep unchanged',
        relationship: 'no_clear_effect',
      }),
    ]))
    expect(dataset.studies[0].outcome).toBeUndefined()
    expect(dataset.studies[0].result).toBeUndefined()
    expect(dataset.studies[0].relationshipSummary).toBe('mixed')
    expect(dataset.metrics.supportingRelationships).toBe(1)
    expect(dataset.metrics.noClearEffectRelationships).toBe(1)
  })
})
