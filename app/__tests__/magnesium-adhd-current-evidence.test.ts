import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const SOURCE = path.join(process.cwd(), 'docs/content/focus-cluster/magnesium-for-adhd-content-v1.md')
const REGISTRY = path.join(process.cwd(), 'lib/focus-adhd-articles.ts')
const RENDERER = path.join(process.cwd(), 'components/articles/FocusAdhdArticlePage.tsx')

const read = (file: string) =>
  fs.readFileSync(file, 'utf8').replace(/\s+/g, ' ').replace(/\*\*/g, '')

describe('magnesium ADHD evidence calibration', () => {
  it('anchors the page to the direct ADHD evidence and labels the combination trial correctly', () => {
    const text = read(SOURCE)

    expect(text).toContain('23808779')
    expect(text).toContain('33865361')
    expect(text).toContain('30807974')
    expect(text).toMatch(/six experimental\/intervention studies/i)
    expect(text).toMatch(/only three had a control group/i)
    expect(text).toMatch(/none used the kind of randomized double-blind magnesium-monotherapy design/i)
    expect(text).toMatch(/vitamin D plus magnesium together/i)
    expect(text).toMatch(/cannot establish magnesium-alone efficacy/i)
  })

  it('does not restore a moderate ADHD evidence grade, universal dose, or same-day protocol', () => {
    const text = read(SOURCE)

    expect(text).not.toMatch(/Evidence Grade: Preliminary to Moderate/i)
    expect(text).not.toMatch(/Evidence Grade: Moderate/i)
    expect(text).toMatch(/direct ADHD treatment evidence is insufficient/i)
    expect(text).toMatch(/Older versions of this guide presented 200[–-]400 mg\/day as a practical ADHD range/i)
    expect(text).toMatch(/does not recommend:/i)
    expect(text).toMatch(/a universal magnesium dose for ADHD/i)
    expect(text).toMatch(/an as-needed focus dose/i)
    expect(text).toMatch(/A reliable same-day ADHD focus effect has not been established/i)
    expect(text).not.toMatch(/start with 200 mg/i)
    expect(text).not.toMatch(/increase.*400 mg/i)
  })

  it('does not crown glycinate, threonate, or another form as best for ADHD', () => {
    const text = read(SOURCE)

    expect(text).toMatch(/Is magnesium glycinate the best form for ADHD\?/i)
    expect(text).toMatch(/That has not been established/i)
    expect(text).toMatch(/No magnesium salt currently has strong direct evidence as the preferred ADHD treatment form/i)
    expect(text).not.toMatch(/glycinate is best/i)
    expect(text).not.toMatch(/L-threonate.*best.*focus/i)
  })

  it('keeps deficiency and sleep claims separate from ADHD treatment efficacy', () => {
    const text = read(SOURCE)

    expect(text).toMatch(/correcting a true deficiency matters for health.*different claim from saying magnesium treats ADHD/i)
    expect(text).toMatch(/Association does not prove that supplementation treats ADHD/i)
    expect(text).toMatch(/A sleep outcome should not be relabeled as an ADHD symptom-treatment outcome/i)
    expect(text).toMatch(/symptoms.*do not diagnose magnesium deficiency/i)
  })

  it('rejects evidence-free ADHD stacks', () => {
    const text = read(SOURCE)

    expect(text).toMatch(/Separate ingredient studies do not validate a stack/i)
    expect(text).toMatch(/does not recommend a magnesium \+ L-theanine, magnesium \+ melatonin, magnesium \+ vitamin D, or other ADHD stack/i)
    expect(text).toMatch(/vitamin D \+ magnesium RCT is evidence about that studied combination/i)
    expect(text).not.toMatch(/best stack/i)
  })

  it('preserves NIH dose-ceiling, kidney, and medication-interaction context', () => {
    const text = read(SOURCE)

    expect(text).toContain('ods.od.nih.gov/factsheets/Magnesium-HealthProfessional')
    expect(text).toMatch(/350 mg\/day.*tolerable upper intake level/i)
    expect(text).toMatch(/safety ceiling, not an ADHD target/i)
    expect(text).toMatch(/risk of magnesium toxicity rises when impaired kidney function/i)
    expect(text).toMatch(/tetracycline and quinolone antibiotics/i)
    expect(text).toMatch(/oral bisphosphonate/i)
    expect(text).toMatch(/do not stop, skip, lower, or otherwise change prescribed ADHD medication/i)
  })

  it('requires evidence-review metadata and neutral shared rendering after replay', () => {
    const registry = read(REGISTRY)
    const renderer = read(RENDERER)
    const products = renderer.match(/const ADHD_ARTICLE_PRODUCTS:[\s\S]*?\}\s*\/\/ Per-slug hero images/)?.[0] ?? ''

    expect(registry).toContain('updatedAt?: string')
    expect(registry).toMatch(/slug: 'magnesium-for-adhd'.*title: 'Magnesium for ADHD: What the Evidence Supports in 2026'.*date: '2026-06-10'.*updatedAt: '2026-08-12'/i)
    expect(registry).toMatch(/description: 'Evidence-first review of magnesium and ADHD/i)
    expect(renderer).toContain('const lastUpdated = article.updatedAt ?? article.date')
    expect(products).not.toContain("'magnesium-for-adhd': 'magnesium'")
    expect(renderer).toContain("slug !== 'magnesium-for-adhd'")
  })
})
