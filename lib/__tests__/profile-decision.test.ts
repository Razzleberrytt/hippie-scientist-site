import { describe, expect, it } from 'vitest'
import { buildProfileDecision } from '../profile-decision'

describe('buildProfileDecision runtime summary', () => {
  it('derives evidence, safety, and context from existing runtime fields when no curated verdict exists', () => {
    const decision = buildProfileDecision({
      slug: 'runtime-summary-test-record',
      evidence_grade: 'b',
      safety_level: 'Moderate caution',
      primary_effects: ['Calm', 'Focus', 'Calm', 'Sleep', 'Extra item'],
    }, 'compound')

    expect(decision.verdict).toBeUndefined()
    expect(decision.runtimeSummary).toEqual({
      evidence: 'Grade B',
      safety: 'Moderate caution',
      topUses: ['Calm', 'Focus', 'Sleep'],
    })
  })

  it('preserves explicit insufficient-evidence language instead of treating it as a placeholder', () => {
    const decision = buildProfileDecision({
      slug: 'runtime-insufficient-evidence-test',
      evidence_tier: 'Insufficient evidence for effectiveness',
    }, 'herb')

    expect(decision.runtimeSummary?.evidence).toBe('Insufficient evidence for effectiveness')
  })

  it('never manufactures a safety claim when safety data is absent', () => {
    const decision = buildProfileDecision({
      slug: 'runtime-no-safety-test',
      evidence_tier: 'Limited evidence',
      effects: ['Stress support'],
    }, 'herb')

    expect(decision.runtimeSummary?.evidence).toBe('Limited evidence')
    expect(decision.runtimeSummary?.safety).toBeUndefined()
  })

  it('omits placeholder evidence and safety values rather than presenting them as facts', () => {
    const decision = buildProfileDecision({
      slug: 'runtime-placeholder-test',
      evidence_grade: 'unknown',
      safety_rating: 'not available',
      effects: ['placeholder', 'Calm'],
    }, 'compound')

    expect(decision.runtimeSummary).toEqual({
      evidence: undefined,
      safety: undefined,
      topUses: ['Calm'],
    })
  })

  it('keeps curated verdicts authoritative and does not add a competing runtime summary', () => {
    const decision = buildProfileDecision({
      slug: 'ashwagandha',
      evidence_grade: 'A',
      safety_level: 'Low caution',
      effects: ['Stress'],
    }, 'herb')

    expect(decision.verdict).toBeDefined()
    expect(decision.runtimeSummary).toBeUndefined()
  })

  it('still provides an ecosystem exit even when no answer-first fields are usable', () => {
    const decision = buildProfileDecision({
      slug: 'runtime-empty-test',
      evidence_grade: 'unknown',
      safety_rating: 'n/a',
    }, 'compound')

    expect(decision.runtimeSummary).toBeUndefined()
    expect(decision.continueReading).toContainEqual({
      ifYouWant: 'to browse more compounds',
      goTo: 'All compounds',
      href: '/compounds/',
    })
  })
})
