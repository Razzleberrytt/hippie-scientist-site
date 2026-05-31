import { describe, expect, it } from 'vitest'

import {
  getEvidenceEngineGoalConfig,
  getEvidenceEngineGoalConfigs,
} from './evidence-engine-goals.mjs'

describe('evidence engine goal configs', () => {
  it('centralizes currently onboarded Evidence Engine goals', () => {
    const goals = getEvidenceEngineGoalConfigs().map((config) => config.goal)

    expect(goals).toEqual(['sleep', 'stress'])
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
})
