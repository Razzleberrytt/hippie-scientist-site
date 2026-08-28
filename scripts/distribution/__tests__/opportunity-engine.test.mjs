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
    expect(first.schemaVersion).toBe('1.1.0')
    expect(first.selected.id).toBe('sleep-human-trial')
    expect(first).toEqual(second)
    expect(first.selected.sourceUrl).toBe(a.sourceUrl)
    expect(first.selected.successCriteria.measurementWindowDays).toBe(28)
  })

  it('lets positive discoverability evidence influence rank when core dimensions are not manually supplied', () => {
    const high = governed({ id: 'high-discovery', title: 'High discovery evidence', sourceUrl: 'https://thehippiescientist.net/evidence/high-discovery/' })
    const low = governed({ id: 'low-discovery', title: 'Low discovery evidence', sourceUrl: 'https://thehippiescientist.net/evidence/low-discovery/' })
    const signals = {
      'high-discovery': { searchOpportunity: 10, aiCitationOpportunity: 9, socialSuitability: 9, commercialValue: 8, informationUniqueness: 10, evergreenValue: 9 },
      'low-discovery': { searchOpportunity: 2, aiCitationOpportunity: 2, socialSuitability: 3, commercialValue: 2, informationUniqueness: 3, evergreenValue: 3 },
    }
    const result = selectDistributionOpportunity([low, high], signals, { now: NOW })
    expect(result.selected.id).toBe('high-discovery')
    const highScore = result.candidates.find((candidate) => candidate.id === 'high-discovery').score
    const lowScore = result.candidates.find((candidate) => candidate.id === 'low-discovery').score
    expect(highScore).toBeGreaterThan(lowScore)
  })

  it('emits deterministic canonical attribution and lossless discoverability metadata', () => {
    const object = governed()
    const candidate = scoreDistributionCandidate(object, {}, { now: NOW })
    expect(candidate.destination.canonicalUrl).toBe(object.sourceUrl)
    expect(candidate.destination.taggedUrl).toBe('https://thehippiescientist.net/evidence/sleep-intervention/?utm_source=distribution-engine&utm_medium=organic&utm_campaign=evidence-to-distribution&utm_content=sleep-human-trial-carousel-1idk07r')
    expect(candidate.destination.attribution).toEqual({ source: 'distribution-engine', medium: 'organic', campaign: 'evidence-to-distribution', content: 'sleep-human-trial-carousel-1idk07r', cohort: '1idk07r' })
    expect(candidate.discoverability.title).toContain(object.title)
    expect(candidate.discoverability.description).toContain(object.finding)
    expect(candidate.discoverability.description).toContain(object.limitation)
    expect(candidate.discoverability.caption).toContain(object.finding)
    expect(candidate.discoverability.caption).toContain(object.limitation)
    expect(candidate.discoverability.caption).toContain(object.sourceUrl)
    expect(candidate.discoverability.canonicalSource).toBe(object.sourceUrl)
  })

  it('gives changed creative angles distinct experiment attribution without changing the canonical destination', () => {
    const first = scoreDistributionCandidate(governed(), {}, { now: NOW })
    const second = scoreDistributionCandidate(governed({ title: 'Sleep evidence, updated framing' }), {}, { now: NOW })
    expect(first.destination.canonicalUrl).toBe(second.destination.canonicalUrl)
    expect(first.destination.attribution.cohort).not.toBe(second.destination.attribution.cohort)
    expect(first.destination.attribution.content).not.toBe(second.destination.attribution.content)
    expect(first.destination.taggedUrl).not.toBe(second.destination.taggedUrl)
  })

  it('blocks an exact page/platform/angle cohort already present in distribution inventory', () => {
    const object = governed()
    const baseline = scoreDistributionCandidate(object, {}, { now: NOW })
    const cohort = baseline.destination.attribution.cohort
    const candidate = scoreDistributionCandidate(object, { 'sleep-human-trial': { existingAngleCohorts: [cohort, cohort, 'older-cohort'] } }, { now: NOW })
    expect(candidate.eligible).toBe(true)
    expect(candidate.selectable).toBe(false)
    expect(candidate.duplicateAngle).toBe(true)
    expect(candidate.existingAngleCohorts).toEqual(['older-cohort', cohort].sort())
    expect(candidate.distributionBlockedReasons).toEqual(['exact page/platform/angle cohort already exists in distribution inventory'])
  })

  it('falls through to the next eligible opportunity when the top-scoring creative angle is already saturated', () => {
    const top = governed({ id: 'top', title: 'Top evidence', sourceUrl: 'https://thehippiescientist.net/evidence/top/' })
    const next = governed({ id: 'next', title: 'Next evidence', sourceUrl: 'https://thehippiescientist.net/evidence/next/' })
    const topBaseline = scoreDistributionCandidate(top, { top: { impact: 10 } }, { now: NOW })
    const signals = {
      top: { impact: 10, existingAngleCohorts: [topBaseline.destination.attribution.cohort] },
      next: { impact: 8 },
    }
    const result = selectDistributionOpportunity([top, next], signals, { now: NOW })
    expect(result.status).toBe('selected')
    expect(result.selected.id).toBe('next')
    expect(result.candidates.find((candidate) => candidate.id === 'top').duplicateAngle).toBe(true)
  })

  it('returns an explicit unsaturated-angle waiting state when every otherwise eligible angle already exists', () => {
    const object = governed()
    const baseline = scoreDistributionCandidate(object, {}, { now: NOW })
    const result = selectDistributionOpportunity([object], { 'sleep-human-trial': { existingAngleCohorts: [baseline.destination.attribution.cohort] } }, { now: NOW })
    expect(result.status).toBe('waiting-for-unsaturated-angle')
    expect(result.selected).toBeNull()
    expect(result.candidates[0].eligible).toBe(true)
    expect(result.candidates[0].selectable).toBe(false)
  })

  it('uses the swarm scoring formula and subtracts growth risks rather than overriding safety', () => {
    const candidate = scoreDistributionCandidate(governed(), { 'sleep-human-trial': { impact: 8, urgency: 7, breadth: 9, confidence: 9, compoundingLeverage: 9, opportunityAge: 3, reversibility: 10, technicalDebtInterest: 7, effort: 3, regressionRisk: 2, blastRadius: 2, existingAssetSaturation: 4, cannibalizationRisk: 3 } }, { now: NOW })
    expect(candidate.score).toBe(93)
    expect(candidate.eligible).toBe(true)
  })

  it('fails closed for preclinical-only candidates even when growth signals are maximal', () => {
    const object = governed({ id: 'preclinical-only', evidenceType: 'mouse preclinical study', evidenceGrade: 'A', sourceUrl: 'https://thehippiescientist.net/evidence/preclinical-only/' })
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
    expect(selectDistributionOpportunity([], {}, { now: NOW })).toEqual({ schemaVersion: '1.1.0', status: 'waiting-for-governed-object', selected: null, candidates: [] })
  })
})
