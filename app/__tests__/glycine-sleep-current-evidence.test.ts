import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const readGuide = () => fs
  .readFileSync(path.join(process.cwd(), 'app/guides/sleep/glycine-for-sleep/page.tsx'), 'utf8')
  .replace(/\s+/g, ' ')

describe('glycine sleep current-evidence boundaries', () => {
  it('anchors the September 2026 evidence map to the current scoping review', () => {
    const page = readGuide()

    expect(page).toContain("pmid: '42687500'")
    expect(page).toContain('10.1080/19390211.2026.2726197')
    expect(page).toContain('Last evidence review September 19, 2026')
    expect(page).toMatch(/three supplemental-glycine sleep trials/i)
  })

  it('keeps the small positive signal separate from a mature efficacy claim', () => {
    const page = readGuide()

    expect(page).toMatch(/all three reported benefit on at least one sleep-related outcome/i)
    expect(page).toMatch(/not a new large glycine-alone trial program/i)
    expect(page).toMatch(/interesting, preliminary, and worth separating from hype/i)
  })

  it('does not inherit collagen-peptide outcomes as isolated-glycine evidence', () => {
    const page = readGuide()

    expect(page).toMatch(/collagen and collagen-peptide studies/i)
    expect(page).toMatch(/cannot be reassigned to isolated glycine because glycine mediation was not directly tested/i)
    expect(page).toMatch(/collagen-peptide outcomes cannot be attributed to glycine without direct mediation evidence/i)
  })

  it('preserves the research-dose and insomnia-treatment boundaries', () => {
    const page = readGuide()

    expect(page).toMatch(/3 g a recognizable research dose/i)
    expect(page).toMatch(/not a validated minimum, maximum, optimal dose, or personalized prescription/i)
    expect(page).toMatch(/Glycine is not an established treatment for chronic insomnia/i)
    expect(page).not.toMatch(/recommended dose is 3 g/i)
  })
})
