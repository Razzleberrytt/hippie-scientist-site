import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const readGuide = () => fs
  .readFileSync(path.join(process.cwd(), 'app/guides/other/supplement-stacking-safety/page.tsx'), 'utf8')
  .replace(/\s+/g, ' ')

describe('supplement combination safety guide', () => {
  it('does not present a fixed waiting period as a general stacking protocol', () => {
    const page = readGuide()

    expect(page).toMatch(/no universal one-week, two-week, or four-week rule/i)
    expect(page).not.toMatch(/assess for 1-2 weeks, then add the next/i)
    expect(page).not.toMatch(/assess for 2-4 weeks before adding another/i)
  })

  it('does not label an adaptogen combination broadly safe', () => {
    const page = readGuide()

    expect(page).toMatch(/not enough direct combination evidence to label adaptogen stacks broadly safe/i)
    expect(page).not.toMatch(/ashwagandha \+ rhodiola.*generally safe/i)
    expect(page).not.toMatch(/adaptogen stacking.*generally safe/i)
  })

  it('distinguishes documented interactions from mechanism-only screening signals', () => {
    const page = readGuide()

    expect(page).toMatch(/mechanism alone does not prove the magnitude of a specific pairwise interaction/i)
    expect(page).toMatch(/documented clinical interaction should be labeled differently from a plausible additive mechanism/i)
    expect(page).toMatch(/No interaction listed ≠ interaction ruled out/i)
  })
})
