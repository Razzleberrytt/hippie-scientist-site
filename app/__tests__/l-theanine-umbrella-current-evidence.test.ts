import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const PAGE = path.join(process.cwd(), 'app/guides/herbs/l-theanine/page.tsx')

function source() {
  return fs.readFileSync(PAGE, 'utf8')
}

describe('L-theanine umbrella evidence calibration', () => {
  it('anchors the page to the current systematic reviews and study context', () => {
    const text = source()

    expect(text).toContain('42410082')
    expect(text).toContain('40314930')
    expect(text).toContain('40056718')
    expect(text).toContain('31623400')
    expect(text).toContain('31 randomized trials and 1,168 participants')
    expect(text).toContain('19 articles and 897 participants')
    expect(text).toContain("const DATE = '2026-08-11'")
  })

  it('does not restore stale rapid-anxiety or universal stack claims', () => {
    const text = source()

    expect(text).not.toMatch(/Fastest useful choice/i)
    expect(text).not.toMatch(/fastest-acting natural option/i)
    expect(text).not.toMatch(/Subjective calm and reduced anxiety typically begin/i)
    expect(text).not.toMatch(/L-theanine smooths the jitter/i)
    expect(text).not.toMatch(/2:1 ratio/i)
    expect(text).not.toMatch(/Acute anxiety[\s\S]{0,120}200[–-]400 mg/i)
    expect(text).not.toMatch(/no documented dependency, withdrawal, or tolerance buildup/i)
    expect(text).not.toMatch(/L-theanine is the right tool for tonight/i)
  })

  it('keeps study timing separate from promised subjective onset', () => {
    const text = source()

    expect(text).toMatch(/study timing is not a validated promise/i)
    expect(text).toMatch(/attention outcome, not a reliable anxiety-relief onset/i)
    expect(text).toMatch(/study protocol and an attention result—not a universal anxiety dose/i)
  })

  it('uses specific FDA GRAS context instead of blanket approval language', () => {
    const text = source()

    expect(text).toContain('FDA GRAS Notice 209')
    expect(text).toContain('FDA GRAS Notice 338')
    expect(text).toMatch(/specific L-theanine preparations and specified food uses/i)
    expect(text).toMatch(/not blanket FDA approval/i)
    expect(text).not.toMatch(/FDA GRAS for use in foods/i)
  })

  it('links anxiety readers to the dedicated calibrated guide rather than back to itself', () => {
    const text = source()

    expect(text).toContain('/guides/anxiety/l-theanine-for-anxiety/')
    expect(text).toContain('Read the anxiety-specific review')
    expect(text).not.toMatch(/href="\/guides\/herbs\/l-theanine\/"[^>]*>[\s\S]{0,120}anxiety/i)
  })

  it('keeps caffeine and sleep conclusions appropriately qualified', () => {
    const text = source()

    expect(text).toMatch(/no universal evidence-based ratio/i)
    expect(text).toMatch(/no guaranteed[^\n]{0,20}jitter shield/i)
    expect(text).toMatch(/optimal formulation, dose, and duration remain unresolved/i)
    expect(text).toMatch(/limited evidence using pure L-theanine/i)
  })
})
