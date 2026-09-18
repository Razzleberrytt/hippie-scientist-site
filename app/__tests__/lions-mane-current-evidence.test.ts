import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const PAGE = path.join(
  process.cwd(),
  'content/articles/lions-mane-mushroom-benefits-mechanisms-dosage-evidence-guide.md',
)

function source() {
  return fs.readFileSync(PAGE, 'utf8').replace(/\s+/g, ' ')
}

describe("Lion's Mane evidence calibration", () => {
  it('keeps the review current without raising the evidence grade', () => {
    const text = source()

    expect(text).toContain("updatedAt: '2026-09-18'")
    expect(text).toContain('evidence_grade: mixed-human-evidence')
    for (const pmid of ['40959699', '40276537', '38004235']) {
      expect(text).toContain(pmid)
    }
    expect(text).toContain('10.3389/fntpr.2026.1872464')
    expect(text).toContain('10.64898/2026.04.13.26350781')
    expect(text).toContain('/info/methodology/')
  })

  it('keeps the 2026 preprint visibly lower-weight and conflict-bounded', () => {
    const text = source()

    expect(text).toMatch(/preprint and has not been peer reviewed/i)
    expect(text).toMatch(/109 adults ages 40–75/i)
    expect(text).toMatch(/most other cognitive tasks and the composite did not show significant between-group differences/i)
    expect(text).toMatch(/funded by M2 Ingredients/i)
    expect(text).toMatch(/M2 Ingredients authors/i)
    expect(text).toMatch(/does .*not.* raise the evidence grade/i)
  })

  it('does not convert task-level signals into broad nootropic efficacy', () => {
    const text = source()

    expect(text).toMatch(/no convincing broad cognitive-enhancement effect/i)
    expect(text).toMatch(/isolated test result should not be converted into a claim of broad cognitive enhancement/i)
    expect(text).toMatch(/emerging, product-specific evidence/i)
    expect(text).toMatch(/not as grounds to raise the evidence grade or claim broad nootropic efficacy/i)
  })

  it('keeps trial doses as preparation-specific study context rather than a protocol', () => {
    const text = source()

    expect(text).toMatch(/There is no validated personal dose/i)
    expect(text).toMatch(/study descriptors, not a universal prescription/i)
    expect(text).toMatch(/2 g\/day combined fruiting-body (?:\+|and) mycelial biomass for 8 weeks/i)
    expect(text).toMatch(/not peer reviewed and not a universal dose/i)
    expect(text).toMatch(/A standard “1–3 g\/day” dose that fits every product/i)
  })

  it('preserves long-term safety and interaction uncertainty', () => {
    const text = source()

    expect(text).toMatch(/one year or longer of use/i)
    expect(text).toMatch(/pregnancy or lactation/i)
    expect(text).toMatch(/medication interactions/i)
    expect(text).toMatch(/mushroom allergy/i)
    expect(text).toMatch(/does not label those combinations as proven safe or proven harmful/i)
  })

  it('keeps mechanism and ADHD claims bounded', () => {
    const text = source()

    expect(text).toMatch(/Mechanism should explain .*why a question is worth testing.* not substitute for the test/i)
    expect(text).toMatch(/No evidence establishes Lion's Mane as an ADHD treatment/i)
    expect(text).not.toMatch(/Lion's Mane treats ADHD/i)
    expect(text).toMatch(/A guaranteed “NGF boost” in a person taking a retail capsule/i)
  })
})
