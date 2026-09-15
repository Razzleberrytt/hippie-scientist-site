import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function source(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('mobile premium UX regression contract', () => {
  it('keeps the homepage first screen intentionally compact on mobile', () => {
    const text = source('components/homepage-v2.tsx')

    expect(text).toContain('max-md:!text-[clamp(2.55rem,11vw,3.4rem)]')
    expect(text).toContain('hs-home-browse-link max-md:hidden')
    expect(text).toContain('max-md:!min-h-[4.35rem]')
    expect(text).toContain('max-md:[&_dd]:!text-[1.35rem]')
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
})
