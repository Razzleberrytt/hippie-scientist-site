import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const PAGE = 'app/guides/other/iron-supplement-guide/page.tsx'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('iron supplement evidence calibration', () => {
  it('does not restore a universal diagnosis or self-treatment protocol', () => {
    const source = read(PAGE)

    expect(source).not.toContain('If ferritin is below 30 ng/mL')
    expect(source).not.toContain('25-50 mg/day + vitamin C 200 mg')
    expect(source).not.toContain('bisglycinate 25-50 mg every other day')
    expect(source).not.toContain('Iron Bisglycinate')
    expect(source).toContain('There is no single ferritin cutoff that diagnoses iron deficiency in every clinical context')
    expect(source).toContain('treatment dose should follow the diagnosis, cause, severity, and response')
  })

  it('keeps formulation, excess-iron, and medication boundaries explicit', () => {
    const source = read(PAGE)

    expect(source).toContain('No single oral iron formulation has a proven overall advantage')
    expect(source).toContain('45 mg per day is the adult tolerable upper intake level, not a treatment ceiling')
    expect(source).toContain('levothyroxine')
    expect(source).toContain('levodopa')
  })

  it('uses current guidance and avoids product-selling inside a deficiency guide', () => {
    const source = read(PAGE)

    expect(source).toContain('ods.od.nih.gov/factsheets/Iron-HealthProfessional/')
    expect(source).toContain('gastro.org/clinical-guidance/management-of-iron-deficiency-anemia/')
    expect(source).toContain('gastro.org/clinical-guidance/gastrointestinal-evaluation-of-iron-deficiency-anemia/')
    expect(source).not.toContain('RecommendationSection')
    expect(source).not.toContain('getRevenueProductSet')
    expect(source).toContain('<References refs={IRON_REFS} />')
  })
})
