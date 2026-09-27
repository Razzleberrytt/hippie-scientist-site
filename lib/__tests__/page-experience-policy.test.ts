import { describe, expect, it } from 'vitest'
import {
  isHubRoute,
  isProfileRoute,
  isResearchSurface,
  isUtilityRoute,
  shouldShowGlobalBreadcrumbs,
  shouldShowGlobalLeadMagnet,
  shouldShowGlobalToc,
} from '../page-experience-policy'

describe('page experience policy', () => {
  it('treats major front doors and topic indexes as hubs', () => {
    expect(isHubRoute('/research/')).toBe(true)
    expect(isHubRoute('/guides/')).toBe(true)
    expect(isHubRoute('/guides/sleep/')).toBe(true)
    expect(isHubRoute('/goals/focus/')).toBe(true)
    expect(isHubRoute('/guides/sleep/magnesium-for-sleep/')).toBe(false)
  })

  it('distinguishes profiles and interactive utilities from editorial pages', () => {
    expect(isProfileRoute('/herbs/ashwagandha/')).toBe(true)
    expect(isProfileRoute('/compounds/l-theanine/')).toBe(true)
    expect(isUtilityRoute('/safety-checker/')).toBe(true)
    expect(isUtilityRoute('/learn/citation-explorer/')).toBe(true)
    expect(isUtilityRoute('/guides/sleep/magnesium-for-sleep/')).toBe(false)
  })

  it('keeps research infrastructure free of unrelated global marketing modules', () => {
    expect(isResearchSurface('/research/')).toBe(true)
    expect(isResearchSurface('/evidence/evidence-report/')).toBe(true)
    expect(isResearchSurface('/info/methodology/')).toBe(true)
    expect(shouldShowGlobalLeadMagnet('/research/')).toBe(false)
    expect(shouldShowGlobalLeadMagnet('/evidence/evidence-report/')).toBe(false)
  })

  it('keeps hub and tool chrome lean while preserving editorial assistance', () => {
    expect(shouldShowGlobalBreadcrumbs('/guides/')).toBe(false)
    expect(shouldShowGlobalToc('/guides/sleep/')).toBe(false)
    expect(shouldShowGlobalToc('/safety-checker/')).toBe(false)
    expect(shouldShowGlobalToc('/guides/sleep/magnesium-for-sleep/')).toBe(true)
    expect(shouldShowGlobalLeadMagnet('/guides/sleep/magnesium-for-sleep/')).toBe(true)
    expect(shouldShowGlobalLeadMagnet('/herbs/ashwagandha/')).toBe(true)
  })
})
