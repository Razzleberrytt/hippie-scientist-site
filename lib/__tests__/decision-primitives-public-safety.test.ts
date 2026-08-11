import { describe, expect, it } from 'vitest'
import { normalizeDecisionSafety, publicSafetyLabel } from '../decision-primitives'

describe('public safety labels', () => {
  it('keeps pending-review workflow state internally while presenting limited data publicly', () => {
    expect(normalizeDecisionSafety()).toBe('Safety review pending')
    expect(publicSafetyLabel()).toBe('Safety data limited')
    expect(publicSafetyLabel('Safety review pending')).toBe('Safety data limited')
  })

  it('preserves substantive public safety states', () => {
    expect(publicSafetyLabel('Interaction risk')).toBe('Interaction risk')
    expect(publicSafetyLabel('Generally well tolerated')).toBe('Generally well tolerated')
    expect(publicSafetyLabel('Use caution')).toBe('Use caution')
  })
})
