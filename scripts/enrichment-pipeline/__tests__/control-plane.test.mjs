import { describe, expect, it } from 'vitest'
import {
  admissionDecision, automatedAdjudicationDecision, computeSessionYield, contradictionPriority,
  promotionBlockerDisposition, promotionDecision, routeSubmission, semanticAttestationStatus,
  scoreOrphan, scoreWorkpack,
} from '../lib/control-plane.mjs'

const verified = {
  entity: { status: 'matched', reason: 'Exact entity identity verified.', evidence: ['entity identity receipt'] },
  preparation: { status: 'matched', reason: 'Preparation boundary verified.', evidence: ['preparation receipt'] },
  population: { status: 'not_applicable', reason: 'Population is not a gating distinction for this fixture.', evidence: ['fixture boundary'] },
  endpoint: { status: 'matched', reason: 'Endpoint is proposition compatible.', evidence: ['endpoint receipt'] },
  conclusion: { status: 'matched', reason: 'Conclusion direction is preserved.', evidence: ['conclusion receipt'] },
}

const source = {
  sourceId: 'src_test', active: true, publicationStatus: 'published', evidenceClass: 'human-clinical',
}

function base(overrides = {}) {
  return {
    submissionId: 'sub_test', entityType: 'herb', entitySlug: 'sage', sourceId: 'src_test',
    topicType: 'supported_use', claimType: 'efficacy_signal', evidenceClass: 'human-clinical',
    reviewStatus: 'ready_for_review', active: true, semanticAttestation: verified, ...overrides,
  }
}

describe('enrichment control plane', () => {
  it('auto-approves a review-ready submission when source and all five semantic axes are proven', () => {
    expect(semanticAttestationStatus(verified)).toBe('verified')
    expect(automatedAdjudicationDecision(base(), source)).toMatchObject({
      status: 'auto_approved', reviewer: 'enrichment-adjudicator', semantic: 'verified',
    })
    const decision = promotionDecision(base(), source)
    expect(decision.eligible).toBe(true)
    expect(decision.adjudication.status).toBe('auto_approved')
  })

  it('quarantines incomplete semantic proof without asking the owner and keeps research live', () => {
    const incomplete = base({ semanticAttestation: { ...verified, endpoint: { status: 'unknown', reason: 'Endpoint could not be resolved.', evidence: ['insufficient source detail'] } } })
    const decision = promotionDecision(incomplete, source)
    expect(decision.eligible).toBe(false)
    expect(decision.adjudication.status).toBe('quarantined_unresolved')
    const disposition = promotionBlockerDisposition(decision)
    expect(disposition).toMatchObject({
      hardBlocked: false,
      automatedAdjudicationPending: true,
      canContinueResearch: true,
    })
    expect(disposition.adjudicationReasons).toContain('semantic_incomplete')
  })

  it('keeps missing source admission in automated resolution rather than human review', () => {
    const decision = promotionDecision(base(), null)
    expect(decision.adjudication.status).toBe('quarantined_unresolved')
    const disposition = promotionBlockerDisposition(decision)
    expect(disposition).toMatchObject({
      hardBlocked: false,
      automatedAdjudicationPending: true,
      canContinueResearch: true,
    })
    expect(disposition.adjudicationReasons).toContain('source_missing_from_registry')
  })

  it('auto-rejects semantic mismatches as hard blocks', () => {
    const submission = base({ semanticAttestation: { ...verified, conclusion: { status: 'mismatch', reason: 'Source conclusion contradicts staged claim.', evidence: ['direction mismatch'] } } })
    expect(routeSubmission(submission)).toBe('source_quarantine')
    const decision = promotionDecision(submission, source)
    expect(decision.eligible).toBe(false)
    expect(decision.adjudication.status).toBe('auto_rejected')
    expect(promotionBlockerDisposition(decision)).toMatchObject({
      hardBlocked: true,
      automatedAdjudicationPending: false,
      canContinueResearch: false,
    })
  })

  it('auto-rejects withdrawn/superseded sources and evidence-class conflicts', () => {
    const withdrawn = promotionDecision(base(), { ...source, publicationStatus: 'withdrawn' })
    expect(withdrawn.adjudication.status).toBe('auto_rejected')
    expect(promotionBlockerDisposition(withdrawn).hardBlocked).toBe(true)

    const classMismatch = promotionDecision(base(), { ...source, evidenceClass: 'preclinical-mechanistic' })
    expect(classMismatch.adjudication.status).toBe('auto_rejected')
    expect(promotionBlockerDisposition(classMismatch).hardBlocked).toBe(true)
  })

  it('keeps rejected or inactive submissions hard-blocked', () => {
    const rejected = promotionDecision(base({ reviewStatus: 'rejected' }), source)
    expect(promotionBlockerDisposition(rejected).hardBlocked).toBe(true)

    const inactive = promotionDecision(base({ active: false }), source)
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
      base({ reviewStatus: 'approved_for_rollup', promotionStatus: 'promoted' }),
      base({ submissionId: 'sub_null', claimType: 'efficacy_null_or_mixed' }),
    ], { elapsedHours: 2 })
    expect(report.findings).toBe(2)
    expect(report.promoted).toBe(1)
    expect(report.negativeOrContradictory).toBe(1)
    expect(report.findingsPerHour).toBe(1)
  })
})
