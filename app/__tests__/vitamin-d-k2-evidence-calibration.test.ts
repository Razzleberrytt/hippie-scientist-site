import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const PAGE = 'app/guides/other/vitamin-d-k2-guide/page.tsx'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('vitamin D and K2 evidence calibration', () => {
  it('does not restore universal high-dose or target-level advice', () => {
    const source = read(PAGE)

    expect(source).not.toContain('Take 2,000-5,000 IU vitamin D3')
    expect(source).not.toContain('target 40-60 ng/mL')
    expect(source).not.toContain('Above 40 ng/mL is optimal')
    expect(source).not.toContain('most important vitamin pairing')
    expect(source).toContain('4,000 IU is an upper intake limit for adults, not a routine target')
    expect(source).toContain('no universal “optimal” 25(OH)D target')
  })

  it('keeps the vitamin K2 cardiovascular boundary explicit', () => {
    const source = read(PAGE)

    expect(source).toContain('does not prove that adding K2 to vitamin D prevents arterial calcification')
    expect(source).toContain('the cardiovascular role of vitamin K supplementation remains unclear')
    expect(source).toContain('Warfarin and similar anticoagulants')
  })

  it('uses current official evidence anchors and avoids one-sided commerce', () => {
    const source = read(PAGE)

    expect(source).toContain('ods.od.nih.gov/factsheets/VitaminD-HealthProfessional/')
    expect(source).toContain('10.1210/clinem/dgae290')
    expect(source).toContain('ods.od.nih.gov/factsheets/VitaminK-HealthProfessional/')
    expect(source).not.toContain('RecommendationSection')
    expect(source).not.toContain('getRevenueProductSet')
    expect(source).toContain('<References refs={VITAMIN_D_K_REFS} />')
  })
})
