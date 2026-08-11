import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const PAGE = path.join(process.cwd(), 'app/guides/anxiety/natural-anxiety-relief/page.tsx')

function source() {
  return fs.readFileSync(PAGE, 'utf8').replace(/\s+/g, ' ')
}

describe('natural anxiety relief evidence framing', () => {
  it('anchors the page to current human evidence and government safety sources', () => {
    const page = source()

    expect(page).toContain('39348746')
    expect(page).toContain('32021735')
    expect(page).toContain('42410082')
    expect(page).toContain('38817505')
    expect(page).toContain('9861593')
    expect(page).toContain('18499602')
    expect(page).toContain('31813230')
    expect(page).toContain('nccih.nih.gov/health/passionflower')
    expect(page).toContain('nccih.nih.gov/health/kava')
  })

  it('states the populations, comparators, preparations, and durations behind the evidence summaries', () => {
    const page = source()

    expect(page).toContain('nine randomized trials and 558 participants')
    expect(page).toContain('60 otherwise healthy adults')
    expect(page).toContain('125 mg or 300 mg ashwagandha root extract twice daily with placebo')
    expect(page).toContain('8-week placebo-controlled trial')

    expect(page).toContain('31 randomized trials and 1,168 participants')
    expect(page).toContain('healthy and clinical populations')
    expect(page).toContain('400 mg/day for 8 weeks')

    expect(page).toContain('38 women')
    expect(page).toContain('200 mg magnesium as magnesium oxide with placebo')
    expect(page).toContain('two menstrual cycles')

    expect(page).toContain('60 ambulatory-surgery patients')
    expect(page).toContain('500 mg oral Passiflora incarnata or placebo')
    expect(page).toContain('90 minutes before surgery')

    expect(page).toContain('171 currently non-medicated adults')
    expect(page).toContain('generalized anxiety disorder')
    expect(page).toContain('120 mg kavalactones twice daily with placebo')
    expect(page).toContain('16 weeks')
  })

  it('does not retain the old fastest/best L-theanine treatment claims', () => {
    const page = source()

    expect(page).not.toMatch(/fastest useful choice/i)
    expect(page).not.toMatch(/effects typically within 30[–-]60 minutes/i)
    expect(page).not.toMatch(/fastest-acting option/i)
    expect(page).not.toMatch(/stacks cleanly/i)
    expect(page).not.toMatch(/best for racing thoughts/i)
    expect(page).toMatch(/anxiety (?:findings|effects) (?:were|remained) inconsistent/i)
  })

  it('removes the placeholder bibliography and keeps a real evidence trail', () => {
    const page = source()

    expect(page).not.toContain('References being compiled')
    expect(page).toContain('Sources used for this update')
    expect(page).toContain('Primary evidence trail')
  })

  it('keeps monetization framed as sourcing rather than treatment selection', () => {
    const page = source()

    expect(page).toContain('Product links are sourcing examples, not evidence that a product will treat anxiety')
    expect(page).toContain('Ashwagandha sourcing examples')
    expect(page).toContain('L-theanine sourcing examples')
    expect(page).toContain('These are not treatment recommendations')
  })
})
