import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const page = fs.readFileSync(
  path.join(process.cwd(), 'app', 'guides', 'anxiety', 'best-herbs-for-anxiety', 'page.tsx'),
  'utf8',
)

describe('best herbs for anxiety evidence refresh', () => {
  it('records the refreshed 22-source provenance consistently', () => {
    expect(page).toContain("const DATE = '2026-09-19'")
    expect(page).toContain('Last evidence review September 19, 2026')
    expect(page).toContain('Anxiety herb evidence guide · 22-source ledger')
    expect(page).toContain('with 22 clinical and safety sources.')
    expect(page).toContain('Evidence-ranked anxiety herbs with 22 clinical and safety sources')
    expect((page.match(/\{ n: \d+, title:/g) ?? []).length).toBe(22)
  })

  it('adds the newer systematic evidence with its interpretation limits', () => {
    expect(page).toContain("pmid: '41644067'")
    expect(page).toContain("doi: '10.1016/j.ctim.2026.103325'")
    expect(page).toContain('expanded the pool to 22 eligible RCTs')
    expect(page).toContain('heterogeneity and the most effective dose and duration remain unresolved')

    expect(page).toContain("pmid: '40788541'")
    expect(page).toContain("doi: '10.1007/s00406-025-02082-0'")
    expect(page).toContain('Silexan as the only phytopharmaceutical')
    expect(page).toContain('it does not make Silexan universally first-line')
    expect(page).toContain('or generalize the result to other lavender products')
  })

  it('keeps the established evidence-ranked order unchanged', () => {
    const silexan = page.indexOf('1. Oral lavender oil (Silexan):')
    const ashwagandha = page.indexOf('2. Ashwagandha:')
    const chamomile = page.indexOf('3. Chamomile:')
    const passionflower = page.indexOf('4. Passionflower:')
    const kava = page.indexOf('5. Kava:')

    expect(silexan).toBeGreaterThan(-1)
    expect(ashwagandha).toBeGreaterThan(silexan)
    expect(chamomile).toBeGreaterThan(ashwagandha)
    expect(passionflower).toBeGreaterThan(chamomile)
    expect(kava).toBeGreaterThan(passionflower)
  })

  it('keeps methodology and core negative-trial/safety boundaries visible', () => {
    expect(page).toContain('href="/info/methodology/"')
    expect(page).toContain('diagnostic directness, preparation match, replication, funding concentration, negative trials and safety')
    expect(page).toContain("pmid: '31813230'")
    expect(page).toContain('no significant benefit over placebo')
    expect(page).toContain('rare severe liver injury')
    expect(page).toContain('pregnancy/breastfeeding')
    expect(page).toContain('medication interactions')
    expect(page).toContain('A same-day subjective calming effect does not establish durable treatment of an anxiety disorder.')
  })

  it('leaves the established post-answer newsletter action in place', () => {
    expect((page.match(/<NewsletterCtaBlock/g) ?? []).length).toBe(1)
    expect(page).toContain('location="best-herbs-for-anxiety-newsletter"')
    expect(page.indexOf('<NewsletterCtaBlock')).toBeGreaterThan(page.indexOf('<References refs={REFS} />'))
  })
})
