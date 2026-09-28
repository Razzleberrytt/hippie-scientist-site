import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf8')

describe('P0 mobile exploration shell', () => {
  it('keeps the persistent mobile chrome focused on a small primary action set', () => {
    const navigation = read('components/Navigation.tsx')

    expect(navigation).toContain("label: 'Explore'")
    expect(navigation).toContain("label: 'Safety'")
    expect(navigation).toContain("label: 'Research'")
    expect(navigation).toContain('Browse all sections')
    expect(navigation).toContain('mobileUtilitySlot')
  })

  it('moves the English language list out of the persistent narrow-phone chrome', () => {
    const localized = read('components/localization/LocalizedNavigation.tsx')

    expect(localized).toContain('mobileUtilitySlot=')
    expect(localized).toContain("locale-switcher-bar hidden")
    expect(localized).toContain('lg:block')
  })

  it('provides a real Explore handoff from Home without making Library the default path', () => {
    const homepage = read('components/homepage-v2.tsx')
    const explore = read('app/explore/page.tsx')

    expect(homepage).toContain("href='/explore/'")
    expect(explore).toContain("href: '/goals/'")
    expect(explore).toContain("href: '/search/'")
    expect(explore).toContain("href: '/safety-checker/'")
    expect(explore).toContain("href: '/research/'")
    expect(explore).toContain("href: '/library/'")
  })
})
