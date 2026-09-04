import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8')) as T
}

type MagnesiumGuide = {
  intro: string
  sections: Array<{
    id: string
    title: string
    body: string
    subsections?: Array<{ title: string; body: string }>
    blocks?: Array<{ type: string; text: string }>
  }>
  dosageGuidelines: Array<{
    form: string
    range: string
    notes: string
    bioavailabilityNote: string
  }>
  relatedLinks: Array<{ href: string; label: string }>
}

type TryptophanDetail = {
  summary: string
  description: string
}

describe('served sleep-data calibration', () => {
  it('keeps the public magnesium guide limited, formulation-specific, and non-prescriptive', () => {
    const guide = readJson<MagnesiumGuide>('public/data/guides/magnesium-for-sleep-and-anxiety.json')
    const forms = guide.sections.find((section) => section.id === 'forms')
    const evidence = guide.sections.find((section) => section.id === 'evidence')
    const glycinate = forms?.subsections?.find((section) => /glycinate/i.test(section.title))
    const sleepOutcomes = evidence?.subsections?.find((section) => /sleep outcomes/i.test(section.title))

    expect(guide.intro).toMatch(/limited, heterogeneous, and formulation-specific/i)
    expect(guide.intro).toMatch(/statistically significant but small insomnia-severity benefit/i)
    expect(guide.intro).toMatch(/No magnesium form has been established as the universal best form/i)

    expect(glycinate?.body).toMatch(/small and objective sleep was not measured/i)
    expect(glycinate?.body).toMatch(/does not establish glycinate as the gold standard/i)
    expect(sleepOutcomes?.body).toMatch(/not a universal claim that magnesium reliably improves.*architecture.*deep sleep/i)

    for (const dosage of guide.dosageGuidelines) {
      expect(dosage.range).toMatch(/no universal sleep dose|follow the studied product|depends on elemental magnesium/i)
    }

    expect(guide.relatedLinks.map((link) => link.href)).toEqual(
      expect.arrayContaining([
        '/articles/sleep-interventions-evidence-matrix/',
        '/articles/cbt-i-vs-sleep-supplements/',
      ]),
    )
  })

  it('keeps the tryptophan served summary centered on WASO rather than a blanket latency claim', () => {
    const detail = readJson<TryptophanDetail>('public/data/compounds-detail/tryptophan.json')

    expect(detail.summary).toMatch(/limited human sleep evidence/i)
    expect(detail.summary).toMatch(/2022 meta-analysis/i)
    expect(detail.summary).toMatch(/reduced wake after sleep onset/i)
    expect(detail.summary).toMatch(/rather than a broad sleep-latency benefit/i)
    expect(detail.description).toMatch(/serotonin and melatonin synthesis/i)
  })
})
