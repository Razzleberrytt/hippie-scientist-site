import { describe, expect, it } from 'vitest'

import { validateFactualAssetCopy } from '../factual-copy-lint.mjs'

function pack() {
  return {
    schemaVersion: '1.0.0',
    packId: 'fixture-media-v1',
    claims: [{
      id: 'CLAIM_001',
      publicSafeStatement: 'In the recorded randomized trial, the intervention improved the prespecified sleep outcome versus control.',
      evidenceContext: 'human',
    }],
    safety: [],
    uncertainties: [{
      id: 'UNCERTAINTY_001',
      statement: 'This was one study and does not establish a universal effect.',
    }],
    cta: { label: 'Read the evidence' },
  }
}

describe('distribution factual-label provenance regression', () => {
  it.each([
    'Clinically proven.',
    'Scientific evidence shows this works.',
    'Studies show improved sleep.',
    'Research suggests better sleep outcomes.',
    'Improves sleep quality.',
    'Effective for anxiety.',
  ])('rejects unbound factual label: %s', (text) => {
    const errors = validateFactualAssetCopy(pack(), {
      assetType: 'overlay',
      lines: [{ role: 'label', text }],
    })
    expect(errors.join('\n')).toMatch(/factual labels must be represented as governed claim/i)
  })

  it('keeps nonfactual creative labels available', () => {
    expect(validateFactualAssetCopy(pack(), {
      assetType: 'overlay',
      lines: [{ role: 'label', text: 'One study, carefully framed' }],
    })).toEqual([])
  })

  it('accepts the same scientific content only through the governed claim binding', () => {
    expect(validateFactualAssetCopy(pack(), {
      assetType: 'overlay',
      lines: [{
        role: 'claim',
        claimId: 'CLAIM_001',
        text: 'In the recorded randomized trial, the intervention improved the prespecified sleep outcome versus control.',
      }],
    })).toEqual([])
  })
})
