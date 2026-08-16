import { describe, expect, it } from 'vitest'

import { normalizeEvidenceGrade, reconcileEvidenceGrade } from '../evidence-grade'

describe('outcome-dependent evidence grades', () => {
  it.each([
    'Varies by outcome',
    'Evidence differs by outcome',
    'Outcome-dependent',
    'Depends on the outcome',
    'A for sleep; B for anxiety',
  ])('keeps %s unresolved', (value) => {
    expect(normalizeEvidenceGrade(value)).toMatchObject({
      grade: null,
      band: null,
      outcomeDependent: true,
    })
    expect(reconcileEvidenceGrade(value, 'Strong Evidence')).toMatchObject({
      grade: null,
      band: null,
      reason: 'unresolved',
    })
  })
})
