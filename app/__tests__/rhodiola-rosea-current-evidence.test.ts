import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const ARTICLE = path.join(process.cwd(), 'content/articles/rhodiola-rosea.md')

function source() {
  return fs.readFileSync(ARTICLE, 'utf8').replace(/\s+/g, ' ').replace(/\*\*/g, '')
}

describe('Rhodiola rosea canonical article evidence calibration', () => {
  it('preserves publication history and adds the current evidence review date', () => {
    const text = source()

    expect(text).toContain("date: '2026-06-06'")
    expect(text).toContain("updatedAt: '2026-08-12'")
    expect(text).toMatch(/Rhodiola Rosea: What the Human Evidence Supports in 2026/i)
  })

  it('corrects the two historical trial PMIDs and keeps auditable evidence anchors', () => {
    const text = source()

    expect(text).toContain('pmid: "11081987"')
    expect(text).toContain('pmid: "10839209"')
    expect(text).not.toContain('pmid: "11081995"')
    expect(text).toContain('22643043')
    expect(text).toContain('19016404')
    expect(text).toContain('25268730')
    expect(text).toContain('41906501')
    expect(text).toContain('41080184')
  })

  it('makes the fatigue literature mixed rather than uniformly positive', () => {
    const text = source()

    expect(text).toMatch(/11 studies/i)
    expect(text).toMatch(/2 of 6.*physical fatigue/i)
    expect(text).toMatch(/3 of 5.*mental fatigue/i)
    expect(text).toMatch(/evidence was contradictory/i)
    expect(text).toMatch(/48 nursing students ages 18[–-]55/i)
    expect(text).toMatch(/42 days/i)
    expect(text).toMatch(/in favor of placebo/i)
    expect(text).not.toMatch(/all 11 studies showed some benefit/i)
    expect(text).not.toMatch(/Moderate for fatigue and cognitive performance/i)
  })

  it('keeps positive trials direct to their population, extract, comparator, and duration', () => {
    const text = source()

    expect(text).toMatch(/60 adults ages 20[–-]55/i)
    expect(text).toMatch(/SHR-5 root extract, 576 mg\/day/i)
    expect(text).toMatch(/Comparator: placebo/i)
    expect(text).toMatch(/Duration: 28 days/i)
    expect(text).toMatch(/56 young healthy physicians/i)
    expect(text).toMatch(/two-week treatment periods/i)
    expect(text).toMatch(/20-day examination period/i)
  })

  it('separates the endurance signal from burnout or mental-fatigue treatment', () => {
    const text = source()

    expect(text).toMatch(/26 randomized trials \/ 668 healthy participants/i)
    expect(text).toMatch(/mean age of about 22 years/i)
    expect(text).toMatch(/exercise\/endurance performance in healthy participants/i)
    expect(text).toMatch(/should not be repackaged as proof that Rhodiola treats chronic fatigue, occupational burnout/i)
  })

  it('removes deterministic onset, dose, timing, and cycling protocols', () => {
    const text = source()
    const noPromiseRebuttal = text.replace(
      /“No jitters” or “no crash” Those are consumer-experience promises, not established comparative outcomes\./i,
      '',
    )
    const cyclingMentions = text.match(/[^.?!]*(?:6[–-]8 weeks on)[^.?!]*/gi) ?? []

    expect(text).not.toMatch(/Some notice effects day 1/i)
    expect(text).toMatch(/“No jitters” or “no crash” Those are consumer-experience promises, not established comparative outcomes\./i)
    expect(noPromiseRebuttal).not.toMatch(/No jitters/i)
    expect(noPromiseRebuttal).not.toMatch(/No crash/i)
    expect(text).not.toMatch(/full effects stabilize/i)
    expect(text).not.toMatch(/200[–-]400 mg\/day SHR-5, morning/i)
    expect(text).not.toMatch(/400[–-]600 mg\/day SHR-5/i)
    expect(text).not.toMatch(/100[–-]200 mg\/day.*maintenance/i)
    expect(cyclingMentions.length).toBeGreaterThan(0)
    for (const mention of cyclingMentions) {
      expect(mention).toMatch(/\b(?:no|not)\b/i)
    }
    expect(text).not.toMatch(/Not within 6 hours of bedtime/i)
    expect(text).toMatch(/No evidence-based cycling schedule is established/i)
    expect(text).toMatch(/No reliable universal onset is established/i)
  })

  it('does not restore phenotype matching, mechanism certainty, or evidence-free stacks', () => {
    const text = source()

    expect(text).not.toMatch(/am I wired or tired/i)
    expect(text).not.toMatch(/classic circadian adaptogen stack/i)
    expect(text).not.toMatch(/Rhodiola smooths the edges of caffeine/i)
    expect(text).not.toMatch(/HPA axis normalization begins/i)
    expect(text).not.toMatch(/MAO inhibition \+ catecholamine preservation/i)
    expect(text).toMatch(/Mechanisms are hypotheses, not treatment selectors/i)
    expect(text).toMatch(/Separate studies of Rhodiola, ashwagandha, L-theanine, creatine, or caffeine do not prove/i)
  })

  it('keeps short-term safety uncertainty and persistent-fatigue stop rules visible', () => {
    const text = source()

    expect(text).toMatch(/Most Rhodiola trials are relatively short/i)
    expect(text).toMatch(/Persistent or unexplained fatigue deserves evaluation/i)
    expect(text).toMatch(/Do not infer medication compatibility from mechanism diagrams/i)
    expect(text).toMatch(/Pregnancy\/breastfeeding and long-term use are evidence gaps/i)
    expect(text).toMatch(/bipolar-spectrum illness/i)
    expect(text).toContain('European Medicines Agency')
  })
})
