import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function source(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('mobile premium UX regression contract', () => {
  it('keeps the flagship homepage compact, useful, and restrained on mobile', () => {
    const text = source('components/homepage-v2.tsx')
    const structure = source('styles/homepage-structure.css')
    const visual = source('styles/homepage-mobile-refinement.css')
    const page = source('app/page.tsx')

    expect(text).toContain("className='hs-hero-main'")
    expect(text).toContain("className='hs-evidence-panel'")
    expect(text).toContain("className='hs-home-browse-link hs-hero-primary-link'")
    expect(text).toContain("className='hs-goal-nav'")
    expect(text).toContain("placeholder='Search herbs, compounds, or questions'")
    expect(page).toContain("import '@/styles/homepage-mobile-refinement.css'")
    expect(structure).toContain('@media (max-width: 767px)')
    expect(structure).toContain('display: contents;')
    expect(structure).toContain('order: 2;')
    expect(structure).toContain('order: 3;')
    expect(structure).toContain('grid-template-columns: repeat(2, minmax(0, 1fr))')
    expect(visual).toContain('font-size: clamp(2.25rem, 10.2vw, 2.72rem);')
    expect(visual).toContain('.hs-home-title em::after')
    expect(visual).toContain('background: transparent;')
    expect(visual).toContain('min-width: 2.75rem;')
    expect(visual).toContain('min-height: 2.75rem;')
  })

  it('renders shared comparison data as option-first cards on phones', () => {
    const text = source('components/ComparisonTable.tsx')
    const cardsIndex = text.indexOf('data-mobile-comparison-cards="true"')
    const optionMapIndex = text.indexOf('valueHeaders.map', cardsIndex)
    const attributeMapIndex = text.indexOf('normalizedRows.map', optionMapIndex)

    expect(cardsIndex).toBeGreaterThan(-1)
    expect(optionMapIndex).toBeGreaterThan(cardsIndex)
    expect(attributeMapIndex).toBeGreaterThan(optionMapIndex)
    expect(text).toContain('className="hidden sm:block"')
  })

  it('keeps the interactive compare center card-first on phones', () => {
    const text = source('components/compare-table-client.tsx')
    const cardsIndex = text.indexOf('data-mobile-compare-center="true"')
    const desktopMatrixIndex = text.indexOf('<ResponsiveTable', cardsIndex)

    expect(cardsIndex).toBeGreaterThan(-1)
    expect(desktopMatrixIndex).toBeGreaterThan(cardsIndex)
    expect(text).toContain('className="grid gap-3 md:hidden"')
    expect(text).toContain('className="hidden rounded-[1.65rem] bg-white md:block')
  })

  it('renders goal evidence summaries as readable cards before the desktop table', () => {
    const text = source('components/goals/GoalContentDepth.tsx')
    const cardsIndex = text.indexOf("data-mobile-goal-evidence='true'")
    const desktopTableIndex = text.indexOf("className='mt-6 hidden overflow-x-auto sm:block'", cardsIndex)

    expect(cardsIndex).toBeGreaterThan(-1)
    expect(desktopTableIndex).toBeGreaterThan(cardsIndex)
  })

  it('keeps essential safety notes visible instead of requiring a horizontal swipe', () => {
    const text = source('components/SafetyBox.tsx')

    expect(text).toContain('data-mobile-safety-stack')
    expect(text).toContain("'grid gap-3 sm:grid-cols-2'")
    expect(text).not.toContain('Swipe or scroll sideways')
    expect(text).not.toContain('snap-mandatory')
  })

  it('keeps the shared scientific verdict answer-first', () => {
    const text = source('components/editorial/ScientificVerdictCard.tsx')
    const bottomLineIndex = text.indexOf('data-mobile-answer-first="true"')
    const bestForIndex = text.indexOf('Best for')

    expect(bottomLineIndex).toBeGreaterThan(-1)
    expect(bestForIndex).toBeGreaterThan(-1)
    expect(bottomLineIndex).toBeLessThan(bestForIndex)
  })

  it('keeps high-signal profile anchors one tap away on mobile', () => {
    const text = source('components/ui/ProfileTOC.tsx')

    expect(text).toContain('getQuickTocItems')
    expect(text).toContain("/evidence/i")
    expect(text).toContain("/safety|interaction/i")
    expect(text).toContain("data-mobile-quick-jumps='true'")
    expect(text).toContain("top-[4.35rem]")
  })

  it('keeps long-form mobile rhythm compact without shrinking body copy', () => {
    const text = source('styles/foundation-readability.css')

    expect(text).toContain('font-size: clamp(2.05rem, 10.5vw, 2.85rem);')
    expect(text).toContain('.content-prose h2 {')
    expect(text).toContain('margin-top: 2.1rem;')
    expect(text).toContain('.section-spacing,')
    expect(text).toContain('row-gap: 2rem;')
  })
})
