import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const read = (relativePath: string) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')

describe('evidence-literacy methods calibration', () => {
  it('does not use magic participant thresholds or exaggerated sponsorship multipliers', () => {
    const pages = [
      read('app/learn/how-to-read-scientific-studies/page.tsx'),
      read('app/learn/evidence-literacy/page.tsx'),
    ].join('\n')

    expect(pages).not.toMatch(/3-4x more likely/i)
    expect(pages).not.toMatch(/n\s*>\s*80/i)
    expect(pages).not.toMatch(/n\s*<\s*30/i)
    expect(pages).not.toMatch(/prove that an herb/i)
    expect(pages).not.toMatch(/expectation effects dominate/i)
  })

  it('teaches power, effect precision, surrogate validation, and funding scrutiny instead', () => {
    const pages = [
      read('app/learn/how-to-read-scientific-studies/page.tsx'),
      read('app/learn/evidence-literacy/page.tsx'),
    ].join('\n')

    expect(pages).toMatch(/Power depends on the expected effect/i)
    expect(pages).toMatch(/confidence interval/i)
    expect(pages).toMatch(/surrogate/i)
    expect(pages).toMatch(/Funding does not automatically invalidate/i)
    expect(pages).toContain('https://pubmed.ncbi.nlm.nih.gov/30132025/')
    expect(pages).toContain('https://pubmed.ncbi.nlm.nih.gov/37380118/')
  })
})
