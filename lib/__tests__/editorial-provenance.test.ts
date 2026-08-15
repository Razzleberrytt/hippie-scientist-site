import { describe, expect, it } from 'vitest'
import {
  getRecordedEditorialReviewDate,
  getRecordedEvidenceSearchDate,
  getRecordedFactualUpdateDate,
  normalizeEditorialFreshness,
  validateReviewRecord,
} from '@/lib/editorial-provenance'

describe('editorial provenance', () => {
  it('does not treat generic build/update timestamps as editorial review events', () => {
    expect(getRecordedEditorialReviewDate({
      updatedAt: '2026-08-15',
      last_updated: '2026-08-15',
      buildUpdatedAt: '2026-08-15',
    })).toBe('')
  })

  it('accepts explicit review and evidence-search dates independently', () => {
    const record = {
      editorial_reviewed_at: '2026-08-10',
      evidence_search_date: '2026-08-09',
      factual_updated_at: '2026-08-11',
    }

    expect(getRecordedEditorialReviewDate(record)).toBe('2026-08-10')
    expect(getRecordedEvidenceSearchDate(record)).toBe('2026-08-09')
    expect(getRecordedFactualUpdateDate(record)).toBe('2026-08-11')
  })

  it('keeps review, factual update, template update and citation count separate', () => {
    expect(normalizeEditorialFreshness({
      lastReviewed: '2026-08-01',
      contentUpdatedAt: '2026-08-02',
      templateUpdatedAt: '2026-08-03',
    }, 12)).toEqual({
      lastReviewed: '2026-08-01',
      evidenceSearchDate: '',
      factualUpdatedAt: '2026-08-02',
      templateUpdatedAt: '2026-08-03',
      citationCount: 12,
    })
  })

  it('requires qualifications before an external review may be represented publicly', () => {
    const errors = validateReviewRecord({
      id: 'review-1',
      pagePath: '/herbs/example/',
      reviewedAt: '2026-08-10',
      kind: 'external',
      reviewerName: 'Example Reviewer',
    })

    expect(errors).toContain('review-1: external review cannot be presented without qualifications.')
  })
})
