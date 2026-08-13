import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const read = (relativePath: string) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')

const METHOD_PAGES = [
  'app/learn/how-to-read-scientific-studies/page.tsx',
  'app/learn/evidence-literacy/page.tsx',
  'app/info/methodology/page.tsx',
  'app/learn/evidence-hierarchy/page.tsx',
  'app/learn/study-design-snapshot/page.tsx',
]

const readMethodPages = () => METHOD_PAGES.map(read).join('\n')

describe('evidence-literacy methods calibration', () => {
  it('does not use magic thresholds, exaggerated multipliers, or categorical evidence-grade claims', () => {
    const pages = readMethodPages()

    expect(pages).not.toMatch(/3-4x more likely/i)
    expect(pages).not.toMatch(/n\s*>\s*80/i)
    expect(pages).not.toMatch(/n\s*<\s*30/i)
    expect(pages).not.toMatch(/prove that an herb/i)
    expect(pages).not.toMatch(/expectation effects dominate/i)
    expect(pages).not.toMatch(/statistically significant positive outcomes/i)
    expect(pages).not.toMatch(/depending on individual neurochemistry/i)
    expect(pages).not.toMatch(/required to replicate clinical results/i)
    expect(pages).not.toMatch(/the effect is real and replicated/i)
    expect(pages).not.toMatch(/you can act on it with reasonable confidence/i)
  })

  it('teaches power, effect precision, surrogate validation, and funding scrutiny instead', () => {
    const pages = readMethodPages()

    expect(pages).toMatch(/Power depends on the expected effect/i)
    expect(pages).toMatch(/confidence interval/i)
    expect(pages).toMatch(/surrogate/i)
    expect(pages).toMatch(/Funding does not automatically invalidate/i)
    expect(pages).toMatch(/Statistical significance alone is not enough/i)
    expect(pages).toContain('https://pubmed.ncbi.nlm.nih.gov/30132025/')
    expect(pages).toContain('https://pubmed.ncbi.nlm.nih.gov/37380118/')
    expect(pages).toContain('https://pubmed.ncbi.nlm.nih.gov/20352064/')
  })

  it('treats evidence hierarchies and strong grades as confidence frameworks rather than truth ladders', () => {
    const hierarchy = read('app/learn/evidence-hierarchy/page.tsx')
    const snapshot = read('app/learn/study-design-snapshot/page.tsx')

    expect(hierarchy).toContain('They are not automatic rankings of truth')
    expect(hierarchy).toContain('Different designs can be strongest for different questions')
    expect(snapshot).toContain('it does not make the effect certain, universal, large, or automatically relevant to every product')
    expect(snapshot).toContain('A grade should make the evidence easier to inspect, not replace that inspection')
  })

  it('keeps authorship and automated-validation limits explicit on methodology', () => {
    const methodology = read('app/info/methodology/page.tsx')

    expect(methodology).toContain('Willie B. Randolph III')
    expect(methodology).toContain('Founder and independent author')
    expect(methodology).toContain('does not substitute for clinician judgment or independent medical review')
    expect(methodology).not.toMatch(/collective of neurochemistry researchers/i)
  })
})
