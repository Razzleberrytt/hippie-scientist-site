import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const article = fs.readFileSync(path.join(process.cwd(), 'content', 'articles', 'valerian-root.md'), 'utf8')

describe('valerian citation-winner evidence boundaries', () => {
  it('preserves the citation-winning route identity and class-wide verdict', () => {
    expect(article).toContain('slug: valerian-root')
    expect(article).toContain('title: "Valerian Root for Sleep: Does It Work? Evidence Review (2026)"')
    expect(article).toContain('Valerian root is **not an established treatment for insomnia**')
    expect(article).toContain('low confidence in a class-wide insomnia effect')
  })

  it('keeps the 2025 valerian-hops feasibility study combination-specific', () => {
    expect(article).toContain('pmid: "40462685"')
    expect(article).toContain('a valerian–hops feasibility trial does not answer the valerian-alone question')
    expect(article).toContain('should **not** be counted as a positive valerian-monotherapy trial')
    expect(article).toContain('**Fitbit-derived sleep-duration estimates**')
    expect(article).toContain('did **not** differ significantly between groups')
    expect(article).toContain('wearable-derived rather than a polysomnographic endpoint')
    expect(article).toContain('the daytime cognitive/psychological domains were null')
    expect(article).toContain('does not change the class-wide valerian verdict')
    expect(article).toContain('does not change the monotherapy evidence grade')
  })

  it('preserves current safety uncertainty without converting rare reports into a class-wide warning', () => {
    expect(article).toContain('**long-term safety is unknown**')
    expect(article).toContain('very rare liver-injury reports—most often involving multi-herb products')
    expect(article).toContain('causality and valerian-specific risk are difficult to isolate')
    expect(article).toContain('Pregnancy and breastfeeding safety data are limited')
    expect(article).toContain('apply to regulated valerian-root medicines assessed under the EU monograph')
  })

  it('does not turn trial doses or combination results into universal consumer instructions', () => {
    expect(article).toContain('No universal dose is supported across products')
    expect(article).toContain('not the kind that justifies a universal “take X mg before bed” rule')
    expect(article).not.toMatch(/take 300.{0,20}600 mg.{0,40}(night|bed|sleep)/i)
  })
})
