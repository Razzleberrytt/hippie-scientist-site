import { describe, expect, it } from 'vitest'
import {
  PUBLIC_EVIDENCE_DATASET_VERSION,
  buildPublicEvidenceDatasetFromRecords,
  publicEvidenceDatasetToCsv,
} from '@/lib/public-evidence-dataset'
import type { RuntimeRecord } from '@/src/types/content'

function record(overrides: Partial<RuntimeRecord>): RuntimeRecord {
  return {
    slug: 'example',
    name: 'Example',
    indexability_status: 'PUBLISH',
    evidence_grade: 'B',
    summary_quality: 'strong',
    profile_status: 'complete',
    ...overrides,
  } as RuntimeRecord
}

describe('public evidence dataset', () => {
  it('deduplicates a PMID while preserving ingredient relationships', () => {
    const dataset = buildPublicEvidenceDatasetFromRecords([
      { type: 'herb', record: record({ slug: 'alpha', name: 'Alpha', sources: [{ title: 'Shared human trial', pmid: '12345678', study_type: 'randomized controlled trial', n: 120, relationship: 'supports', outcome: 'Stress score' }] }) },
      { type: 'compound', record: record({ slug: 'beta', name: 'Beta', evidence_grade: 'C', sources: [{ title: 'Shared human trial', pmid: '12345678', study_type: 'randomized controlled trial', n: 120, relationship: 'contradicts', outcome: 'Stress score' }] }) },
    ])
    expect(dataset.studies).toHaveLength(1)
    expect(dataset.studies[0].id).toBe('pmid:12345678')
    expect(dataset.studies[0].relationships).toHaveLength(2)
    expect(dataset.studies[0].relationshipSummary).toBe('mixed')
    expect(dataset.metrics.humanTrialCount).toBe(1)
  })

  it('collapses DOI-only and PMID-only rows when a DOI+PMID bridge proves one publication', () => {
    const dataset = buildPublicEvidenceDatasetFromRecords([
      { type: 'herb', record: record({ slug: 'doi-only', name: 'DOI only', sources: [{ title: 'Shared publication via DOI', doi: '10.1000/shared-study', study_type: 'randomized controlled trial', relationship: 'supports' }] }) },
      { type: 'compound', record: record({ slug: 'bridge', name: 'Bridge', sources: [{ title: 'Shared publication bridge', doi: 'https://doi.org/10.1000/shared-study', pmid: '34559859', study_type: 'randomized controlled trial', relationship: 'mixed' }] }) },
      { type: 'herb', record: record({ slug: 'pmid-only', name: 'PMID only', sources: [{ title: 'Shared publication via PMID', pmid: '34559859', study_type: 'randomized controlled trial', relationship: 'contradicts' }] }) },
    ])
    expect(dataset.studies).toHaveLength(1)
    expect(dataset.studies[0].id).toBe('doi:10.1000/shared-study')
    expect(dataset.studies[0]).toMatchObject({ pmid: '34559859', doi: '10.1000/shared-study' })
    expect(dataset.studies[0].relationships.map(item => item.ingredientSlug).sort()).toEqual(['bridge', 'doi-only', 'pmid-only'])
    expect(dataset.metrics.studyCount).toBe(1)
  })

  it('excludes non-indexable records', () => {
    const dataset = buildPublicEvidenceDatasetFromRecords([
      { type: 'herb', record: record({ slug: 'public', indexability_status: 'PUBLISH' }) },
      { type: 'herb', record: record({ slug: 'private', indexability_status: 'NOINDEX' }) },
    ])
    expect(dataset.ingredients.map(item => item.slug)).toEqual(['public'])
  })

  it('keeps safety cautions and canonical grades in aggregate metrics', () => {
    const dataset = buildPublicEvidenceDatasetFromRecords([
      { type: 'herb', record: record({ slug: 'a', evidence_grade: 'A', contraindications: ['Pregnancy'] }) },
      { type: 'compound', record: record({ slug: 'd', evidence_grade: 'D' }) },
    ])
    expect(dataset.metrics.strongOrModerateIngredients).toBe(1)
    expect(dataset.metrics.preliminaryOrInsufficientIngredients).toBe(1)
    expect(dataset.metrics.ingredientsWithSafetyCautions).toBe(1)
  })

  it('does not fabricate topology metrics in the pure builder', () => {
    const dataset = buildPublicEvidenceDatasetFromRecords([{ type: 'herb', record: record({ slug: 'alpha' }) }])
    expect(PUBLIC_EVIDENCE_DATASET_VERSION).toBe('2026.08.16')
    expect(dataset.metrics).toMatchObject({
      underlyingStudyMetricsSource: null,
      researchTopologyRequestedProfiles: null,
      researchTopologyMatchedProfiles: null,
      researchTopologyMissingProfiles: null,
      researchTopologyProfileCoverage: null,
      globalInventoryPublicationCount: null,
      globalPrimaryHumanPublicationCount: null,
      independenceMultiStudyApprovedClaims: null,
    })
  })

  it('exports structured relationships to CSV without losing stable IDs', () => {
    const dataset = buildPublicEvidenceDatasetFromRecords([
      { type: 'herb', record: record({ slug: 'alpha', name: 'Alpha', sources: [{ title: 'Trial, with comma', doi: '10.1000/example', relationship: 'supports' }] }) },
    ])
    const csv = publicEvidenceDatasetToCsv(dataset)
    expect(csv).toContain('study_id,title')
    expect(csv).toContain('doi:10.1000/example')
    expect(csv).toContain('"Trial, with comma"')
    expect(csv).toContain('alpha')
  })
})
