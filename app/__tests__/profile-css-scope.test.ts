import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf8')

const profileStyles = [
  'herb-profile-polish.css',
  'compact-safety-cautions.css',
]

describe('profile CSS performance scope', () => {
  it('keeps profile-only styles out of the root layout and owned by detail layouts', () => {
    const rootLayout = read('app/layout.tsx')
    const herbLayout = read('app/herbs/[slug]/layout.tsx')
    const compoundLayout = read('app/compounds/[slug]/layout.tsx')

    for (const stylesheet of profileStyles) {
      expect(rootLayout).not.toContain(stylesheet)
      expect(herbLayout).toContain(stylesheet)
      expect(compoundLayout).toContain(stylesheet)
    }

    expect(rootLayout).not.toContain('profile-navigation-cleanup.css')
    expect(herbLayout).not.toContain('profile-navigation-cleanup.css')
    expect(compoundLayout).not.toContain('profile-navigation-cleanup.css')
    expect(herbLayout).toContain('data-profile-page')
    expect(compoundLayout).toContain('data-profile-page="compound"')
    expect(compoundLayout).toContain('usesMdxTemplate ? children')
  })

  it('does not rediscover profile routes with large-DOM relational selectors', () => {
    const polish = read('styles/herb-profile-polish.css')
    const editorial = read('styles/editorial-content-surfaces.css')
    const renderingPerformance = read('styles/profile-rendering-performance.css')

    expect(polish).not.toContain('main:has(')
    expect(editorial).not.toContain('main:has(nav[aria-label="Page sections"])')
    expect(renderingPerformance).not.toContain(':has(')

    expect(polish).toContain('[data-profile-page]')
    expect(editorial).toContain('[data-profile-page]')
    expect(renderingPerformance).toContain("[data-profile-page='compound'] .flex.gap-8.items-start")
  })

  it('does not ship the hidden legacy jump-navigation tree beside ProfileTOC', () => {
    const herbPage = read('app/herbs/[slug]/page.tsx')
    const compoundPage = read('app/compounds/[slug]/page.tsx')

    for (const page of [herbPage, compoundPage]) {
      expect(page).toContain('ProfileTOC')
      expect(page).not.toContain('Jump to profile sections')
    }

    expect(fs.existsSync(path.join(root, 'styles/profile-navigation-cleanup.css'))).toBe(false)
  })

  it('uses an explicit compare-route boundary instead of root-loaded main:has discovery', () => {
    const compareLayout = read('app/guides/compare/layout.tsx')
    const editorial = read('styles/editorial-content-surfaces.css')

    expect(compareLayout).toContain('<CompareHubAnalytics />')
    expect(compareLayout).toContain('data-compare-page')
    expect(editorial).not.toContain('main:has(#compare-decision)')
    expect(editorial).not.toContain('main:has(')
    expect(editorial).toContain('[data-compare-page]')
  })
})
