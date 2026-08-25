import { describe, expect, it } from 'vitest'
import { shouldShowPreferredSource } from '../preferred-source-eligibility'

describe('Preferred Sources rollout', () => {
  it('shows on the newsletter, editorial, research, and comparison surfaces', () => {
    expect(shouldShowPreferredSource('/info/newsletter')).toBe(true)
    expect(shouldShowPreferredSource('/guides/herbs/ashwagandha/')).toBe(true)
    expect(shouldShowPreferredSource('/compare/ashwagandha-vs-rhodiola/')).toBe(true)
    expect(shouldShowPreferredSource('/research/evidence-grading/')).toBe(true)
    expect(shouldShowPreferredSource('/tools/interaction-checker/')).toBe(true)
  })

  it('shows on the curated authority-candidate profile set', () => {
    expect(shouldShowPreferredSource('/herbs/ashwagandha')).toBe(true)
    expect(shouldShowPreferredSource('/compounds/cannabidiol/')).toBe(true)
  })

  it('does not stamp the control across the full profile library', () => {
    expect(shouldShowPreferredSource('/herbs/obscure-unreviewed-herb/')).toBe(false)
    expect(shouldShowPreferredSource('/compounds/obscure-unreviewed-compound/')).toBe(false)
    expect(shouldShowPreferredSource('/')).toBe(false)
  })
})
