import { describe, expect, it } from 'vitest'

import { evaluateProfileCompleteness } from '@/lib/profile-completeness.mjs'

describe('canonical profile completeness', () => {
  it('scores one shared seven-field model', () => {
    const result = evaluateProfileCompleteness({
      slug: 'example',
      description: 'A real evidence-aware description with useful detail.',
      contraindications: ['Avoid with anticoagulants.'],
      evidence_grade: 'B',
      mechanisms: ['GABA modulation'],
      effects: ['sleep support'],
      dosage: '300 mg',
      interactions: ['warfarin'],
    })

    expect(result.completeness).toBe(1)
    expect(result.missingFields).toEqual([])
  })

  it('treats governed safety abstention as reviewed rather than missing', () => {
    const result = evaluateProfileCompleteness(
      { slug: 'reviewed-empty', contraindications: [] },
      { documentedSafetyExceptions: new Set(['reviewed-empty']) },
    )
    expect(result.details.safety).toBe('DOCUMENTED_EXCEPTION')
    expect(result.missingFields).not.toContain('safety')
  })

  it('can consume the legacy safety field without changing the model', () => {
    const item = { slug: 'legacy', safety: 'Avoid in pregnancy.' }
    const result = evaluateProfileCompleteness(item, { safetyValue: item.safety })
    expect(result.details.safety).toBe('FILLED')
  })
})
