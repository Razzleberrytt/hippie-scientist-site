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

  it('does not rediscover profile routes with the large-DOM main:has selector', () => {
    const polish = read('styles/herb-profile-polish.css')
    const navigation = read('styles/profile-navigation-cleanup.css')

    expect(polish).not.toContain('main:has(')
    expect(navigation).not.toContain('main:has(')
    expect(polish).toContain('[data-profile-page]')
    expect(navigation).toContain('[data-profile-page]')
  })
})
