import { describe, expect, it } from 'vitest'
import {
  LEAD_MAGNETS,
  getContextualLeadMagnet,
  getLeadMagnet,
  shouldShowContextualLeadMagnet,
} from '../lead-magnets'

describe('contextual lead magnets', () => {
  it('routes sleep research to the sleep-specific offer', () => {
    expect(getContextualLeadMagnet('/guides/sleep/best-supplements-for-sleep/').slug).toBe('sleep-supplement-evidence-guide')
    expect(getContextualLeadMagnet('/herbs/melatonin/').slug).toBe('sleep-supplement-evidence-guide')
  })

  it('routes stress and anxiety research to the stress-specific offer', () => {
    expect(getContextualLeadMagnet('/guides/anxiety/').slug).toBe('anxiety-stress-evidence-cheat-sheet')
    expect(getContextualLeadMagnet('/herbs/ashwagandha/').slug).toBe('anxiety-stress-evidence-cheat-sheet')
  })

  it('routes focus and nootropic research to the focus-specific offer', () => {
    expect(getContextualLeadMagnet('/guides/focus/').slug).toBe('focus-supplement-evidence-cheat-sheet')
    expect(getContextualLeadMagnet('/compounds/l-theanine/').slug).toBe('focus-supplement-evidence-cheat-sheet')
  })

  it('routes safety and interaction research to the interaction checklist', () => {
    expect(getContextualLeadMagnet('/safety-checker/').slug).toBe('supplement-interaction-checklist')
    expect(getContextualLeadMagnet('/safety-checker/interactions/st-johns-wort-antidepressants/').slug).toBe('supplement-interaction-checklist')
  })

  it('routes commercial comparison and buying research to the buying-questions PDF', () => {
    expect(getContextualLeadMagnet('/learn/product-quality/').slug).toBe('questions-before-buying-supplements')
    expect(getContextualLeadMagnet('/guides/compare/magnesium-vs-melatonin/').slug).toBe('questions-before-buying-supplements')
  })

  it('uses the label-reading guide for generic ingredient profiles', () => {
    expect(getContextualLeadMagnet('/herbs/elderberry/').slug).toBe('supplement-label-reading-guide')
    expect(getContextualLeadMagnet('/compounds/quercetin/').slug).toBe('supplement-label-reading-guide')
  })

  it('uses the evidence starter kit as the default offer', () => {
    expect(getContextualLeadMagnet('/about/').slug).toBe('supplement-evidence-starter-kit')
  })

  it('suppresses the contextual capture where another primary capture or policy boundary owns the page', () => {
    expect(shouldShowContextualLeadMagnet('/')).toBe(false)
    expect(shouldShowContextualLeadMagnet('/lead-magnets/sleep-supplement-evidence-guide/')).toBe(false)
    expect(shouldShowContextualLeadMagnet('/privacy/')).toBe(false)
    expect(shouldShowContextualLeadMagnet('/terms/')).toBe(false)
    expect(shouldShowContextualLeadMagnet('/herbs/ashwagandha/')).toBe(true)
  })

  it('keeps every registered resource addressable by its stable slug', () => {
    const offers = Object.values(LEAD_MAGNETS)
    expect(new Set(offers.map((offer) => offer.slug)).size).toBe(offers.length)
    for (const offer of offers) expect(getLeadMagnet(offer.slug)).toBe(offer)
  })

  it('ships the buying checklist as a real PDF asset', () => {
    const offer = LEAD_MAGNETS['questions-before-buying-supplements']
    expect(offer.downloadHref).toBe('/lead-magnets/questions-to-ask-before-buying-supplements.pdf')
    expect(offer.downloadHref).toMatch(/\.pdf$/)
  })
})
