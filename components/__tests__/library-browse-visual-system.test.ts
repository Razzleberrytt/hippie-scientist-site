import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')

const herbsPage = read('app/herbs/page.tsx')
const compoundsPage = read('app/compounds/page.tsx')
const decisionPrimitives = read('components/ui/DecisionPrimitives.tsx')
const pagination = read('components/Pagination.tsx')
const libraryBrowse = read('styles/library-browse.css')

describe('library browse visual-system contracts', () => {
  it('scopes the browse refinement to the two primary library indexes', () => {
    expect(herbsPage).toContain("import '../../styles/library-browse.css'")
    expect(compoundsPage).toContain("import '../../styles/library-browse.css'")
    expect(herbsPage).toContain('library-browse-page')
    expect(compoundsPage).toContain('library-browse-page')
    expect(libraryBrowse).toContain('.library-browse-page')
  })

  it('uses canonical material primitives for server loading and no-script states', () => {
    for (const page of [herbsPage, compoundsPage]) {
      expect(page).toContain('section-frame h-32 animate-pulse')
      expect(page).toContain('card-premium h-36 animate-pulse')
      expect(page).toContain('section-frame p-4 sm:p-5')
      expect(page).toContain('card-premium block p-4')
      expect(page).not.toContain('bg-white/')
      expect(page).not.toContain('shadow-sm')
    }
  })

  it('keeps shared decision cards, filters, and empty states on canonical owners', () => {
    expect(decisionPrimitives).toContain('section-frame p-5 sm:p-6')
    expect(decisionPrimitives).toContain('surface-subtle group mt-3')
    expect(decisionPrimitives).toContain('chip-readable inline-flex min-h-11')
    expect(decisionPrimitives).toContain('card-premium group flex h-full')
    expect(decisionPrimitives).toContain('Open profile')
    expect(decisionPrimitives).toContain('aria-current=')
  })

  it('keeps pagination in the same editorial material language', () => {
    expect(pagination).toContain("const linkClass = 'chip-readable")
    expect(pagination).toContain('className="section-frame flex flex-col')
    expect(pagination).not.toContain('shadow-sm')
  })

  it('normalizes only neutral legacy library recipes and leaves semantic tones alone', () => {
    expect(libraryBrowse).toContain("[class*='bg-white/']")
    expect(libraryBrowse).toContain("[class*='border-brand-900/10']")
    expect(libraryBrowse).toContain("html.dark .library-browse-page .bg-brand-50")
    expect(libraryBrowse).not.toContain('emerald-')
    expect(libraryBrowse).not.toContain('rose-')
    expect(libraryBrowse).not.toContain('amber-')
    expect(libraryBrowse).not.toContain('blue-')
  })

  it('preserves reduced-motion behavior for browse loading states', () => {
    expect(libraryBrowse).toContain('@media (prefers-reduced-motion: reduce)')
    expect(libraryBrowse).toContain('animation: none')
  })
})
