import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const SOURCE = path.join(
  process.cwd(),
  'docs/content/focus-cluster/l-theanine-vs-caffeine-for-focus-content-v1.md',
)
const REGISTRY = path.join(process.cwd(), 'lib/focus-adhd-articles.ts')
const RENDERER = path.join(process.cwd(), 'components/articles/FocusAdhdArticlePage.tsx')

const read = (file: string) =>
  fs.readFileSync(file, 'utf8').replace(/\s+/g, ' ').replace(/\*\*/g, '')

describe('L-theanine vs caffeine focus evidence calibration', () => {
  it('anchors caffeine, L-theanine, combination, and ADHD claims to auditable human evidence', () => {
    const text = read(SOURCE)

    expect(text).toContain('40335666')
    expect(text).toContain('40314930')
    expect(text).toContain('42410082')
    expect(text).toContain('32753637')
    expect(text).toContain('22214254')
    expect(text).toContain('17891480')
    expect(text).toMatch(/31 trials and 1,455 healthy adults/i)
    expect(text).toMatch(/31 randomized trials with 1,168 participants/i)
    expect(text).toMatch(/50 randomized controlled trials/i)
    expect(text).toMatch(/15 eligible for one or more meta-analyses/i)
    expect(text).toMatch(/only five boys ages 8[–-]15 with ADHD/i)
    expect(text).toMatch(/98 boys with ADHD/i)
  })

  it('keeps caffeine attention evidence stronger without converting a population safety limit into a focus dose', () => {
    const text = read(SOURCE)

    expect(text).toMatch(/Caffeine has the stronger direct evidence for an acute attention effect in rested, healthy adults/i)
    expect(text).toMatch(/attention accuracy \(Hedges g = 0\.27\).*reaction time \(g = 0\.28\)/i)
    expect(text).toMatch(/400 mg\/day is an amount not generally associated with negative effects for most adults/i)
    expect(text).toMatch(/broad population safety reference—not a recommended focus target/i)
    expect(text).not.toMatch(/(?:take|use|aim for|target) 400 mg(?:\/day)?(?: of caffeine)? (?:for|to improve) focus/i)
    expect(text).not.toMatch(/recommended focus dose:?\s*400 mg/i)
  })

  it('does not restore a universal L-theanine-caffeine ratio or dosing recipe', () => {
    const text = read(SOURCE)

    expect(text).toMatch(/no optimal ratio has been established/i)
    expect(text).toMatch(/study regimen is not an optimal consumer ratio/i)
    expect(text).toMatch(/does not establish a universal 2:1, 1:1, or other L-theanine:caffeine ratio/i)
    expect(text).not.toMatch(/typical studied ratio is approximately 2:1/i)
    expect(text).not.toMatch(/200 mg L-theanine with 100 mg caffeine/i)
    expect(text).not.toMatch(/Common researched and practical ratios/i)
    expect(text).not.toMatch(/Start with lower doses and track response/i)
  })

  it('does not promise that L-theanine cancels caffeine jitteriness or sleep effects', () => {
    const text = read(SOURCE)

    expect(text).toMatch(/250 mg caffeine increased self-rated jitteriness and blood pressure/i)
    expect(text).toMatch(/did not significantly reduce jitteriness/i)
    expect(text).toMatch(/does not reliably cancel caffeine’s jitteriness or sleep effects/i)
    expect(text).toMatch(/does not remove caffeine from the body/i)
    expect(text).not.toMatch(/often smooths the stimulating effects of caffeine/i)
    expect(text).not.toMatch(/preserves or enhances caffeine’s attention benefits while reducing unwanted side effects/i)
  })

  it('keeps ADHD evidence exploratory rather than graded as moderate treatment evidence', () => {
    const text = read(SOURCE)

    expect(text).toMatch(/N=5 crossover can generate hypotheses/i)
    expect(text).toMatch(/cannot establish a dependable ADHD treatment, a pediatric dose, an optimal ratio, or long-term safety/i)
    expect(text).toMatch(/not proof that L-theanine improves daytime ADHD attention/i)
    expect(text).not.toMatch(/Evidence Grade: Preliminary to Moderate/i)
    expect(text).not.toMatch(/combination may be worth considering for attention support in children/i)
  })

  it('preserves caffeine and pediatric safety boundaries', () => {
    const text = read(SOURCE)

    expect(text).toContain('www.fda.gov/consumers/consumer-updates/spilling-beans-how-much-caffeine-too-much')
    expect(text).toContain('www.fda.gov/food/information-select-dietary-supplement-ingredients-and-other-substances/pure-and-highly-concentrated-caffeine')
    expect(text).toMatch(/FDA advises consumers to avoid pure or highly concentrated bulk caffeine/i)
    expect(text).toMatch(/Children and teens are not small adults/i)
    expect(text).toMatch(/Do not change prescribed ADHD medication based on this comparison/i)
  })

  it('keeps metadata aligned with both refreshed L-theanine routes and preserves publication history', () => {
    const registry = read(REGISTRY)

    expect(registry).toContain('updatedAt?: string')
    expect(registry).toContain('updatedAt: article.updatedAt ?? article.date')
    expect(registry).toMatch(/slug: 'l-theanine-for-adhd'.*title: 'L-Theanine for ADHD: What the Evidence Supports in 2026'.*date: '2026-06-10'.*updatedAt: '2026-08-12'/i)
    expect(registry).toMatch(/slug: 'l-theanine-vs-caffeine-for-focus'.*title: 'L-Theanine vs Caffeine for Focus: What the Evidence Supports in 2026'/i)
    expect(registry).toMatch(/seoTitle: 'L-Theanine vs Caffeine for Focus: Evidence'/i)
    expect(registry).toMatch(/why no universal dosing ratio is established/i)
    expect(registry).toMatch(/date: '2026-06-10'.*updatedAt: '2026-08-12'/i)
  })

  it('uses evidence-review dates and removes stale product/widget recommendations', () => {
    const renderer = read(RENDERER)
    const products = renderer.match(/const ADHD_ARTICLE_PRODUCTS:[\s\S]*?\}\s*\/\/ Per-slug hero images/)?.[0] ?? ''

    expect(renderer).toContain('const lastUpdated = article.updatedAt ?? article.date')
    expect(renderer).toContain('updated: lastUpdated')
    expect(renderer).toContain('<LastUpdatedBadge date={lastUpdated} label="Last updated" />')
    expect(products).not.toContain("'l-theanine-for-adhd': 'l-theanine'")
    expect(products).not.toContain("'l-theanine-vs-caffeine-for-focus': 'l-theanine'")
    expect(renderer).toContain("'l-theanine-vs-caffeine-for-focus': { src: '/images/guides/adhd/adhd-l-theanine-caffeine.jpg'")
    expect(renderer).toContain("{slug !== 'l-theanine-vs-caffeine-for-focus' && <AdhdComparisonCard slug={slug} />}")
  })
})
