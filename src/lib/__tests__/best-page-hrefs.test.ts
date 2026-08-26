import { describe, expect, it } from 'vitest'
import { bestPageHref } from '../../../data/best'
import { SEO_GUIDE_ROUTES } from '../canonical-routes'

describe('bestPageHref canonical guide targets', () => {
  it('routes core discovery intents directly to canonical guide URLs', () => {
    expect(bestPageHref('sleep')).toBe(SEO_GUIDE_ROUTES.sleep)
    expect(bestPageHref('stress')).toBe(SEO_GUIDE_ROUTES.stress)
    expect(bestPageHref('focus')).toBe(SEO_GUIDE_ROUTES.focus)
    expect(bestPageHref('anxiety')).toBe(SEO_GUIDE_ROUTES.anxiety)
    expect(bestPageHref('adaptogens')).toBe(SEO_GUIDE_ROUTES.adaptogensStress)
  })

  it('routes sleep-intent variants directly to the canonical sleep guide', () => {
    expect(bestPageHref('non-melatonin-sleep')).toBe(SEO_GUIDE_ROUTES.sleep)
    expect(bestPageHref('falling-asleep')).toBe(SEO_GUIDE_ROUTES.sleep)
    expect(bestPageHref('staying-asleep')).toBe(SEO_GUIDE_ROUTES.sleep)
  })
})
