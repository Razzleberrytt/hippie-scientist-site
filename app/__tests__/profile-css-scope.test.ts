import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf8')

const profileStyles = [
  'herb-profile-polish.css',
  'profile-navigation-cleanup.css',
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

    expect(herbLayout).toContain('data-profile-page')
    expect(compoundLayout).toContain('data-profile-page')
    expect(compoundLayout).toContain('usesMdxTemplate ? children')
  })

  it('does not rediscover profile routes with large-DOM main:has selectors', () => {
    const polish = read('styles/herb-profile-polish.css')
    const navigation = read('styles/profile-navigation-cleanup.css')
    const editorial = read('styles/editorial-content-surfaces.css')

    expect(polish).not.toContain('main:has(')
    expect(navigation).not.toContain('main:has(')
    expect(editorial).not.toContain('main:has(nav[aria-label="Page sections"])')

    expect(polish).toContain('[data-profile-page]')
    expect(navigation).toContain('[data-profile-page]')
    expect(editorial).toContain('[data-profile-page]')

    // Compare-page route discovery is a separate contract and intentionally
    // stays out of this profile-specific atomic change.
    expect(editorial).toContain('main:has(#compare-decision)')
  })
})
