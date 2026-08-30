import { describe, expect, it } from 'vitest'
import { validateFactualAssetCopy } from '../factual-copy-lint.mjs'

const pack = {
  claims: [{ id: 'CLAIM_001', publicSafeStatement: 'In one randomized trial, the intervention improved the prespecified sleep outcome versus control.', evidenceContext: 'human' }],
  uncertainties: [{ id: 'UNCERTAINTY_001', statement: 'This was one study and does not establish a universal effect.' }],
  safety: [],
  cta: { label: 'Read the evidence' },
}

for (const assetType of ['infographic', 'carousel']) {
  describe(`${assetType} claim-safe compression`, () => {
    it('rejects a factual visual that drops governed uncertainty', () => {
      const errors = validateFactualAssetCopy(pack, {
        assetType,
        lines: [{ role: 'claim', claimId: 'CLAIM_001', text: pack.claims[0].publicSafeStatement }],
      })
      expect(errors).toContain(`${assetType} is missing governed uncertainty UNCERTAINTY_001`)
    })

    it('rejects a context-only visual that drops the governed claim', () => {
      const errors = validateFactualAssetCopy(pack, {
        assetType,
        lines: [{ role: 'uncertainty', uncertaintyId: 'UNCERTAINTY_001', text: pack.uncertainties[0].statement }],
      })
      expect(errors).toContain(`${assetType} is missing governed claim CLAIM_001`)
    })

    it('accepts the governed claim and uncertainty together', () => {
      expect(validateFactualAssetCopy(pack, {
        assetType,
        lines: [
          { role: 'claim', claimId: 'CLAIM_001', text: pack.claims[0].publicSafeStatement },
          { role: 'uncertainty', uncertaintyId: 'UNCERTAINTY_001', text: pack.uncertainties[0].statement },
        ],
      })).toEqual([])
    })
  })
}
