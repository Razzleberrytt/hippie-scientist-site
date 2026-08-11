import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const source = fs.readFileSync(
  path.join(process.cwd(), 'app/guides/anxiety/l-theanine-for-anxiety/page.tsx'),
  'utf8',
)

describe('L-theanine anxiety guide evidence discipline', () => {
  it('anchors the page to the 2026 randomized-trial meta-analysis', () => {
    expect(source).toContain('https://pubmed.ncbi.nlm.nih.gov/42410082/')
    expect(source).toContain('31 randomized trials')
    expect(source).toContain('1,168 participants')
    expect(source).toContain('inconsistent and not significant overall')
  })

  it('does not market a preferred anxiety use case or guaranteed rapid calm', () => {
    expect(source).not.toContain('Best fit')
    expect(source).not.toContain('fast, non-sedating calm')
    expect(source).not.toContain('support for overarousal')
    expect(source).not.toContain('L-theanine is most rational')
    expect(source).toContain('the evidence does not establish it as an anxiety treatment')
  })

  it('keeps studied doses separate from dosing instructions', () => {
    expect(source).not.toContain('Situational anxiety</h3>')
    expect(source).toContain('There is no established treatment dose for anxiety')
    expect(source).toContain('study design detail, not a guaranteed onset or anxiety-relief dose')
  })

  it('does not publish unsupported medication-interaction rules', () => {
    expect(source).not.toContain('Caution is advised with medications that affect blood pressure or sedation')
    expect(source).not.toContain('Use extra caution with prescription stimulants or psychiatric medications')
    expect(source).toContain('Medication and supplement interaction evidence is incomplete')
  })

  it('preserves one curated commercial handoff and review-date history', () => {
    expect(source).toContain('<RecommendationSection')
    expect(source).not.toContain('amazon.com/s?k=')
    expect(source).toContain("const DATE = '2026-08-02'")
    expect(source).toContain("const UPDATED_DATE = '2026-08-11'")
    expect(source).toContain('updated: UPDATED_DATE')
  })
})
