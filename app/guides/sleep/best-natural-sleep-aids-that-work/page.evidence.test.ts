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
    expect(source).toMatch(/not enough to promise a universal bedtime dose/i)
    expect(source).toMatch(/guaranteed 30-minute onset/i)
    expect(source).toMatch(/Multi-ingredient trials test a specific formula/i)
    expect(source).toMatch(/cannot establish that every ingredient pair is synergistic/i)
  })

  it('anchors L-theanine sleep claims to current reviews and gives study context', () => {
    expect(source).toContain('https://pubmed.ncbi.nlm.nih.gov/40056718/')
    expect(source).toContain('https://pubmed.ncbi.nlm.nih.gov/41176609/')
    expect(source).toMatch(/19 articles and 897 participants/i)
    expect(source).toMatch(/13 standalone L-theanine trials \(550 participants\)/i)
    expect(source).toMatch(/dose, duration and efficacy in clinical insomnia\s+remain unsettled/i)
    expect(source).toMatch(/clinical-insomnia evidence remains limited/i)
  })

  it('keeps magnesium and valerian certainty aligned to higher-level evidence', () => {
    expect(source).toContain('https://pubmed.ncbi.nlm.nih.gov/33865376/')
    expect(source).toContain('low to very low')
    expect(source).toContain('https://pubmed.ncbi.nlm.nih.gov/38359657/')
    expect(source).toContain('no demonstrated efficacy for treating insomnia')
  })

  it('retains the explicit passionflower pregnancy warning', () => {
    expect(source).toContain('https://www.nccih.nih.gov/health/passionflower')
    expect(source).toMatch(/passionflower should not be used during pregnancy/i)
    expect(source).toContain('may induce uterine contractions')
  })

  it('does not funnel this broad comparison into a valerian-only product module', () => {
    expect(source).not.toContain('RecommendationSection')
    expect(source).not.toContain("getRevenueProductSet('valerian')")
    expect(source).not.toContain('valerianProducts')
  })

  it('marks the current evidence update in structured data and visible copy', () => {
    expect(source).toContain('dateModified="2026-08-22"')
    expect(source).toContain('Last updated August 22, 2026')
  })
})
