import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const PAGE = path.join(process.cwd(), 'app/guides/anxiety/best-herbs-for-anxiety/page.tsx')

function source() {
  return fs.readFileSync(PAGE, 'utf8').replace(/\s+/g, ' ')
}

describe('best herbs for anxiety evidence calibration', () => {
  it('anchors the comparison to direct current evidence', () => {
    const text = source()
    for (const pmid of ['36717399', '24456909', '39348746', '11679026', '31813230']) {
      expect(text).toContain(pmid)
    }
    expect(text).toMatch(/Silexan|lavender/i)
    expect(text).toMatch(/ashwagandha/i)
    expect(text).toMatch(/passionflower/i)
    expect(text).toMatch(/kava/i)
    expect(text).toMatch(/const DATE\s*=\s*['"]2026-08-\d{2}['"]/i)
    expect(text).toContain('dateModified={DATE}')
  })

  it('keeps formulation-specific evidence and commercial context visible', () => {
    const text = source()
    expect(text).toMatch(/Silexan|oral lavender/i)
    expect(text).toMatch(/proprietary|standardized|studied.*preparation/i)
    expect(text).toMatch(/manufacturer|industry|financial/i)
  })

  it('does not restore same-day rankings or treatment-like shortcuts', () => {
    const text = source()
    expect(text).not.toMatch(/Fastest useful choice/i)
    expect(text).not.toMatch(/Best herb choice/i)
    expect(text).not.toMatch(/Same-day calming:/i)
    expect(text).not.toMatch(/comparable to oxazepam/i)
    expect(text).not.toMatch(/Addresses root HPA dysregulation/i)
    expect(text).not.toMatch(/best for acute anxiety/i)
  })

  it('keeps passionflower and kava uncertainty and safety explicit', () => {
    const text = source()
    expect(text).toMatch(/passionflower/i)
    expect(text).toMatch(/kava/i)
    expect(text).toMatch(/limited|preliminary|small|uncertain/i)
    expect(text).toMatch(/liver/i)
  })

  it('preserves explicit care-escalation and medication boundaries', () => {
    const text = source()
    expect(text).toMatch(/persistent or impairing anxiety deserves evidence-based mental-health care/i)
    expect(text).toMatch(/prescribed|medication|clinician/i)
  })

  it('keeps broad comparison monetization from silently choosing a winner', () => {
    const text = source()
    expect(text).not.toContain('RecommendationSection')
    expect(text).not.toContain('getRevenueProductSet')
    expect(text).toMatch(/EmailCapture|NewsletterCtaBlock/)
  })

  it('preserves evidence discovery across the anxiety cluster', () => {
    const text = source()
    expect(text).toContain('/guides/anxiety/')
    expect(text).toMatch(/l-theanine|ashwagandha|kava/i)
  })
})
