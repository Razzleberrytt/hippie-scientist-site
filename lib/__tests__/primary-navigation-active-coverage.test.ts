import { describe, expect, it } from 'vitest'
import { getActivePrimaryNavigationItem, primaryNavigation } from '../primary-navigation'

function normalize(path: string) {
  return path === '/' ? '/' : path.replace(/\/$/, '')
}

function prefixCoversRoute(prefix: string, route: string) {
  const normalizedPrefix = normalize(prefix)
  const normalizedRoute = normalize(route)
  return normalizedRoute === normalizedPrefix || normalizedRoute.startsWith(`${normalizedPrefix}/`)
}

describe('primary navigation active coverage', () => {
  it('keeps every primary item active on its own href when custom active prefixes are configured', () => {
    const uncovered = primaryNavigation
      .filter((item) => item.activePrefixes?.length)
      .filter((item) => !(item.activePrefixes || []).some((prefix) => prefixCoversRoute(prefix, item.href)))
      .map((item) => ({ label: item.label, href: item.href, activePrefixes: item.activePrefixes }))

    expect(uncovered).toEqual([])
  })

  it('keeps editorial content owned by Guides', () => {
    const guides = primaryNavigation.find((item) => item.label === 'Guides')
    expect(guides?.activePrefixes).toEqual(expect.arrayContaining(['/guides', '/learn', '/articles']))
    expect(getActivePrimaryNavigationItem('/guides/mental-health/avoidant-borderline-personality-disorders-couples/')?.label).toBe('Guides')
    expect(getActivePrimaryNavigationItem('/learn/how-neurotransmitters-work/')?.label).toBe('Guides')
    expect(getActivePrimaryNavigationItem('/articles/example-research-note/')?.label).toBe('Guides')
  })

  it('lets specific research tools override the broad Learn ownership', () => {
    expect(getActivePrimaryNavigationItem('/learn/citation-explorer/')?.label).toBe('Research')
    expect(getActivePrimaryNavigationItem('/evidence/evidence-report/')?.label).toBe('Research')
    expect(getActivePrimaryNavigationItem('/info/methodology/')?.label).toBe('Research')
  })

  it('lets a more-specific Safety route override the broad Guides prefix', () => {
    expect(getActivePrimaryNavigationItem('/guides/other/supplement-stacking-safety/')?.label).toBe('Safety')
    expect(getActivePrimaryNavigationItem('/safety-checker/')?.label).toBe('Safety')
  })

  it('keeps Ingredients active across both herb and compound depth routes', () => {
    const ingredients = primaryNavigation.find((item) => item.label === 'Ingredients')
    expect(ingredients?.activePrefixes).toEqual(expect.arrayContaining(['/herbs', '/compounds']))
  })

  it('keeps Safety active on the checker itself as well as supporting safety routes', () => {
    const safety = primaryNavigation.find((item) => item.label === 'Safety')
    expect(safety?.activePrefixes).toContain('/safety-checker')
  })
})
