import { describe, expect, it } from 'vitest'
import {
  admissionDecision, computeSessionYield, contradictionPriority, promotionDecision,
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
  it('requires all semantic axes before promotion', () => {
    expect(semanticAttestationStatus(verified)).toBe('verified')
    expect(promotionDecision(base(), { sourceId: 'src_test', active: true }).eligible).toBe(true)
    const incomplete = base({ semanticAttestation: { ...verified, endpoint: { status: 'unknown' } } })
    expect(promotionDecision(incomplete, { sourceId: 'src_test', active: true }).eligible).toBe(false)
  })

  it('quarantines semantic mismatches regardless of review status', () => {
    const submission = base({ semanticAttestation: { ...verified, conclusion: { status: 'mismatch' } } })
    expect(routeSubmission(submission)).toBe('source_quarantine')
    expect(promotionDecision(submission, { sourceId: 'src_test', active: true }).eligible).toBe(false)
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
