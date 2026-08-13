import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const read = (relativePath: string) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')

describe('evidence-literacy methods calibration', () => {
  it('does not use magic participant thresholds or exaggerated sponsorship multipliers', () => {
    const pages = [
      read('app/learn/how-to-read-scientific-studies/page.tsx'),
      read('app/learn/evidence-literacy/page.tsx'),
      read('app/info/methodology/page.tsx'),
    ].join('\n')

    expect(pages).not.toMatch(/3-4x more likely/i)
    expect(pages).not.toMatch(/n\s*>\s*80/i)
    expect(pages).not.toMatch(/n\s*<\s*30/i)
    expect(pages).not.toMatch(/prove that an herb/i)
    expect(pages).not.toMatch(/expectation effects dominate/i)
    expect(pages).not.toMatch(/statistically significant positive outcomes/i)
    expect(pages).not.toMatch(/depending on individual neurochemistry/i)
    expect(pages).not.toMatch(/required to replicate clinical results/i)
  })

  it('teaches power, effect precision, surrogate validation, and funding scrutiny instead', () => {
    const pages = [
      read('app/learn/how-to-read-scientific-studies/page.tsx'),
      read('app/learn/evidence-literacy/page.tsx'),
      read('app/info/methodology/page.tsx'),
    ].join('\n')

    expect(pages).toMatch(/Power depends on the expected effect/i)
    expect(pages).toMatch(/confidence interval/i)
    expect(pages).toMatch(/surrogate/i)
    expect(pages).toMatch(/Funding does not automatically invalidate/i)
    expect(pages).toMatch(/Statistical significance alone is not enough/i)
    expect(pages).toContain('https://pubmed.ncbi.nlm.nih.gov/30132025/')
    expect(pages).toContain('https://pubmed.ncbi.nlm.nih.gov/37380118/')
    expect(pages).toContain('https://pubmed.ncbi.nlm.nih.gov/20352064/')
  })

  it('keeps authorship and automated-validation limits explicit on methodology', () => {
    const methodology = read('app/info/methodology/page.tsx')

    expect(methodology).toContain('Willie B. Randolph III')
    expect(methodology).toContain('Founder and independent author')
    expect(methodology).toContain('does not substitute for clinician judgment or independent medical review')
    expect(methodology).not.toMatch(/collective of neurochemistry researchers/i)
  })
})
