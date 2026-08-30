import { describe, expect, it } from 'vitest'

import { assessEligibility, selectDistributionOpportunity } from '../opportunity-engine.mjs'

const NOW = new Date('2026-08-27T00:00:00Z')

function governed(lastVerified) {
  return {
    id: 'future-verification-fixture',
    title: 'Future verification fixture',
    finding: 'In the recorded randomized human trial, the intervention changed the prespecified outcome versus control.',
    evidenceType: 'randomized human trial',
    evidenceGrade: 'A',
    limitation: 'This fixture must remain bounded to the recorded study.',
    sourceUrl: 'https://thehippiescientist.net/evidence/future-verification-fixture/',
    lastVerified,
  }
}

describe('distribution verification-date integrity', () => {
  it('fails closed when governed evidence claims a future verification date', () => {
    const eligibility = assessEligibility(governed('2026-08-28'), { now: NOW })
    expect(eligibility.eligible).toBe(false)
    expect(eligibility.staleDays).toBe(-1)
    expect(eligibility.reasons).toContain('verification date cannot be in the future')

    const selection = selectDistributionOpportunity([governed('2026-08-28')], {}, { now: NOW })
    expect(selection.status).toBe('waiting-for-governed-object')
    expect(selection.selected).toBeNull()
  })

  it('keeps same-day verification eligible', () => {
    const eligibility = assessEligibility(governed('2026-08-27'), { now: NOW })
    expect(eligibility.eligible).toBe(true)
    expect(eligibility.staleDays).toBe(0)
  })
})
