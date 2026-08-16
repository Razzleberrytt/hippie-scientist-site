import { describe, expect, it } from 'vitest'

import { buildPublicEvidenceDatasetFromRecords } from '@/lib/public-evidence-dataset'
import type { RuntimeRecord } from '@/src/types/content'

function record(slug: string, sources: Array<Record<string, unknown>>): RuntimeRecord {
  return {
    slug,
    name: slug,
    category: 'Stress',
    indexability_status: 'PUBLISH',
    evidence_grade: 'B',
    summary_quality: 'strong',
    profile_status: 'complete',
    sources,
  } as RuntimeRecord
}

function source(outcome: string, relationship: string) {
  return {
    title: 'Shared publication',
    doi: '10.1000/heterogeneity',
    study_type: 'randomized controlled trial',
    outcome,
    relationship,
  }
}

describe('within-ingredient directional heterogeneity', () => {
  it('does not call cross-ingredient directional variation within-ingredient heterogeneity', () => {
    const dataset = buildPublicEvidenceDatasetFromRecords([
      {
        type: 'herb',
        record: record('alpha', [source('Alpha endpoint', 'supports')]),
      },
      {
        type: 'compound',
        record: record('beta', [source('Beta endpoint', 'no_clear_effect')]),
      },
    ])

    expect(dataset.studies).toHaveLength(1)
    expect(dataset.studies[0].relationshipSummary).toBe('mixed')
    expect(dataset.metrics.disagreementStudyCount).toBe(1)
    expect(dataset.metrics.withinIngredientDirectionalHeterogeneityStudyCount).toBe(0)
  })

  it('flags multiple directional endpoint states for the same ingredient', () => {
    const dataset = buildPublicEvidenceDatasetFromRecords([
      {
        type: 'herb',
        record: record('alpha', [
          source('Primary endpoint', 'supports'),
          source('Secondary endpoint', 'no_clear_effect'),
        ]),
      },
    ])

    expect(dataset.studies).toHaveLength(1)
    expect(dataset.studies[0].relationshipSummary).toBe('mixed')
    expect(dataset.metrics.disagreementStudyCount).toBe(1)
    expect(dataset.metrics.withinIngredientDirectionalHeterogeneityStudyCount).toBe(1)
  })

  it('counts an explicitly mixed relationship as within-ingredient heterogeneity', () => {
    const dataset = buildPublicEvidenceDatasetFromRecords([
      {
        type: 'herb',
        record: record('alpha', [source('Composite endpoint', 'mixed')]),
      },
    ])

    expect(dataset.metrics.disagreementStudyCount).toBe(1)
    expect(dataset.metrics.withinIngredientDirectionalHeterogeneityStudyCount).toBe(1)
  })
})
