import { describe, expect, it } from 'vitest'

import { buildPublicEvidenceDatasetFromRecords } from '@/lib/public-evidence-dataset'
import type { RuntimeRecord } from '@/src/types/content'

function record(sources: Array<Record<string, unknown>>): RuntimeRecord {
  return {
    slug: 'example',
    name: 'Example',
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
    doi: '10.1000/directional-summary',
    study_type: 'randomized controlled trial',
    outcome,
    relationship,
  }
}

describe('public evidence directional aggregation', () => {
  it('treats contradicting and null endpoint contexts as mixed', () => {
    const dataset = buildPublicEvidenceDatasetFromRecords([
      {
        type: 'herb',
        record: record([
          source('Primary endpoint', 'contradicts'),
          source('Secondary endpoint', 'no_clear_effect'),
        ]),
      },
    ])

    expect(dataset.studies).toHaveLength(1)
    expect(dataset.studies[0].relationships).toHaveLength(2)
    expect(dataset.studies[0].relationshipSummary).toBe('mixed')
    expect(dataset.metrics.disagreementStudyCount).toBe(1)
    expect(dataset.metrics.contradictingRelationships).toBe(1)
    expect(dataset.metrics.noClearEffectRelationships).toBe(1)
  })

  it('does not let background context dilute one concrete direction', () => {
    for (const relationship of ['supports', 'contradicts', 'no_clear_effect'] as const) {
      const dataset = buildPublicEvidenceDatasetFromRecords([
        {
          type: 'herb',
          record: record([
            source('Outcome endpoint', relationship),
            source('Background context', 'background'),
          ]),
        },
      ])

      expect(dataset.studies[0].relationshipSummary).toBe(relationship)
      expect(dataset.metrics.disagreementStudyCount).toBe(0)
    }
  })

  it('treats any two distinct non-background directional states as mixed', () => {
    const pairs = [
      ['supports', 'contradicts'],
      ['supports', 'no_clear_effect'],
      ['contradicts', 'no_clear_effect'],
    ] as const

    for (const [left, right] of pairs) {
      const dataset = buildPublicEvidenceDatasetFromRecords([
        {
          type: 'herb',
          record: record([
            source('Endpoint A', left),
            source('Endpoint B', right),
          ]),
        },
      ])
      expect(dataset.studies[0].relationshipSummary).toBe('mixed')
    }
  })
})
