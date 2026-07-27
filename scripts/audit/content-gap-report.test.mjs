import { describe, it, expect } from 'vitest'
import { checkSafety, loadDocumentedSafetyExceptions } from './content-gap-report.mjs'

describe('content-gap-report safety checks', () => {
  it('treats empty/placeholder contraindications as not filled', () => {
    expect(checkSafety('')).toBe(false)
    expect(checkSafety(undefined)).toBe(false)
    expect(checkSafety('safety review pending')).toBe(false)
    expect(checkSafety([])).toBe(false)
  })

  it('treats real prose as filled', () => {
    expect(checkSafety('Avoid combining with anticoagulants.')).toBe(true)
    expect(checkSafety(['Avoid combining with anticoagulants.'])).toBe(true)
  })

  it('loads documented evidence-limited safety exceptions from both governance ledgers', () => {
    const slugs = loadDocumentedSafetyExceptions()
    // These slugs are reviewed, deliberate abstentions recorded in
    // data-sources/safety-evidence-limited*-exceptions.json — an empty
    // contraindications_or_flags field for them is not a real content gap.
    expect(slugs.has('gingerol')).toBe(true)
    expect(slugs.has('creatine')).toBe(true)
    expect(slugs.size).toBeGreaterThan(0)
  })
})
