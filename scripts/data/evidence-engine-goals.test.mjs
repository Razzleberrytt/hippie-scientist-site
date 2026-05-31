import { describe, expect, it } from 'vitest'

import {
  getEvidenceEngineGoalConfig,
  getEvidenceEngineGoalConfigs,
  normalizeEvidenceProblemKey,
} from './evidence-engine-goals.mjs'

describe('evidence engine goal configs', () => {
  it('centralizes currently onboarded Evidence Engine goals', () => {
    const goals = getEvidenceEngineGoalConfigs().map((config) => config.goal)

    expect(goals).toEqual(['sleep', 'stress', 'anxiety'])
  })

  it('keeps problem fields and workbook sheets attached to each goal config', () => {
    const stress = getEvidenceEngineGoalConfig('stress')

    expect(stress).toMatchObject({
      goal: 'stress',
      problemField: 'stress_problem',
      defaultDecisionGroup: 'Other stress support',
      claimSheetCandidates: ['Stress Evidence Claims'],
      sourceSheetCandidates: ['Stress Evidence Sources'],
      safetySheetCandidates: ['Stress Safety Notes'],
    })
    expect(stress?.validProblems.has('acute_stress')).toBe(true)
  })

  it('includes anxiety onboarding without hardcoded build wiring', () => {
    const anxiety = getEvidenceEngineGoalConfig('anxiety')

    expect(anxiety).toMatchObject({
      goal: 'anxiety',
      problemField: 'anxiety_problem',
      claimSheetCandidates: ['Anxiety Evidence Claims'],
      sourceSheetCandidates: ['Anxiety Evidence Sources'],
      safetySheetCandidates: ['Anxiety Safety Notes'],
    })
    expect(anxiety?.config?.heroHeadline).toContain('anxiety support')
  })

  it('preserves workbook problem keys with underscores', () => {
    expect(normalizeEvidenceProblemKey(' acute stress ')).toBe('acute_stress')
    expect(normalizeEvidenceProblemKey('stress_sleep_spillover')).toBe('stress_sleep_spillover')
  })
})
