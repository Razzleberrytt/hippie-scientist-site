import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const page = readFileSync(
  path.join(process.cwd(), 'app/guides/compare/melatonin-vs-magnesium/page.tsx'),
  'utf8',
)

describe('melatonin versus magnesium evidence-integrity contract', () => {
  it('does not infer unsupported restless-legs or magnesium-glycinate superiority benefits', () => {
    expect(page).not.toMatch(/restless legs/i)
    expect(page).not.toMatch(/magnesium glycinate is usually the better/i)
    expect(page).toContain('do not specifically validate magnesium glycinate')
  })

  it('makes the non-head-to-head and multi-ingredient limitations explicit', () => {
    expect(page).toContain('No cited trial directly compares melatonin against magnesium')
    expect(page).toContain('melatonin, magnesium, and zinc together')
    expect(page).toContain('magnesium citrate')
  })

  it('does not advertise unmatched-dose products or sticky affiliate picks', () => {
    expect(page).not.toMatch(/RecommendationSection|ConversionStickyCTA|getRevenueProductSet/)
    expect(page).not.toMatch(/Natrol|best overall/i)
    expect(page).toContain('Product recommendations are omitted here')
  })

  it('includes safety, first-line insomnia care, and canonical evidence links', () => {
    expect(page).toContain('CBT-I')
    expect(page).toContain('anticoagulants')
    expect(page).toContain('quinolones')
    expect(page).toContain('350 mg/day')
    expect(page).toContain('https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/')
    expect(page).toContain('https://www.nccih.nih.gov/health/sleep-disorders-and-complementary-health-approaches')
    expect(page).toContain("path: '/guides/compare/melatonin-vs-magnesium/'")
  })
})
