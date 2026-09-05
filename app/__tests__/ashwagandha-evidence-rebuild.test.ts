import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const SOURCE = path.join(ROOT, 'content/articles/ashwagandha.md')

function source() {
  return fs.readFileSync(SOURCE, 'utf8')
}

describe('ashwagandha evidence rebuild', () => {
  it('uses current meta-analytic sleep, stress, and safety evidence', () => {
    const text = source()

    expect(text).toMatch(/2026 systematic review and dose-response meta-analysis included 22 randomized trials/i)
    expect(text).toMatch(/five randomized trials and 400 participants/i)
    expect(text).toMatch(/25 patients across 13 publications/i)
    expect(text).toMatch(/may be safe for short-term use, up to about three months/i)
    expect(text).toContain('/articles/sleep-interventions-evidence-matrix/')
  })

  it('does not restore universal protocol, stack, architecture, or cycling claims', () => {
    const text = source()

    expect(text).not.toMatch(/### Proven and Commonly Used Stacks/i)
    expect(text).not.toMatch(/Ash 300[–-]600 mg PM \/ Mg 200[–-]400 mg PM/i)
    expect(text).not.toMatch(/covers the full circadian stress cycle/i)
    expect(text).not.toMatch(/sleep consolidates into deeper, more restorative architecture/i)
    expect(text).not.toMatch(/take 300[–-]600 mg with dinner or 60[–-]90 minutes before bed/i)
    expect(text).not.toMatch(/6[–-]8 weeks on, 2[–-]4 weeks off to prevent diminishing returns/i)
    expect(text).not.toMatch(/affinity comparable to low-dose benzodiazepines/i)
  })

  it('keeps formulation, mechanism, dose, and combination boundaries explicit', () => {
    const text = source()
    const semanticText = text.replace(/\*\*/g, '')

    expect(semanticText).toMatch(/study context, not a personal instruction/i)
    expect(text).toMatch(/formulation equivalence has to be demonstrated, not assumed/i)
    expect(text).toMatch(/separate ingredient evidence does not transfer automatically to the stack/i)
    expect(text).toMatch(/mechanism language is one of the easiest places to overstate supplements/i)
    expect(text).toMatch(/controlled evidence has not established that practice/i)
  })
})