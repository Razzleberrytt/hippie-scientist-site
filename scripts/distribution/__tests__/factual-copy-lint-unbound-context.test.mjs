import { describe, expect, it } from 'vitest'

import { validateFactualAssetCopy } from '../factual-copy-lint.mjs'

const pack = {
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

describe('distribution factual-copy unbound context lint', () => {
  it.each([
    '300 mg studied',
    'Works in 30 minutes',
    '30 minute onset',
    'Equivalent to melatonin',
    'As effective as the standard treatment',
  ])('rejects factual label text that bypasses governed provenance: %s', (text) => {
    const errors = validateFactualAssetCopy(pack, {
      assetType: 'overlay',
      lines: [{ role: 'label', factual: false, text }],
    })
    expect(errors.join('\n')).toMatch(/factual labels must be represented as governed claim, uncertainty, or safety lines/i)
  })

  it('keeps genuinely nonfactual creative labels available', () => {
    expect(validateFactualAssetCopy(pack, {
      assetType: 'overlay',
      lines: [{ role: 'label', factual: false, text: 'One study, carefully framed' }],
    })).toEqual([])
  })
})
