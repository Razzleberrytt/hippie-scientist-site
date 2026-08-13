import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const PAGE = path.join(process.cwd(), 'app/guides/sleep/l-theanine-for-sleep/page.tsx')

function source() {
  return fs.readFileSync(PAGE, 'utf8').replace(/\s+/g, ' ')
}

describe('L-theanine sleep evidence calibration', () => {
  it('anchors the page to current direct sleep and safety evidence', () => {
    const text = source()

    expect(text).toContain("const DATE = '2026-06-09'")
    expect(text).toContain("const UPDATED_DATE = '2026-08-12'")
    expect(text).toContain('40056718')
    expect(text).toContain('38846134')
    expect(text).toContain('38953043')
    expect(text).toContain('42410082')
    expect(text).toMatch(/19 articles \/ 897 participants/i)
    expect(text).toMatch(/31 randomized trials \/ 1,168 participants/i)
  })

  it('keeps the 2025 sleep meta-analysis limitations explicit', () => {
    const text = source()

    expect(text).toMatch(/pure L-theanine/i)
    expect(text).toMatch(/adequate dose and duration still need to be determined/i)
    expect(text).toMatch(/small improvements in subjective sleep-onset latency/i)
  })

  it('does not convert the cognitive 30–60 minute window into a bedtime protocol', () => {
    const text = source()

    expect(text).toMatch(/single 200 mg dose taken 30[–-]60 minutes before cognitive testing/i)
    expect(text).toMatch(/attention result/i)
    expect(text).not.toMatch(/A commonly used timing is 30[–-]60 minutes before bed/i)
    expect(text).not.toMatch(/Take both 30[–-]60 minutes before bed/i)
    expect(text).not.toMatch(/effects may be noticeable within hours/i)
    expect(text).not.toMatch(/easier to trial quickly/i)
  })

  it('keeps direct trial populations and mixed interventions visible', () => {
    const text = source()

    expect(text).toMatch(/120 cancer patients with insomnia/i)
    expect(text).toMatch(/14 days/i)
    expect(text).toMatch(/2 hours before bedtime/i)
    expect(text).toMatch(/melatonin outperformed L-theanine/i)
    expect(text).toMatch(/40 adults with sleep discomfort/i)
    expect(text).toMatch(/Lactium \+ L-theanine/i)
    expect(text).toMatch(/8 weeks/i)
    expect(text).toMatch(/cannot isolate an L-theanine effect/i)
  })

  it('does not restore symptom-matching or evidence-free sleep stacks', () => {
    const text = source()

    expect(text).not.toMatch(/magnesium glycinate is a reasonable first choice/i)
    expect(text).not.toMatch(/pairs naturally with magnesium or ashwagandha/i)
    expect(text).not.toMatch(/reasonable relaxation stack/i)
    expect(text).not.toMatch(/Generally yes, for healthy adults/i)
    expect(text).not.toMatch(/No known adverse interaction/i)
    expect(text).not.toMatch(/immediate relaxation/i)
    expect(text).toMatch(/Racing thoughts.*not a validated supplement selector/i)
    expect(text).toMatch(/Separate ingredient studies do not validate a sleep stack/i)
  })

  it('removes the old hand-coded dose-shopping funnel but preserves neutral sourcing', () => {
    const text = source()

    expect(text).not.toContain('AFFILIATE_TAGS')
    expect(text).not.toMatch(/amazon\.com/i)
    expect(text).not.toMatch(/L-Theanine — Lower Dose/i)
    expect(text).not.toMatch(/L-Theanine — Standard Dose/i)
    expect(text).not.toMatch(/At standard doses \(100[–-]200 mg\)/i)
    expect(text).toContain('RecommendationSection')
    expect(text).toContain("getRevenueProductSet('l-theanine')")
  })

  it('keeps safety, visible FAQ, and chronic-insomnia boundaries', () => {
    const text = source()

    expect(text).toMatch(/no serious adverse events/i)
    expect(text).toMatch(/avoid blanket “interaction-free” claims/i)
    expect(text).toMatch(/pregnancy and breastfeeding/i)
    expect(text).toMatch(/first-line, evidence-based treatment for chronic insomnia/i)
    expect(text).toMatch(/Frequently asked questions/i)
    expect(text).toContain('{FAQS.map((faq) => (')
  })
})
