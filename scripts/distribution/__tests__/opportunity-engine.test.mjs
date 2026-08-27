import { describe, expect, it } from 'vitest'

import { assessEligibility, scoreDistributionCandidate, selectDistributionOpportunity } from '../opportunity-engine.mjs'

const NOW = new Date('2026-08-27T00:00:00Z')

function governed(overrides = {}) {
  return {
    id: 'sleep-human-trial',
    title: 'Sleep intervention evidence',
    finding: 'In the recorded randomized trial, the intervention improved the prespecified sleep outcome versus control.',
    evidenceType: 'randomized human trial',
    evidenceGrade: 'A',
    limitation: 'This was one study and does not establish a universal effect.',
    sourceUrl: 'https://thehippiescientist.net/evidence/sleep-intervention/',
    lastVerified: '2026-08-20',
    ...overrides,
  }
}

describe('distribution opportunity engine', () => {
  it('selects the highest-scoring eligible governed page deterministically', () => {
    const a = governed()
    const b = governed({ id: 'stress-human-trial', title: 'Stress intervention evidence', sourceUrl: 'https://thehippiescientist.net/evidence/stress-intervention/' })
    const signals = {
      'sleep-human-trial': { impact: 9, searchOpportunity: 9, socialSuitability: 8, informationUniqueness: 9, existingAssetSaturation: 0 },
      'stress-human-trial': { impact: 6, searchOpportunity: 5, socialSuitability: 5, informationUniqueness: 5, existingAssetSaturation: 4 },
    }

    const first = selectDistributionOpportunity([b, a], signals, { now: NOW })
    const second = selectDistributionOpportunity([b, a], signals, { now: NOW })

    expect(first.status).toBe('selected')
    expect(first.selected.id).toBe('sleep-human-trial')
    expect(first).toEqual(second)
    expect(first.selected.sourceUrl).toBe(a.sourceUrl)
    expect(first.selected.successCriteria.measurementWindowDays).toBe(28)
  })

  it('emits deterministic canonical attribution and lossless discoverability metadata', () => {
    const object = governed()
    const candidate = scoreDistributionCandidate(object, {}, { now: NOW })

    expect(candidate.destination.canonicalUrl).toBe(object.sourceUrl)
    expect(candidate.destination.taggedUrl).toBe('https://thehippiescientist.net/evidence/sleep-intervention/?utm_source=distribution-engine&utm_medium=organic&utm_campaign=evidence-to-distribution&utm_content=sleep-human-trial-carousel')
    expect(candidate.destination.attribution).toEqual({
      source: 'distribution-engine',
      medium: 'organic',
      campaign: 'evidence-to-distribution',
      content: 'sleep-human-trial-carousel',
    })
    expect(candidate.discoverability.title).toContain(object.title)
    expect(candidate.discoverability.description).toContain(object.finding)
    expect(candidate.discoverability.description).toContain(object.limitation)
    expect(candidate.discoverability.caption).toContain(object.finding)
    expect(candidate.discoverability.caption).toContain(object.limitation)
    expect(candidate.discoverability.caption).toContain(object.sourceUrl)
    expect(candidate.discoverability.canonicalSource).toBe(object.sourceUrl)
  })

  it('uses the swarm scoring formula and subtracts growth risks rather than overriding safety', () => {
    const candidate = scoreDistributionCandidate(governed(), {
      'sleep-human-trial': {
        impact: 8,
        urgency: 7,
        breadth: 9,
        confidence: 9,
        compoundingLeverage: 9,
        opportunityAge: 3,
        reversibility: 10,
        technicalDebtInterest: 7,
        effort: 3,
        regressionRisk: 2,
        blastRadius: 2,
        existingAssetSaturation: 4,
        cannibalizationRisk: 3,
      },
    }, { now: NOW })

    // Includes the requested swarm score, then subtracts saturation, cannibalization, and claim-risk penalties.
    expect(candidate.score).toBe(93)
    expect(candidate.eligible).toBe(true)
  })

  it('fails closed for preclinical-only candidates even when growth signals are maximal', () => {
    const object = governed({
      id: 'preclinical-only',
      evidenceType: 'mouse preclinical study',
      evidenceGrade: 'A',
      sourceUrl: 'https://thehippiescientist.net/evidence/preclinical-only/',
    })
    const max = Object.fromEntries(['impact','urgency','breadth','confidence','compoundingLeverage','opportunityAge','reversibility','technicalDebtInterest','searchOpportunity','aiCitationOpportunity','socialSuitability','commercialValue','informationUniqueness','evergreenValue'].map((key) => [key, 10]))
    const result = selectDistributionOpportunity([object], { 'preclinical-only': max }, { now: NOW })

    expect(result.status).toBe('waiting-for-governed-object')
    expect(result.selected).toBeNull()
    expect(result.candidates[0].ineligibleReasons.join('\n')).toMatch(/preclinical-only/i)
  })

  it('fails closed on stale or non-first-party evidence pages', () => {
    expect(assessEligibility(governed({ lastVerified: '2024-01-01' }), { now: NOW }).eligible).toBe(false)
    expect(assessEligibility(governed({ sourceUrl: 'https://example.com/evidence' }), { now: NOW }).eligible).toBe(false)
  })

  it('returns an explicit waiting state when the governed research-object set is empty', () => {
    expect(selectDistributionOpportunity([], {}, { now: NOW })).toEqual({
      schemaVersion: '1.0.0',
      status: 'waiting-for-governed-object',
      selected: null,
      candidates: [],
    })
  })
})
