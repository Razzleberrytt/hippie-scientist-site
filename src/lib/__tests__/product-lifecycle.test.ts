import { describe, expect, it } from 'vitest'
import { evaluateProductLifecycle, shouldSuppressProductRecommendation } from '../product-lifecycle'

describe('product lifecycle recommendation gates', () => {
  const now = new Date('2026-08-15T12:00:00Z')

  it('allows recently verified products', () => {
    expect(evaluateProductLifecycle({ status: 'active', lastVerifiedAt: '2026-08-01' }, now)).toMatchObject({ status: 'active', action: 'allow' })
  })

  it('flags old verification for review instead of pretending the product disappeared', () => {
    expect(evaluateProductLifecycle({ status: 'active', lastVerifiedAt: '2026-01-01' }, now, 90)).toMatchObject({ status: 'stale', action: 'review' })
  })

  it('blocks discontinued products', () => {
    expect(shouldSuppressProductRecommendation({ discontinued: true })).toBe(true)
  })

  it('blocks formulation changes', () => {
    expect(evaluateProductLifecycle({ reviewedFormulationFingerprint: 'old', currentFormulationFingerprint: 'new' }, now)).toMatchObject({ status: 'formulation-changed', action: 'block' })
  })

  it('blocks a product form that no longer matches the reviewed evidence form', () => {
    expect(evaluateProductLifecycle({ reviewedEvidenceForm: 'KSM-66 extract', currentProductForm: 'generic root powder' }, now)).toMatchObject({ status: 'formulation-changed', action: 'block' })
  })
})
