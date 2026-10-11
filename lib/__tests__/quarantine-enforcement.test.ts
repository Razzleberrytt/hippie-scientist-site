import { describe, expect, it } from 'vitest'
import rollup from '../../public/data/enrichment-governed.json'
import type { ResearchEnrichment } from '../../types/researchEnrichment'
import {
  getGovernedEnrichmentSummary,
  getGovernedResearchEnrichment,
  getPublishableGovernedEntries,
  isPublishableGovernedEnrichment,
} from '../governedResearch'

// Synthetic approval permutations use a real record for its unrelated scientific fields.
const fixture = (rollup as Array<{ researchEnrichment: ResearchEnrichment }>)[0]?.researchEnrichment

function candidate(overrides: Record<string, unknown> = {}): ResearchEnrichment {
  if (!fixture) throw new Error('Expected governed-enrichment fixture')
  return {
    ...fixture,
    editorialReadiness: {
      publishable: true,
      hasConflictOrWeakEvidence: false,
      conflictLabelingPresent: true,
      weakEvidenceClaimsLabeled: true,
    },
    reviewStatus: 'approved_for_rollup',
    editorialStatus: 'approved',
    active: true,
    ...overrides,
  } as ResearchEnrichment
}

describe('governed enrichment publication quarantine', () => {
  it('allows independently approved active records', () => {
    expect(isPublishableGovernedEnrichment(candidate())).toBe(true)
  })
  it('allows published editorial status only with independent approval', () => {
    expect(isPublishableGovernedEnrichment(candidate({ editorialStatus: 'published' }))).toBe(true)
  })
  it('blocks the August 30 scenario: draft quarantine with approved editorial status', () => {
    expect(isPublishableGovernedEnrichment(candidate({ reviewStatus: 'draft_submission' }))).toBe(false)
  })
  it('blocks missing review status', () => {
    expect(isPublishableGovernedEnrichment(candidate({ reviewStatus: undefined }))).toBe(false)
  })
  it('blocks ready_for_review', () => {
    expect(isPublishableGovernedEnrichment(candidate({ reviewStatus: 'ready_for_review' }))).toBe(false)
  })
  it('blocks under_review', () => {
    expect(isPublishableGovernedEnrichment(candidate({ reviewStatus: 'under_review' }))).toBe(false)
  })
  it('blocks rejected and deprecated submissions', () => {
    expect(isPublishableGovernedEnrichment(candidate({ reviewStatus: 'rejected' }))).toBe(false)
    expect(isPublishableGovernedEnrichment(candidate({ reviewStatus: 'deprecated_submission' }))).toBe(false)
  })
  it('blocks missing, false, or inactive records', () => {
    expect(isPublishableGovernedEnrichment(candidate({ active: undefined }))).toBe(false)
    expect(isPublishableGovernedEnrichment(candidate({ active: false }))).toBe(false)
  })
  it('blocks editorial drafts even with approved review', () => {
    expect(isPublishableGovernedEnrichment(candidate({ editorialStatus: 'draft' }))).toBe(false)
  })
  it('blocks a failed scientific readiness gate', () => {
    expect(isPublishableGovernedEnrichment(candidate({
      editorialReadiness: { ...candidate().editorialReadiness, publishable: false },
    }))).toBe(false)
  })
  it('blocks null, undefined, and malformed approvals', () => {
    expect(isPublishableGovernedEnrichment(null)).toBe(false)
    expect(isPublishableGovernedEnrichment(undefined)).toBe(false)
    expect(isPublishableGovernedEnrichment(candidate({ reviewStatus: 'approved' }))).toBe(false)
  })
  it('does not allow a legacy migration flag to override missing approval', () => {
    expect(isPublishableGovernedEnrichment(candidate({ reviewStatus: undefined, legacyApproved: true }))).toBe(false)
  })
  it('does not expose unapproved legacy records through public runtime getters', () => {
    for (const row of rollup as Array<{entityType:'herb'|'compound'; entitySlug:string; researchEnrichment:ResearchEnrichment}>) {
      if (row.researchEnrichment.reviewStatus === 'approved_for_rollup') continue
      expect(getGovernedResearchEnrichment(row.entityType, row.entitySlug)).toBeNull()
      expect(getGovernedEnrichmentSummary(row.entityType, row.entitySlug)).toBeNull()
      expect(getPublishableGovernedEntries().some(
        entry => entry.entityType === row.entityType && entry.entitySlug === row.entitySlug,
      )).toBe(false)
    }
  })
})
