import { describe, expect, it } from 'vitest'
import {
  admissionDecision, computeSessionYield, contradictionPriority, promotionBlockerDisposition, promotionDecision,
  routeSubmission, semanticAttestationStatus, scoreOrphan, scoreWorkpack,
} from '../lib/control-plane.mjs'

const verified = {
  entity: { status: 'matched' }, preparation: { status: 'matched' },
  population: { status: 'not_applicable' }, endpoint: { status: 'matched' },
  conclusion: { status: 'matched' },
}

function base(overrides = {}) {
  return {
    submissionId: 'sub_test', entityType: 'herb', entitySlug: 'sage', sourceId: 'src_test',
    topicType: 'supported_use', claimType: 'efficacy_signal', evidenceClass: 'human-clinical',
    reviewStatus: 'approved_for_rollup', active: true, semanticAttestation: verified, ...overrides,
  }
}

describe('enrichment control plane', () => {
  it('requires all semantic axes before promotion while routing unknowns to automated adjudication', () => {
    expect(semanticAttestationStatus(verified)).toBe('verified')
    expect(promotionDecision(base(), { sourceId: 'src_test', active: true }).eligible).toBe(true)
    const incomplete = base({ semanticAttestation: { ...verified, endpoint: { status: 'unknown' } } })
    const decision = promotionDecision(incomplete, { sourceId: 'src_test', active: true })
    expect(decision.eligible).toBe(false)
    expect(promotionBlockerDisposition(decision)).toMatchObject({
      hardBlocked: false,
      automatedAdjudicationPending: true,
      canContinueResearch: true,
      adjudicationReasons: ['semantic_incomplete'],
    })
  })

  it('routes source admission and editorial approval to automated adjudication', () => {
    const missingSource = promotionDecision(base(), null)
    expect(promotionBlockerDisposition(missingSource)).toMatchObject({
      hardBlocked: false,
      automatedAdjudicationPending: true,
      canContinueResearch: true,
    })
    expect(promotionBlockerDisposition(missingSource).adjudicationReasons).toContain('source_missing_from_registry')

    const needsEditorial = promotionDecision(base({ reviewStatus: 'needs_review' }), { sourceId: 'src_test', active: true })
    expect(promotionBlockerDisposition(needsEditorial)).toMatchObject({
      hardBlocked: false,
      automatedAdjudicationPending: true,
      canContinueResearch: true,
    })
    expect(promotionBlockerDisposition(needsEditorial).adjudicationReasons).toContain('not_approved_for_rollup')
  })

  it('quarantines semantic mismatches as hard blocks regardless of review status', () => {
    const submission = base({ semanticAttestation: { ...verified, conclusion: { status: 'mismatch' } } })
    expect(routeSubmission(submission)).toBe('source_quarantine')
    const decision = promotionDecision(submission, { sourceId: 'src_test', active: true })
    expect(decision.eligible).toBe(false)
    expect(promotionBlockerDisposition(decision)).toMatchObject({
      hardBlocked: true,
      automatedAdjudicationPending: false,
      canContinueResearch: false,
    })
  })

  it('keeps rejected or inactive submissions hard-blocked', () => {
    const rejected = promotionDecision(base({ reviewStatus: 'rejected' }), { sourceId: 'src_test', active: true })
    expect(promotionBlockerDisposition(rejected).hardBlocked).toBe(true)

    const inactive = promotionDecision(base({ active: false }), { sourceId: 'src_test', active: true })
    expect(promotionBlockerDisposition(inactive)).toMatchObject({ hardBlocked: true, canContinueResearch: false })
  })

  it('routes negative and safety findings explicitly', () => {
    expect(routeSubmission(base({ claimType: 'efficacy_null_or_mixed' }))).toBe('contradiction_record')
    expect(routeSubmission(base({ topicType: 'interaction', claimType: 'safety_risk' }))).toBe('safety_correction')
    expect(contradictionPriority(base({ claimType: 'efficacy_null_or_mixed', uncertaintyNote: 'heterogeneous' }))).toBeGreaterThan(40)
  })

  it('ranks published safety/human orphan repairs above low-value ones', () => {
    const high = scoreOrphan({ published: true, safetyRelevant: true, humanEvidence: true, trafficScore: 5, fanoutCount: 3 })
    const low = scoreOrphan({ published: false, safetyRelevant: false, humanEvidence: false })
    expect(high.score).toBeGreaterThan(low.score)
  })

  it('separates automated-adjudication latency from a true hard workpack block', () => {
    const adjudicationPending = scoreWorkpack({ safetyRisk: 5, evidenceGap: 5, expectedYield: 5, automatedAdjudicationPending: true })
    const sameOpen = scoreWorkpack({ safetyRisk: 5, evidenceGap: 5, expectedYield: 5 })
    const hardBlocked = scoreWorkpack({ safetyRisk: 5, evidenceGap: 5, expectedYield: 5, hardBlocked: true })
    expect(adjudicationPending.components.adjudicationPenalty).toBe(-2)
    expect(adjudicationPending.components.stalePenalty).toBe(0)
    expect(adjudicationPending.score).toBe(sameOpen.score - 2)
    expect(hardBlocked.components.stalePenalty).toBe(-100)
    expect(adjudicationPending.score).toBeGreaterThan(hardBlocked.score)
  })

  it('uses safety, gaps, yield and contradiction opportunity in workpack ROI', () => {
    const rich = scoreWorkpack({ safetyRisk: 5, evidenceGap: 5, expectedYield: 5, seekContradictions: true })
    const weak = scoreWorkpack({ evidenceGap: 1 })
    expect(rich.score).toBeGreaterThan(weak.score)
  })

  it('never throttles research staging but stops promotion under red queue pressure', () => {
    expect(admissionDecision({ queuedRuns: 100 }).allowResearchStaging).toBe(true)
    expect(admissionDecision({ queuedRuns: 100 }).allowPromotion).toBe(false)
    expect(admissionDecision({ queuedRuns: 0, openEnrichmentPrs: 0 }).level).toBe('green')
  })

  it('reports conversion-oriented session yield', () => {
    const report = computeSessionYield([
      base({ promotionStatus: 'promoted' }),
      base({ submissionId: 'sub_null', claimType: 'efficacy_null_or_mixed' }),
    ], { elapsedHours: 2 })
    expect(report.findings).toBe(2)
    expect(report.promoted).toBe(1)
    expect(report.negativeOrContradictory).toBe(1)
    expect(report.findingsPerHour).toBe(1)
  })
})
