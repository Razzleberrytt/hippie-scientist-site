import { describe, expect, it } from 'vitest'

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

describe('public evidence category study counts', () => {
  it('counts one deduplicated human trial once when reused by multiple ingredients in the same category', () => {
    const sharedTrial = {
      title: 'Shared trial',
      pmid: '12345678',
      study_type: 'randomized controlled trial',
      relationship: 'supports',
    }
    const dataset = buildPublicEvidenceDatasetFromRecords([
      { type: 'herb', record: record({ slug: 'alpha', sources: [sharedTrial] }) },
      { type: 'compound', record: record({ slug: 'beta', sources: [sharedTrial] }) },
    ])

    expect(dataset.studies).toHaveLength(1)
    expect(dataset.metrics.categories).toEqual([
      expect.objectContaining({ category: 'Stress', humanStudies: 1, humanTrials: 1 }),
    ])
  })

  it('counts one shared trial once in each distinct category it supports', () => {
    const sharedTrial = {
      title: 'Cross-category trial',
      pmid: '87654321',
      study_type: 'randomized controlled trial',
      relationship: 'supports',
    }
    const dataset = buildPublicEvidenceDatasetFromRecords([
      { type: 'herb', record: record({ slug: 'alpha', category: 'Stress', sources: [sharedTrial] }) },
      { type: 'compound', record: record({ slug: 'beta', category: 'Sleep', sources: [sharedTrial] }) },
    ])

    const counts = new Map(dataset.metrics.categories.map(category => [category.category, category]))
    expect(counts.get('Stress')).toMatchObject({ humanStudies: 1, humanTrials: 1 })
    expect(counts.get('Sleep')).toMatchObject({ humanStudies: 1, humanTrials: 1 })
  })
})
