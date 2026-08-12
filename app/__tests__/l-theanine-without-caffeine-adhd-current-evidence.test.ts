import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const FOCUS_PAGE = path.join(process.cwd(), 'app/guides/focus/l-theanine-without-caffeine/page.tsx')
const ADHD_SOURCE = path.join(process.cwd(), 'docs/content/focus-cluster/l-theanine-for-adhd-content-v1.md')
const RENDERER = path.join(process.cwd(), 'components/articles/FocusAdhdArticlePage.tsx')
const WIDGETS = path.join(process.cwd(), 'components/articles/AdhdMonetizationWidgets.tsx')

const read = (file: string) =>
  fs.readFileSync(file, 'utf8').replace(/\s+/g, ' ').replace(/\*\*/g, '')

describe('L-theanine ADHD route evidence calibration', () => {
  it('preserves publication history and anchors the caffeine-free page to current evidence', () => {
    const text = read(FOCUS_PAGE)

    expect(text).toContain("const DATE = '2026-06-12'")
    expect(text).toContain("const UPDATED_DATE = '2026-08-12'")
    expect(text).toMatch(/date: DATE, updated: UPDATED_DATE/)
    expect(text).toContain('42410082')
    expect(text).toContain('32753637')
    expect(text).toContain('22214254')
    expect(text).toContain('40314930')
    expect(text).toMatch(/31 randomized trials \/ 1,168 participants/i)
    expect(text).toMatch(/only five boys/i)
    expect(text).toMatch(/98-boy/i)
  })

  it('keeps general attention evidence separate from ADHD efficacy on the caffeine-free route', () => {
    const text = read(FOCUS_PAGE)

    expect(text).toMatch(/title="General attention evidence" evidenceLevel="Limited"/i)
    expect(text).toMatch(/title="ADHD-specific evidence" evidenceLevel="Limited"/i)
    expect(text).toMatch(/pooled population was not an ADHD population/i)
    expect(text).toMatch(/supports general attention research—not an ADHD protocol/i)
    expect(text).toMatch(/far too small to establish an ADHD treatment effect/i)
    expect(text).toMatch(/studied sleep quality over six weeks, not daytime focus or core ADHD symptoms/i)
  })

  it('does not restore a caffeine-free ADHD dose, onset, or rescue protocol', () => {
    const text = read(FOCUS_PAGE)

    expect(text).not.toMatch(/Fastest useful choice/i)
    expect(text).not.toMatch(/If you only try one thing: L-theanine 100 mg alone/i)
    expect(text).not.toMatch(/100\s*mg.*increase to 200\s*mg/i)
    expect(text).not.toMatch(/take L-theanine 30[–-]60 minutes before a planned focus session/i)
    expect(text).not.toMatch(/effects within 30[–-]60 minutes, no crash, no sleep disruption, no dependency/i)
    expect(text).not.toMatch(/acute calm focus \(L-theanine\)/i)
    expect(text).toMatch(/study regimen and outcome—not evidence that every person with ADHD should take a specific milligram amount/i)
    expect(text).toMatch(/too small to turn its weight-based experimental dosing into a consumer ADHD protocol/i)
  })

  it('does not generalize the caffeine combination literature to L-theanine alone or ADHD treatment', () => {
    const text = read(FOCUS_PAGE)

    expect(text).toMatch(/L-theanine plus caffeine is a different intervention/i)
    expect(text).toMatch(/cannot be used as proof that L-theanine alone works the same way/i)
    expect(text).toMatch(/much of it is in healthy participants/i)
    expect(text).toMatch(/ADHD-specific combination study was only a five-person proof-of-concept crossover/i)
    expect(text).not.toMatch(/L-theanine blunts caffeine's jitteriness while preserving its attentional benefits/i)
  })

  it('removes blanket stimulant-interaction reassurance and preserves medication boundaries', () => {
    const text = read(FOCUS_PAGE)

    expect(text).not.toMatch(/No established adverse interaction between supplemental L-theanine and common ADHD medications/i)
    expect(text).not.toMatch(/use L-theanine during stimulant off-periods or on weekends/i)
    expect(text).toMatch(/direct interaction and coadministration evidence is limited/i)
    expect(text).toMatch(/not designed to establish medication-interaction safety/i)
    expect(text).toMatch(/should not be used to stop, skip, or alter prescribed ADHD medication/i)
    expect(text).toMatch(/prescriber or pharmacist managing treatment/i)
  })

  it('keeps safety language conservative and transparent on the caffeine-free route', () => {
    const text = read(FOCUS_PAGE)

    expect(text).toMatch(/No serious adverse events were reported in the 2026 meta-analysis/i)
    expect(text).toMatch(/does not establish unlimited long-term safety/i)
    expect(text).toMatch(/pediatric trials used defined products and research protocols/i)
    expect(text).toMatch(/not a basis for unsupervised pediatric dosing/i)
    expect(text).toMatch(/One author disclosed founding a dietary-supplement company/i)
  })

  it('keeps the existing ADHD route aligned to the same directness boundary', () => {
    const text = read(ADHD_SOURCE)

    expect(text).toContain('42410082')
    expect(text).toContain('32753637')
    expect(text).toContain('22214254')
    expect(text).toContain('40314930')
    expect(text).toMatch(/31 randomized trials \/ 1,168 participants/i)
    expect(text).toMatch(/Only five boys/i)
    expect(text).toMatch(/98 boys ages 8[–-]12 with diagnosed ADHD/i)
    expect(text).toMatch(/evaluated sleep over six weeks rather than daytime attention or core ADHD symptoms/i)
    expect(text).toMatch(/current evidence does not justify presenting it as a proven non-stimulant ADHD treatment/i)
  })

  it('removes the old ADHD-route starting protocol, timing script, and off-day advice', () => {
    const text = read(ADHD_SOURCE)

    expect(text).toMatch(/Older versions of this guide translated study regimens into a practical 200[–-]400 mg starting range and gave 30[–-]60-minute timing guidance/i)
    expect(text).toMatch(/The direct ADHD evidence is not strong enough to support that conversion/i)
    expect(text).not.toMatch(/start at the lower end of studied ranges/i)
    expect(text).not.toMatch(/use L-theanine during stimulant off-periods or on weekends/i)
    expect(text).toMatch(/does not recommend:/i)
    expect(text).toMatch(/a universal ADHD dose/i)
    expect(text).toMatch(/taking L-theanine a fixed number of minutes before a focus task/i)
    expect(text).toMatch(/using it as medication wears off/i)
    expect(text).toMatch(/using it on stimulant off-days or weekends/i)
    expect(text).toMatch(/unsupervised pediatric dosing/i)
  })

  it('keeps the ADHD route medication and pediatric safety boundaries explicit', () => {
    const text = read(ADHD_SOURCE)

    expect(text).toMatch(/direct interaction and coadministration evidence is limited/i)
    expect(text).toMatch(/pediatric studies used defined research products and supervised protocols/i)
    expect(text).toMatch(/not a basis for unsupervised pediatric supplementation/i)
    expect(text).toMatch(/do not stop, skip, lower, or otherwise change prescribed ADHD medication/i)
    expect(text).toMatch(/prescriber or pharmacist managing that treatment/i)
  })

  it('keeps both L-theanine ADHD routes commercially neutral', () => {
    const focus = read(FOCUS_PAGE)
    const renderer = read(RENDERER)
    const widgets = read(WIDGETS)
    const products = renderer.match(/const ADHD_ARTICLE_PRODUCTS:[\s\S]*?\}\s*\/\/ Per-slug hero images/)?.[0] ?? ''
    const magnesiumTheanineCard = widgets.match(
      /if \(slug === 'best-supplements-for-adhd'[\s\S]*?else if \(slug === 'sleep-and-adhd'/,
    )?.[0] ?? ''

    expect(focus).not.toContain('AFFILIATE_TAGS')
    expect(focus).not.toContain('RecommendationSection')
    expect(focus).not.toContain('getRevenueProductSet')
    expect(focus).not.toMatch(/amazon\.com/i)
    expect(focus).toMatch(/intentionally does not rank affiliate products/i)
    expect(products).not.toContain("'l-theanine-for-adhd': 'l-theanine'")
    expect(magnesiumTheanineCard).not.toContain("slug === 'l-theanine-for-adhd'")
  })

  it('keeps visible FAQ content and discovery/conversion on the caffeine-free page', () => {
    const text = read(FOCUS_PAGE)

    expect(text).toContain('{FAQS.map((faq) => (')
    expect(text).toMatch(/faqPageJsonLd\(\{ pagePath: `\/guides\/focus\/\$\{SLUG\}\/`, questions: FAQS \}\)/)
    expect(text).toContain('/guides/herbs/l-theanine/')
    expect(text).toContain('<EmailCapture')
    expect(text).toContain('<NewsletterCtaBlock')
  })
})
