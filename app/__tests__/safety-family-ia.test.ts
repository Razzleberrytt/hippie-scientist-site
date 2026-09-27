import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { getActivePrimaryNavigationItem } from '../../lib/primary-navigation'

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')

describe('safety family information architecture', () => {
  it('keeps shared safety navigation across the core flow and guide details', () => {
    expect(read('app/safety-checker/page.tsx')).toContain("SafetyFamilyNav active='checker'")
    expect(read('app/safety-checker/interactions/page.tsx')).toContain("SafetyFamilyNav active='guides'")
    expect(read('app/safety-checker/interactions/[slug]/page.tsx')).toContain("SafetyFamilyNav active='guides' currentPage={null}")
    expect(read('app/learn/interactions/page.tsx')).toContain("SafetyFamilyNav active='learn'")
    expect(read('app/info/supplement-safety-checklist/page.tsx')).toContain("SafetyFamilyNav active='checklist'")
  })

  it('keeps the parent guide visually highlighted without falsely marking it as the exact current detail page', () => {
    const nav = read('components/navigation/SafetyFamilyNav.tsx')
    const detail = read('app/safety-checker/interactions/[slug]/page.tsx')

    expect(nav).toContain("currentPage?: SafetyFamilySurface | null")
    expect(nav).toContain("item.id === exactCurrentPage ? 'page' : undefined")
    expect(detail).toContain("SafetyFamilyNav active='guides' currentPage={null}")
  })

  it('preserves evidence gating and educational boundaries', () => {
    const guides = read('app/safety-checker/interactions/page.tsx')
    const detail = read('app/safety-checker/interactions/[slug]/page.tsx')
    const learn = read('app/learn/interactions/page.tsx')

    expect(guides).toContain('Only editorially approved combinations')
    expect(guides).toContain('dynamic screening results')
    expect(detail).toContain('Educational use only.')
    expect(learn).toContain('A pathway match is not proof of benefit or harm.')
  })

  it('keeps all core Safety routes owned by the Safety primary destination', () => {
    expect(getActivePrimaryNavigationItem('/safety-checker/')?.label).toBe('Safety')
    expect(getActivePrimaryNavigationItem('/safety-checker/interactions/')?.label).toBe('Safety')
    expect(getActivePrimaryNavigationItem('/safety-checker/interactions/example/')?.label).toBe('Safety')
    expect(getActivePrimaryNavigationItem('/learn/interactions/')?.label).toBe('Safety')
    expect(getActivePrimaryNavigationItem('/info/supplement-safety-checklist/')?.label).toBe('Safety')
  })

  it('presents the global Safety menu in check, understand, prepare order', () => {
    const primary = read('lib/primary-navigation.ts')
    expect(primary).toContain("{ section: 'Check', label: 'Safety Checker'")
    expect(primary).toContain("{ section: 'Understand', label: 'Interaction guides'")
    expect(primary).toContain("{ section: 'Prepare', label: 'Supplement safety checklist'")
  })
})
