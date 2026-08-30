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
  safety: [{
    id: 'SAFETY_001',
    statement: 'Safety depends on the product and person; check interactions and population-specific cautions.',
  }],
  uncertainties: [{
    id: 'UNCERTAINTY_001',
    statement: 'This was one study and does not establish a universal effect.',
  }],
  cta: { label: 'Read the evidence' },
}

describe('distribution factual-copy unbound safety/regulatory lint', () => {
  it.each([
    'FDA approved',
    'FDA approval',
    'FDA-cleared',
    'Approved by the FDA',
    'Cleared by the FDA',
    'No known drug interactions',
    'Interaction-free',
    'Safe during pregnancy',
    'Safe while pregnant',
    'Pregnancy-safe',
    'Safe for children',
    'Non-habit-forming',
    'Non-addictive',
    'Not addictive',
  ])('rejects safety or regulatory label text that bypasses governed provenance: %s', (text) => {
    const errors = validateFactualAssetCopy(pack, {
      assetType: 'overlay',
      lines: [{ role: 'label', factual: false, text }],
    })
    expect(errors.join('\n')).toMatch(/factual labels must be represented as governed claim, uncertainty, or safety lines/i)
  })

  it('keeps nonfactual creative labels available', () => {
    expect(validateFactualAssetCopy(pack, {
      assetType: 'overlay',
      lines: [{ role: 'label', factual: false, text: 'Safety context matters' }],
    })).toEqual([])
  })
})
