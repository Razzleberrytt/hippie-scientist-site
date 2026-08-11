import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const source = fs.readFileSync(
  path.join(process.cwd(), 'app/guides/sleep/best-natural-sleep-aids-that-work/page.tsx'),
  'utf8',
)

describe('natural sleep aids evidence discipline', () => {
  it('does not promise a universal L-theanine onset or established supplement stacks', () => {
    expect(source).not.toContain('L-theanine work within 30–60 minutes')
    expect(source).not.toContain('Some combinations are well established')
    expect(source).toContain('Do not promise a 30–60 minute L-theanine onset')
    expect(source).toContain('Combination evidence is product-specific')
  })

  it('anchors L-theanine sleep claims to the current meta-analysis', () => {
    expect(source).toContain('https://pubmed.ncbi.nlm.nih.gov/40056718/')
    expect(source).toContain('small improvements')
    expect(source).toContain('pure L-theanine')
    expect(source).toContain('dose and duration')
  })

  it('keeps magnesium and valerian certainty aligned to higher-level evidence', () => {
    expect(source).toContain('https://pubmed.ncbi.nlm.nih.gov/33865376/')
    expect(source).toContain('low to very low')
    expect(source).toContain('https://pubmed.ncbi.nlm.nih.gov/38359657/')
    expect(source).toContain('no demonstrated efficacy for treating insomnia')
  })

  it('marks the evidence update in structured data and visible copy', () => {
    expect(source).toContain('dateModified="2026-08-11"')
    expect(source).toContain('Last updated August 2026')
  })
})
