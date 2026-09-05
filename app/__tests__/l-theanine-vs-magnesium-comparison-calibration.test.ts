import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const SOURCE = path.join(ROOT, 'content/comparisons/l-theanine-vs-magnesium.md')

function source() {
  return fs.readFileSync(SOURCE, 'utf8')
}

describe('L-theanine vs magnesium sleep comparison calibration', () => {
  it('keeps the current evidence hierarchy and direct-combination uncertainty visible', () => {
    const text = source()

    expect(text).toMatch(/2025 systematic review and meta-analysis.*897 participants/is)
    expect(text).toMatch(/magnesium bisglycinate.*155 adults/is)
    expect(text).toMatch(/Cohen's d = 0\.2/i)
    expect(text).toMatch(/separate positive studies of two ingredients do not establish synergy/i)
    expect(text).toContain('/articles/sleep-interventions-evidence-matrix/')
  })

  it('does not restore universal bedtime protocols or sleep-architecture overclaims', () => {
    const text = source()

    expect(text).not.toMatch(/one of the most evidence-supported natural sleep stacks/i)
    expect(text).not.toMatch(/magnesium handles sleep architecture/i)
    expect(text).not.toMatch(/sleep:\s*200[–-]400mg elemental 30[–-]60 min before bed/i)
    expect(text).not.toMatch(/glycinate form recommended for bioavailability/i)
    expect(text).not.toMatch(/sleep stack \(recommended combination\)/i)
  })

  it('keeps formulation, endpoint, and dosing caveats explicit', () => {
    const text = source()
    const semanticText = text.replace(/\*\*/g, '')

    expect(text).toMatch(/subjective sleep outcomes/i)
    expect(text).toMatch(/objective sleep was not measured/i)
    expect(text).toMatch(/does not prove glycinate is categorically best/i)
    expect(semanticText).toMatch(/not a universal bedtime target/i)
    expect(text).toMatch(/mechanism ≠ magnitude of clinical benefit/i)
  })
})