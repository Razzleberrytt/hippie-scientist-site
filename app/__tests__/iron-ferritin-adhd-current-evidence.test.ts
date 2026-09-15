import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const SOURCE = path.join(
  process.cwd(),
  'docs/content/focus-cluster/iron-ferritin-and-adhd.md',
)

const read = () =>
  fs.readFileSync(SOURCE, 'utf8').replace(/\s+/g, ' ').replace(/\*\*/g, '')

describe('iron/ferritin ADHD evidence calibration', () => {
  it('keeps status, intervention, brain-iron, and RLS evidence in separate lanes', () => {
    const text = read()

    expect(text).toMatch(/Peripheral status\/association evidence/i)
    expect(text).toMatch(/ADHD intervention evidence/i)
    expect(text).toMatch(/Brain-iron biomarker evidence/i)
    expect(text).toMatch(/RLS\/sleep evidence/i)
    expect(text).toMatch(/Blending these lanes makes the case for iron look stronger than the clinical evidence really is/i)
  })

  it('anchors treatment claims to the pooled randomized evidence and labels weaker signals correctly', () => {
    const text = read()

    for (const pmid of ['38343311', '39001783', '41914113']) {
      expect(text).toContain(pmid)
    }
    expect(text).toMatch(/3 randomized ADHD trials \/ 124 participants/i)
    expect(text).toMatch(/did not find a significant iron-versus-placebo advantage/i)
    expect(text).toMatch(/very low certainty/i)
    expect(text).toMatch(/prospective single-arm, 32 children/i)
    expect(text).toMatch(/Hypothesis-generating only: no placebo\/control/i)
    expect(text).toMatch(/iron-deficient children receiving methylphenidate/i)
    expect(text).toMatch(/not evidence for iron monotherapy or iron-replete ADHD/i)
  })

  it('does not convert lower ferritin associations into causation, screening, or supplementation efficacy', () => {
    const text = read()

    expect(text).toContain('42280439')
    expect(text).toMatch(/46 studies with 5,515 ADHD cases and 8,166 controls/i)
    expect(text).toMatch(/association evidence, not proof that low ferritin causes ADHD/i)
    expect(text).toMatch(/Case-control studies cannot show that supplementation improves ADHD/i)
    expect(text).toMatch(/Association is not a screening recommendation, and a screening recommendation is not a treatment effect/i)
    expect(text).toMatch(/does not support treating an ADHD diagnosis itself as proof of iron deficiency/i)
    expect(text).toMatch(/does not establish a routine ADHD-specific ferritin-screening recommendation/i)
  })

  it('keeps peripheral ferritin distinct from brain-iron imaging', () => {
    const text = read()

    expect(text).toContain('38547742')
    expect(text).toMatch(/Brain iron is not the same measurement as serum ferritin/i)
    expect(text).toMatch(/serum ferritin is a peripheral storage marker, not a direct brain-iron measurement/i)
    expect(text).toMatch(/MRI-derived brain-iron estimates are biomarkers, not diagnoses/i)
    expect(text).toMatch(/did not establish that oral iron supplementation changes brain-iron imaging/i)
    expect(text).toMatch(/serum ferritin directly measures brain iron/i)
  })

  it('attributes the pediatric ferritin threshold to RLS rather than inventing an ADHD target', () => {
    const text = read()

    expect(text).toContain('40981213')
    expect(text).toContain('36924608')
    expect(text).toMatch(/RLS prevalence ranging from 11% to 54%/i)
    expect(text).toMatch(/children with RLS and ferritin <50 ng\/mL/i)
    expect(text).toMatch(/recommendation is conditional and based on very-low-certainty evidence/i)
    expect(text).toMatch(/threshold belongs to pediatric RLS care/i)
    expect(text).toMatch(/not an established universal ferritin target for ADHD/i)
    expect(text).toMatch(/ferritin should be pushed above 50, 75, or 100 ng\/mL to improve ADHD/i)
  })

  it('preserves iron toxicity and no-universal-dose boundaries', () => {
    const text = read()

    expect(text).toMatch(/Iron can be dangerous when unnecessary or excessive/i)
    expect(text).toMatch(/acute poisoning risk, especially in children/i)
    expect(text).toMatch(/iron overload when supplementation is unnecessary or prolonged/i)
    expect(text).toMatch(/Research doses are study exposure, not personal dosing instructions/i)
    expect(text).toMatch(/does not convert pediatric trial regimens, RLS protocols, or deficiency-treatment guidelines into a universal ADHD dose/i)
    expect(text).toMatch(/iron improves ADHD in iron-replete people/i)
  })
})
