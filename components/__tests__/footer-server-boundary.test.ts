import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf8')

describe('shared footer hydration boundary', () => {
  it('keeps the static footer shell server-first', () => {
    const footer = read('components/Footer.tsx')

    expect(footer).not.toMatch(/^['"]use client['"]/)
    expect(footer).toContain("import Link from 'next/link'")
    expect(footer).not.toContain('router-compat')
    expect(footer).not.toContain('useState')
    expect(footer).not.toContain('useEffect')
    expect(footer).not.toContain("import ConsentManager")
    expect(footer).toContain('FooterConsentControls')
    expect(footer).toContain('isAnalyticsRouteEnabled()')
  })

  it('keeps footer discovery aligned with the canonical navigation hierarchy', () => {
    const footer = read('components/Footer.tsx')

    expect(footer).toContain("{ href: PUBLIC_ROUTES.guides, label: 'Guides' }")
    expect(footer).toContain("{ href: PUBLIC_ROUTES.research, label: 'Research' }")
    expect(footer).not.toContain("{ href: '/guides/compare/', label: 'Compare' }")
    expect(footer).not.toContain('Turmeric vs Curcumin')
    expect(footer).not.toContain('Research trends')
    expect(footer).not.toContain("{ href: PUBLIC_ROUTES.articles, label: 'Research' }")
  })

  it('isolates privacy interaction and lazy dialog loading in the small client island', () => {
    const controls = read('components/FooterConsentControls.tsx')

    expect(controls).toMatch(/^['"]use client['"]/)
    expect(controls).toContain("lazy(() => import('./ConsentManager'))")
    expect(controls).toContain('onOpenConsent')
    expect(controls).toContain("Privacy settings")
    expect(controls).toContain('open ? (')
  })
})
