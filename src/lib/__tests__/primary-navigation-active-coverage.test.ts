import { describe, expect, it } from 'vitest'
import { primaryNavigation } from '../../../lib/primary-navigation'

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

  it('keeps Ingredients active across both herb and compound depth routes', () => {
    const ingredients = primaryNavigation.find((item) => item.label === 'Ingredients')
    expect(ingredients?.activePrefixes).toEqual(expect.arrayContaining(['/herbs', '/compounds']))
  })

  it('keeps Safety active on the checker itself as well as supporting safety routes', () => {
    const safety = primaryNavigation.find((item) => item.label === 'Safety')
    expect(safety?.activePrefixes).toContain('/safety-checker')
  })
})
