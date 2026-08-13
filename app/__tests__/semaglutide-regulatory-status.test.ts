import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const readGuide = () => fs
  .readFileSync(path.join(process.cwd(), 'app/guides/other/semaglutide/page.tsx'), 'utf8')
  .replace(/\s+/g, ' ')

describe('semaglutide regulatory status', () => {
  it('keeps 503A patient-specific rules distinct from 503B bulk-compounding rules', () => {
    const page = readGuide()

    expect(page).toContain('Section 503A pharmacies and physicians')
    expect(page).toContain('Section 503B outsourcing facilities')
    expect(page).toMatch(/restriction against regularly or in inordinate amounts compounding products that are essentially copies/i)
    expect(page).not.toMatch(/generally need an individualized, physician-documented clinical justification/i)
  })

  it('describes the April 2026 503B action as a proposal rather than a final exclusion', () => {
    const page = readGuide()

    expect(page).toContain('on April 30, 2026, FDA proposed excluding semaglutide')
    expect(page).toMatch(/proposal rather than a final blanket rule/i)
    expect(page).not.toMatch(/FDA finally excluded semaglutide/i)
  })

  it('keeps approved semaglutide evidence separate from compounded-product status', () => {
    const page = readGuide()

    expect(page).toMatch(/Compounded semaglutide is not FDA-approved/i)
    expect(page).toMatch(/clinical-trial evidence for branded, FDA-approved semaglutide does not establish equivalent quality/i)
    expect(page).toContain('shortage was resolved on February 21, 2025')
  })
})
