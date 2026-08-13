import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const readArticle = () => fs
  .readFileSync(path.join(process.cwd(), 'content/articles/magnesium-l-theanine-sleep-stack.md'), 'utf8')
  .replace(/\s+/g, ' ')

describe('magnesium + L-theanine combination evidence boundary', () => {
  it('does not present the pair as an evidence-based bedtime recipe', () => {
    const article = readArticle()

    expect(article).toMatch(/does not establish the two-ingredient combination as an evidence-based sleep stack/i)
    expect(article).not.toMatch(/Together: 200–400 mg magnesium glycinate \+ 200 mg L-theanine/i)
    expect(article).not.toMatch(/How to Take This Stack/i)
    expect(article).not.toMatch(/30–60 minutes before bed for sleep support/i)
  })

  it('removes fabricated synergy and timeline claims', () => {
    const article = readArticle()

    expect(article).toMatch(/Different Mechanisms.*Does Not Prove Synergy/i)
    expect(article).toMatch(/Mechanistic complementarity is a hypothesis/i)
    expect(article).not.toMatch(/Why they pair perfectly/i)
    expect(article).not.toMatch(/Night 1.*Easier to wind down/i)
    expect(article).not.toMatch(/Week 2–4.*Sleep consolidates/i)
  })

  it('downgrades the combination evidence while preserving ingredient-specific evidence', () => {
    const article = readArticle()

    expect(article).toMatch(/evidence_grade: Limited/i)
    expect(article).toMatch(/2025 systematic review and meta-analysis/i)
    expect(article).toMatch(/effect was \*\*small\*\*/i)
    expect(article).toMatch(/combination question has not been answered directly/i)
  })
})
