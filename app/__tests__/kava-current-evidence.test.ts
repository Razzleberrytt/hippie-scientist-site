import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const ARTICLE = path.join(process.cwd(), 'content/articles/kava.md')

function source() {
  return fs.readFileSync(ARTICLE, 'utf8').replace(/\s+/g, ' ')
}

describe('kava canonical evidence calibration', () => {
  it('preserves publication history and anchors the larger negative GAD trial', () => {
    const text = source()

    expect(text).toContain("date: '2026-06-08'")
    expect(text).toContain("updatedAt: '2026-08-12'")
    expect(text).toContain('31813230')
    expect(text).toContain('23635869')
    expect(text).toContain('12535473')
    expect(text).toMatch(/171 currently non-medicated adults with diagnosed generalized anxiety disorder/i)
    expect(text).toMatch(/16 weeks/i)
    expect(text).toMatch(/120 mg of kavalactones twice daily/i)
    expect(text).toMatch(/did not show a significant advantage for kava/i)
  })

  it('does not restore rapid benzodiazepine-equivalence or acute-use promises', () => {
    const text = source()

    expect(text).not.toMatch(/comparable to low-dose benzodiazepines/i)
    expect(text).not.toMatch(/works within 30[–-]60 minutes/i)
    expect(text).not.toMatch(/30[–-]60 min \| Weeks/i)
    expect(text).not.toMatch(/best fit \| Acute anxiety relief/i)
    expect(text).not.toMatch(/one of the best-evidenced herbal interventions/i)
    expect(text).not.toMatch(/replacement for.*benzodiazepine/i)
    expect(text).toMatch(/not established as a reliable 30[–-]60-minute anxiolytic/i)
    expect(text).toMatch(/not established as equivalent to a benzodiazepine/i)
  })

  it('keeps GAD directness mixed rather than promoting kava as established treatment', () => {
    const text = source()

    expect(text).toMatch(/2013 randomized, double-blind trial in 75 people with GAD/i)
    expect(text).toMatch(/larger 2020 placebo-controlled trial in 171 adults/i)
    expect(text).toMatch(/does not appear to be helpful for symptoms of GAD/i)
    expect(text).toMatch(/mixed evidence whose applicability depends on population, preparation, duration, and outcome/i)
    expect(text).not.toMatch(/generalized anxiety disorder \(mild-moderate\)/i)
  })

  it('keeps liver risk visible without a noble-or-water safety guarantee', () => {
    const text = source()

    expect(text).toContain('31643949')
    expect(text).toMatch(/rare cases of liver injury that have been serious or fatal/i)
    expect(text).toMatch(/cases have also involved kava beverages prepared with water/i)
    expect(text).toMatch(/liver-function-test abnormalities were significantly more frequent in the kava group/i)
    expect(text).toMatch(/product quality does not eliminate the risk/i)
    expect(text).not.toMatch(/noble cultivars \+ water extracts only/i)
    expect(text).not.toMatch(/much lower with noble cultivars and water extracts/i)
    expect(text).not.toMatch(/modern safety standard/i)
  })

  it('surfaces non-hepatic adverse signals and core interaction boundaries', () => {
    const text = source()

    expect(text).toMatch(/poorer memory/i)
    expect(text).toMatch(/tremor\/shakiness/i)
    expect(text).toMatch(/benzodiazepines and alcohol/i)
    expect(text).toMatch(/pregnancy and breastfeeding/i)
    expect(text).toMatch(/dark urine/i)
    expect(text).toMatch(/jaundice/i)
  })

  it('keeps mechanisms and study exposures from turning into clinical guarantees or dosing protocols', () => {
    const text = source()

    expect(text).toMatch(/mechanistic overlap does not prove therapeutic equivalence/i)
    expect(text).toMatch(/trial.*120 mg kavalactones twice daily.*16 weeks/i)
    expect(text).toMatch(/not a universal dose recommendation/i)
    expect(text).not.toMatch(/Start at 100 mg/i)
    expect(text).not.toMatch(/increase to 250 mg/i)
    expect(text).not.toMatch(/Take on empty stomach/i)
    expect(text).not.toMatch(/do not appear to produce GABA-A receptor downregulation/i)
    expect(text).not.toMatch(/dependence risk \| Low/i)
  })

  it('does not generalize anxiety-linked sleep evidence into an insomnia protocol', () => {
    const text = source()

    expect(text).toContain('14706720')
    expect(text).toMatch(/sleep disturbances associated with anxiety disorders/i)
    expect(text).toMatch(/very little research has tested kava for insomnia/i)
    expect(text).toMatch(/should not be converted into a universal bedtime recommendation/i)
    expect(text).not.toMatch(/sleep onset from racing thoughts/i)
  })

  it('retains a clear care-escalation boundary', () => {
    const text = source()

    expect(text).toMatch(/persistent or worsening anxiety/i)
    expect(text).toMatch(/seek professional assessment/i)
    expect(text).toMatch(/thoughts of self-harm/i)
    expect(text).toMatch(/seek urgent help rather than experimenting with supplements/i)
  })
})
