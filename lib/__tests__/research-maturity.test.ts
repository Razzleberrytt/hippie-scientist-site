import { describe, expect, it } from 'vitest'
import {
  canLabelAsPracticalAlternative,
  canMapToCondition,
  displayRelationshipLabel,
  policyForResearchMaturity,
  validateResearchRelationship,
} from '../research-maturity'

describe('research maturity', () => {
  it('visually and commercially separates theoretical research from established evidence', () => {
    const established = policyForResearchMaturity('established')
    const theoretical = policyForResearchMaturity('theoretical')

    expect(established.rank).toBeGreaterThan(theoretical.rank)
    expect(established.commercialAllowed).toBe(true)
    expect(theoretical.commercialAllowed).toBe(false)
    expect(theoretical.purchaseIntentAllowed).toBe(false)
    expect(theoretical.visualWeight).toBe('research-only')
  })

  it('blocks mechanism-only evidence from becoming a supported condition mapping', () => {
    const relationship = {
      fromId: 'compound:a',
      toId: 'condition:anxiety',
      kind: 'outcome-supported' as const,
      outcomeEvidenceCount: 0,
      mechanismEvidenceCount: 4,
    }

    expect(canMapToCondition(relationship)).toBe(false)
    expect(validateResearchRelationship(relationship).map((issue) => issue.code)).toContain(
      'mechanism-mapped-as-clinical-outcome',
    )
  })

  it('allows mechanism-derived condition relationships only when labeled exploratory', () => {
    expect(
      canMapToCondition({
        fromId: 'compound:a',
        toId: 'condition:anxiety',
        kind: 'exploratory-outcome',
        outcomeEvidenceCount: 0,
        mechanismEvidenceCount: 4,
      }),
    ).toBe(true)
  })

  it('does not call chemical similarity a practical alternative', () => {
    const chemical = {
      fromId: 'a',
      toId: 'b',
      kind: 'similar-chemistry' as const,
      outcomeEvidenceCount: 0,
      mechanismEvidenceCount: 2,
    }
    const unsupportedAlternative = { ...chemical, kind: 'practical-alternative' as const }

    expect(displayRelationshipLabel(chemical.kind)).toBe('Similar chemistry')
    expect(canLabelAsPracticalAlternative(chemical)).toBe(false)
    expect(validateResearchRelationship(unsupportedAlternative).map((issue) => issue.code)).toContain(
      'alternative-without-outcome-evidence',
    )
  })

  it('allows practical alternatives only when same-goal outcome evidence exists', () => {
    expect(
      canLabelAsPracticalAlternative({
        fromId: 'a',
        toId: 'b',
        kind: 'practical-alternative',
        outcomeEvidenceCount: 3,
      }),
    ).toBe(true)
  })
})
