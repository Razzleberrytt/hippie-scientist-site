import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf8')

/* Route-scoped profile composition. The shared vocabulary it composes from
   (editorial-primitives.css) is deliberately root-loaded instead, because
   every template uses it. */
const profileStyles = ['herb-profile-polish.css']

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
    const primitives = read('styles/editorial-primitives.css')
    const editorial = read('styles/editorial-content-surfaces.css')

    expect(polish).not.toContain('main:has(')
    expect(primitives).not.toContain('main:has(')
    expect(editorial).not.toContain('main:has(nav[aria-label="Page sections"])')

    expect(polish).toContain('[data-profile-page]')
    expect(editorial).toContain('[data-profile-page]')
  })

  it('root-loads the shared primitives the profile layer composes from', () => {
    const rootLayout = read('app/layout.tsx')

    expect(rootLayout).toContain('editorial-primitives.css')
    // Profile layouts must not load it a second time.
    expect(read('app/herbs/[slug]/layout.tsx')).not.toContain('editorial-primitives.css')
    expect(read('app/compounds/[slug]/layout.tsx')).not.toContain('editorial-primitives.css')
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
