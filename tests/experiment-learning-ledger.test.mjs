import { describe, expect, it } from 'vitest'
import { assertAppendOnly, priorTestDecision, validateEntry, validateLedger } from '../scripts/ci/experiment-learning-ledger.mjs'

const base = {
  experiment_id:'exp:v1:surface|family|metric|fixture', surface:'surface', hypothesis:'same hypothesis', intervention_family:'family', primary_metric:'metric', owning_issue:4414, owning_pr:null,
  baseline_window:{start:'2026-08-01',end:'2026-08-07'}, intervention:'fixture', guardrails:['safety'], minimum_evidence_requirement:'100 attributable observations',
  observation_window:{start:'2026-08-08',end:'2026-08-14'}, result:'null', sample_exposure:120, attribution_confounds:[], confidence:'medium', decision:'stop', rollback_stop_status:'stopped',
  meaningful_lesson:'fixture', retest_after:'2026-09-01T00:00:00Z', retest_conditions:['material condition changed'], observation_sources:['analytics:fixture'], revision:1, supersedes_revision:null, recorded_at:'2026-08-15T00:00:00Z'
}

describe('experiment learning ledger', () => {
  it('blocks a duplicate experiment without changed conditions', () => {
    const verdict = priorTestDecision({...base}, [base])
    expect(verdict.status).toBe('duplicate-blocked')
    expect(verdict.promotable).toBe(false)
  })

  it('allows a legitimate retest only with a named changed assumption and fresh baseline', () => {
    const verdict = priorTestDecision({...base, changed_assumptions:['Search layout materially changed'], baseline_window:{start:'2026-09-02',end:'2026-09-08'}}, [base], {now:new Date('2026-09-09T00:00:00Z')})
    expect(verdict.status).toBe('retest-allowed')
    expect(verdict.promotable).toBe(true)
  })

  it('preserves underpowered as distinct from null and requires exposure', () => {
    expect(validateEntry({...base, result:'underpowered', sample_exposure:20})).toEqual([])
    expect(validateEntry({...base, result:'underpowered', sample_exposure:null})).toContain('underpowered requires sample_exposure')
  })

  it('preserves missing measurement as Unknown and never allows it to scale', () => {
    const unknown = {...base, result:'Unknown', observation_window:{start:null,end:null}, sample_exposure:null, observation_sources:[], decision:'do-not-promote'}
    expect(validateEntry(unknown)).toEqual([])
    expect(validateEntry({...unknown, decision:'scale'})).toContain('Unknown result cannot scale')
  })

  it('is append-only and rejects historical rewrites', () => {
    expect(() => assertAppendOnly([base], [base, {...base, revision:2, supersedes_revision:1}])).not.toThrow()
    expect(() => assertAppendOnly([base], [{...base, meaningful_lesson:'rewritten'}])).toThrow(/historical line 1 changed/)
  })

  it('rejects duplicate revisions deterministically', () => {
    expect(validateLedger([base, base]).some((error) => error.includes('duplicate revision'))).toBe(true)
  })
})
