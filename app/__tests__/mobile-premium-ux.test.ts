import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function source(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('mobile premium UX regression contract', () => {
  it('keeps the flagship homepage compact, useful, restrained, and visually consistent on mobile', () => {
    const text = source('components/homepage-v2.tsx')
    const page = source('app/page.tsx')
    const scrollTop = source('components/ScrollToTopButton.tsx')
    const footer = source('components/Footer.tsx')
    const visual = source('styles/homepage-mobile-refinement.css')

    expect(text).toContain("className='hs-home'")
    expect(text).toContain("className='hero-shell rounded-[2rem] border px-5 py-7 sm:p-10'")
    expect(text).toContain("href='/explore/'")
    expect(text).not.toContain('<SiteDestinationGrid />')
    expect(text).toContain("placeholder='Search herbs, compounds, or questions'")
    expect(text).toContain("autoCapitalize='none'")
    expect(text).toContain("autoCorrect='off'")
    expect(text).toContain('spellCheck={false}')
    expect(text).toContain("className='grid grid-cols-3 gap-2 sm:gap-3'")
    expect(text).toContain("className='min-w-0 rounded-xl bg-brand-50/60 p-3 text-center sm:p-4'")
    expect(text).not.toContain('const comparisons')
    expect(text).not.toContain('const principles')

    expect(page).toContain("import '@/styles/homepage-mobile-refinement.css'")

    // Repeated/floating global chrome stays available elsewhere but is suppressed on the phone homepage.
    expect(scrollTop).toContain("data-scroll-to-top-button='true'")
    expect(footer).toContain("data-footer-new-here='true'")
    expect(visual).toContain("body:has(.hs-home) [data-scroll-to-top-button='true'],")
    expect(visual).toContain("body:has(.hs-home) [data-footer-new-here='true'] {\n    display: none;")
  })

  it('keeps the privacy choice visible without covering page actions', () => {
    const banner = source('components/ConsentBanner.tsx')
    const layout = source('app/layout.tsx')
    const headerEnd = layout.indexOf('</header>')
    const consentMount = layout.indexOf('<ConsentBanner />')
    const mainStart = layout.indexOf('<main')

    expect(banner).toContain("data-consent-banner='true'")
    expect(banner).toContain('useState(true)')
    expect(banner).toContain('min-h-5')
    expect(banner).toContain("className='relative z-[100]")
    expect(layout).toContain("localStorage.getItem('consent.v1')")
    expect(layout).toContain("data-consent-pending='false'")
    expect(banner).not.toContain("className='fixed ")
    expect(headerEnd).toBeGreaterThan(-1)
    expect(consentMount).toBeGreaterThan(headerEnd)
    expect(mainStart).toBeGreaterThan(consentMount)
    expect(layout.lastIndexOf('<ConsentBanner />')).toBe(consentMount)
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
